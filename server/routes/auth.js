import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendOTPEmail } from '../services/emailService.js';

const router = Router();

// Google OAuth routes
router.get('/google', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI; // e.g. http://localhost:8081/api/auth/google/callback
  const scope = 'openid email profile'; // include openid for ID token

  // Hard fail early if any critical env is missing
  if (!clientId) return res.status(500).send('Missing GOOGLE_CLIENT_ID');
  if (!redirectUri) return res.status(500).send('Missing GOOGLE_REDIRECT_URI');

  // Validate and set userType
  const requestedUserType = req.query.userType || 'customer';
  const userType = ['customer', 'venue-owner'].includes(requestedUserType) ? requestedUserType : 'customer';

  console.log(`Google OAuth initiated with userType: ${userType} (requested: ${requestedUserType})`);
  console.log(`Using redirectUri: ${redirectUri}`);

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(clientId)}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent(scope)}&` +
    `response_type=code&` +
    `access_type=offline&` +
    `prompt=consent&` +
    `state=${encodeURIComponent(JSON.stringify({ userType }))}`;

  return res.redirect(authUrl);
});

router.get('/google/callback', async (req, res) => {
  try {
    const { code, error, state } = req.query;

    // Parse userType from state parameter
    let userType = 'customer'; // default
    if (state) {
      try {
        const stateData = JSON.parse(decodeURIComponent(state));
        const requestedUserType = stateData.userType || 'customer';
        // Validate userType
        userType = ['customer', 'venue-owner'].includes(requestedUserType) ? requestedUserType : 'customer';
        console.log(`Google OAuth callback - userType from state: ${userType} (requested: ${requestedUserType})`);
      } catch (parseError) {
        console.log('Could not parse state parameter:', parseError);
      }
    } else {
      console.log('No state parameter received, using default userType: customer');
    }
    
    if (error || !code) {
      return res.send(`
        <script>
          if (window.opener && !window.opener.closed) {
            try {
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_ERROR',
                error: 'oauth_failed'
              }, '${process.env.CLIENT_URL}');
              setTimeout(() => window.close(), 100);
            } catch (error) {
              window.location.href = '${process.env.CLIENT_URL}/signin?error=oauth_failed';
            }
          } else {
            window.location.href = '${process.env.CLIENT_URL}/signin?error=oauth_failed';
          }
        </script>
      `);
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokens);
      return res.redirect(`${process.env.CLIENT_URL}/signin?error=oauth_failed`);
    }

    // Get user info from Google
    const userResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`);
    const googleUser = await userResponse.json();

    if (!userResponse.ok) {
      console.error('Failed to get user info:', googleUser);
      return res.redirect(`${process.env.CLIENT_URL}/signin?error=oauth_failed`);
    }

    // Check if user exists
    let [userRows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [googleUser.email]
    );

    let user;
    if (userRows.length === 0) {
      // Create new user with the specified user type
      console.log(`Creating new user via Google OAuth with userType: ${userType} for email: ${googleUser.email}`);
      const [result] = await pool.execute(
        'INSERT INTO users (google_id, email, name, profile_picture, user_type, is_verified) VALUES (?, ?, ?, ?, ?, ?)',
        [googleUser.id, googleUser.email, googleUser.name, googleUser.picture, userType, true]
      );

      user = {
        id: result.insertId,
        google_id: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        profile_picture: googleUser.picture,
        user_type: userType,
        is_verified: true
      };
    } else {
      user = userRows[0];
      // Update Google ID and profile picture if not set
      if (!user.google_id) {
        await pool.execute(
          'UPDATE users SET google_id = ?, profile_picture = ?, is_verified = true WHERE id = ?',
          [googleUser.id, googleUser.picture, user.id]
        );
        user.google_id = googleUser.id;
        user.profile_picture = googleUser.picture;
        user.is_verified = true;
      }
    }

    // Generate our own tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await pool.execute(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, refreshToken, expiresAt]
    );

    // For popup window, close popup and pass tokens to parent
    res.send(`
      <script>
        console.log('Google auth callback successful');

        // Store tokens in parent window
        if (window.opener && !window.opener.closed) {
          try {
            window.opener.postMessage({
              type: 'GOOGLE_AUTH_SUCCESS',
              accessToken: '${accessToken}',
              refreshToken: '${refreshToken}'
            }, '${process.env.CLIENT_URL}');

            // Give a moment for message to be processed
            setTimeout(() => {
              window.close();
            }, 100);
          } catch (error) {
            console.error('Error posting message to parent:', error);
            // Fallback: redirect normally
            window.location.href = '${process.env.CLIENT_URL}/?access_token=${accessToken}&refresh_token=${refreshToken}';
          }
        } else {
          // Fallback: redirect normally if not in popup
          window.location.href = '${process.env.CLIENT_URL}/?access_token=${accessToken}&refresh_token=${refreshToken}';
        }
      </script>
    `);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.send(`
      <script>
        if (window.opener && !window.opener.closed) {
          try {
            window.opener.postMessage({
              type: 'GOOGLE_AUTH_ERROR',
              error: 'oauth_failed'
            }, '${process.env.CLIENT_URL}');
            setTimeout(() => window.close(), 100);
          } catch (error) {
            window.location.href = '${process.env.CLIENT_URL}/signin?error=oauth_failed';
          }
        } else {
          window.location.href = '${process.env.CLIENT_URL}/signin?error=oauth_failed';
        }
      </script>
    `);
  }
});

// User Registration with OTP verification
router.post('/register', async (req, res) => {
  try {
    console.log('Registration request received:', {
      body: { ...req.body, password: req.body.password ? '[PROVIDED]' : null },
      headers: req.headers['content-type']
    });

    const { email, name, userType = 'customer', password = null, mobileNumber = null } = req.body;

    console.log('Extracted data:', { email, name, userType, password: password ? '[PROVIDED]' : null, mobileNumber });

    // Validation
    if (!email || !name) {
      console.log('Validation failed: Email or name missing');
      return res.status(400).json({ error: 'Email and name are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Validation failed: Invalid email format');
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    if (!['customer', 'venue-owner'].includes(userType)) {
      console.log('Validation failed: Invalid user type:', userType);
      return res.status(400).json({ error: 'Invalid user type' });
    }

    if (userType === 'venue-owner' && !password) {
      console.log('Validation failed: Password required for venue owner');
      return res.status(400).json({ error: 'Password is required for venue owners' });
    }

    if (password && password.length < 6) {
      console.log('Validation failed: Password too short');
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    if (mobileNumber && !/^[0-9]{10}$/.test(mobileNumber.replace(/\s+/g, ''))) {
      console.log('Validation failed: Invalid mobile number');
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number' });
    }

    console.log('All validations passed, proceeding with registration');

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      if (existingUsers[0].is_verified) {
        return res.status(400).json({ error: 'Email is already registered' });
      } else {
        // Delete unverified user to allow re-registration
        await pool.execute('DELETE FROM users WHERE email = ? AND is_verified = FALSE', [email]);
      }
    }

    // Hash password if provided
    let passwordHash = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, 12);
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store user temporarily (unverified)
    const [result] = await pool.execute(
      'INSERT INTO users (email, name, password_hash, mobile_number, user_type, is_verified) VALUES (?, ?, ?, ?, ?, FALSE)',
      [email, name, passwordHash, mobileNumber, userType]
    );

    // Store OTP
    await pool.execute('DELETE FROM otp_verifications WHERE email = ?', [email]);
    await pool.execute(
      'INSERT INTO otp_verifications (email, otp, expires_at) VALUES (?, ?, ?)',
      [email, otp, expiresAt]
    );

    // Send OTP email
    console.log('Attempting to send OTP email...');
    const emailSent = await sendOTPEmail(email, otp, name, 'Account Verification');
    console.log('Email sent result:', emailSent);

    if (!emailSent) {
      console.log('Email sending failed, but continuing with registration for debugging...');
      console.log('In production, this would clean up and return an error');
      // Temporarily commenting out cleanup for debugging
      // await pool.execute('DELETE FROM users WHERE id = ?', [result.insertId]);
      // await pool.execute('DELETE FROM otp_verifications WHERE email = ?', [email]);
      // return res.status(500).json({ error: 'Failed to send verification email' });
    }

    console.log('Registration completed successfully');
    res.status(201).json({
      message: 'Registration successful! Please check your email for the verification code.',
      email: email
    });
  } catch (error) {
    console.error('Registration error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState
    });
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Verify OTP and complete registration
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Check OTP
    const [otpRows] = await pool.execute(
      'SELECT * FROM otp_verifications WHERE email = ? AND otp = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [email, otp]
    );

    if (otpRows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Get user
    const [userRows] = await pool.execute(
      'SELECT * FROM users WHERE email = ? AND is_verified = FALSE',
      [email]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found or already verified' });
    }

    const user = userRows[0];

    // Mark user as verified
    await pool.execute(
      'UPDATE users SET is_verified = TRUE WHERE id = ?',
      [user.id]
    );

    // Delete used OTP
    await pool.execute(
      'DELETE FROM otp_verifications WHERE email = ?',
      [email]
    );

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await pool.execute(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, refreshToken, expiresAt]
    );

    res.json({
      message: 'Email verified successfully!',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.user_type,
        profilePicture: user.profile_picture
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists and is unverified
    const [userRows] = await pool.execute(
      'SELECT * FROM users WHERE email = ? AND is_verified = FALSE',
      [email]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found or already verified' });
    }

    const user = userRows[0];

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update OTP
    await pool.execute('DELETE FROM otp_verifications WHERE email = ?', [email]);
    await pool.execute(
      'INSERT INTO otp_verifications (email, otp, expires_at) VALUES (?, ?, ?)',
      [email, otp, expiresAt]
    );

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, user.name, 'Account Verification');
    
    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send verification email' });
    }

    res.json({ message: 'Verification code sent successfully!' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Failed to resend verification code' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      await pool.execute(
        'DELETE FROM refresh_tokens WHERE token = ?',
        [refreshToken]
      );
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    // Check if refresh token exists in database and is not expired
    const [tokenRows] = await pool.execute(
      'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()',
      [refreshToken]
    );

    if (tokenRows.length === 0) {
      return res.status(403).json({ error: 'Refresh token expired or not found' });
    }

    // Get user data
    const [userRows] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [decoded.id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userRows[0];

    // Generate new access token
    const newAccessToken = generateAccessToken(user);

    res.json({
      accessToken: newAccessToken,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// Password-based login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check database connection
    try {
      await pool.execute('SELECT 1');
    } catch (dbError) {
      console.error('Database connection failed:', dbError.message);
      return res.status(503).json({
        error: 'Database service unavailable. Please connect to a database service like Neon or set up MySQL.'
      });
    }

    // Get user from database
    const [userRows] = await pool.execute(
      'SELECT * FROM users WHERE email = ? AND is_verified = TRUE',
      [email]
    );

    if (userRows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userRows[0];

    // Check if user has a password (not OAuth-only user)
    if (!user.password_hash) {
      return res.status(401).json({ error: 'This account uses social login. Please sign in with Google.' });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await pool.execute(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, refreshToken, expiresAt]
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.user_type,
        profilePicture: user.profile_picture
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);

    // Provide specific error messages based on error type
    if (error.code === 'ECONNREFUSED' || error.code === 'ER_ACCESS_DENIED_ERROR') {
      return res.status(503).json({
        error: 'Database connection failed. Please ensure database is running and credentials are correct.'
      });
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(503).json({
        error: 'Database tables not found. Please initialize the database.'
      });
    } else {
      return res.status(500).json({
        error: `Login failed: ${error.message}`
      });
    }
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [userRows] = await pool.execute(
      'SELECT id, email, name, user_type, profile_picture, mobile_number, is_verified FROM users WHERE id = ?',
      [req.user.id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userRows[0];
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.user_type,
      profilePicture: user.profile_picture,
      mobileNumber: user.mobile_number,
      isVerified: user.is_verified
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// Forgot password - send OTP for password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const [userRows] = await pool.execute(
      'SELECT * FROM users WHERE email = ? AND is_verified = TRUE',
      [email]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Email doesn\'t exist in our records' });
    }

    const user = userRows[0];

    // Generate OTP for password reset
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete old OTPs and store new one
    await pool.execute('DELETE FROM otp_verifications WHERE email = ?', [email]);
    await pool.execute(
      'INSERT INTO otp_verifications (email, otp, expires_at) VALUES (?, ?, ?)',
      [email, otp, expiresAt]
    );

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, user.name, 'Password Reset');

    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send reset email' });
    }

    res.json({ message: 'Password reset code sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// Reset password with OTP
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Verify OTP
    const [otpRows] = await pool.execute(
      'SELECT * FROM otp_verifications WHERE email = ? AND otp = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [email, otp]
    );

    if (otpRows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await pool.execute(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [passwordHash, email]
    );

    // Delete used OTP
    await pool.execute(
      'DELETE FROM otp_verifications WHERE email = ?',
      [email]
    );

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Verify email update
router.post('/verify-email-update', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Check OTP and get pending data
    const [otpRows] = await pool.execute(
      'SELECT * FROM otp_verifications WHERE email = ? AND otp = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [email, otp]
    );

    if (otpRows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const pendingData = JSON.parse(otpRows[0].pending_data);
    const { userId, name, mobileNumber, password } = pendingData;

    // Prepare update fields
    let updateFields = ['name = ?', 'email = ?'];
    let updateValues = [name, email];

    if (mobileNumber) {
      updateFields.push('mobile_number = ?');
      updateValues.push(mobileNumber);
    }

    if (password) {
      const passwordHash = await bcrypt.hash(password, 12);
      updateFields.push('password_hash = ?');
      updateValues.push(passwordHash);
    }

    updateValues.push(userId);

    // Update user with new email
    await pool.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Delete used OTP
    await pool.execute(
      'DELETE FROM otp_verifications WHERE email = ?',
      [email]
    );

    // Get updated user data
    const [updatedUserRows] = await pool.execute(
      'SELECT id, email, name, user_type, profile_picture, mobile_number, is_verified FROM users WHERE id = ?',
      [userId]
    );

    const updatedUser = updatedUserRows[0];
    res.json({
      message: 'Email verified and profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        userType: updatedUser.user_type,
        profilePicture: updatedUser.profile_picture,
        mobileNumber: updatedUser.mobile_number,
        isVerified: updatedUser.is_verified
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Failed to verify email update' });
  }
});

// Update user profile
router.put('/update-profile', authenticateToken, async (req, res) => {
  try {
    const { name, email, mobileNumber, password } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate mobile number if provided
    if (mobileNumber && !/^[0-9]{10}$/.test(mobileNumber.replace(/\s+/g, ''))) {
      return res.status(400).json({ error: 'Invalid mobile number format' });
    }

    // Get current user data
    const [currentUserRows] = await pool.execute(
      'SELECT email FROM users WHERE id = ?',
      [userId]
    );

    const currentEmail = currentUserRows[0].email;
    const emailChanged = email !== currentEmail;

    // Check if email is already taken by another user
    if (emailChanged) {
      const [existingUser] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (existingUser.length > 0) {
        return res.status(400).json({ error: 'Email is already taken by another user' });
      }
    }

    // If email is being changed, require verification
    if (emailChanged) {
      // Generate OTP for email verification
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store OTP and pending changes
      await pool.execute('DELETE FROM otp_verifications WHERE email = ?', [email]);
      await pool.execute(
        'INSERT INTO otp_verifications (email, otp, expires_at, pending_data) VALUES (?, ?, ?, ?)',
        [email, otp, expiresAt, JSON.stringify({ userId, name, email, mobileNumber, password })]
      );

      // Send OTP email
      const emailSent = await sendOTPEmail(email, otp, name, 'Email Update Verification');

      if (!emailSent) {
        return res.status(500).json({ error: 'Failed to send verification email' });
      }

      return res.json({
        requiresVerification: true,
        newEmail: email,
        message: 'Verification code sent to your new email address'
      });
    }

    // If no email change, update directly
    let updateFields = ['name = ?'];
    let updateValues = [name];

    if (mobileNumber) {
      updateFields.push('mobile_number = ?');
      updateValues.push(mobileNumber);
    }

    if (password) {
      const passwordHash = await bcrypt.hash(password, 12);
      updateFields.push('password_hash = ?');
      updateValues.push(passwordHash);
    }

    updateValues.push(userId);

    await pool.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
