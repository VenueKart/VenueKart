import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendOTPEmail } from '../services/emailService.js';
import User from '../models/User.js';
import OtpVerification from '../models/OtpVerification.js';
import RefreshToken from '../models/RefreshToken.js';

const router = Router();

// Google OAuth routes
router.get('/google', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const scope = 'openid email profile';
  if (!clientId) return res.status(500).send('Missing GOOGLE_CLIENT_ID');

  // Compute redirect URI dynamically based on current host
  const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;

  const requestedUserType = req.query.userType || 'customer';
  const userType = ['customer', 'venue-owner'].includes(requestedUserType) ? requestedUserType : 'customer';
  const openerOrigin = req.query.origin || '';

  // Include userType and openerOrigin in state so callback can postMessage to correct opener
  const stateObj = { userType, origin: openerOrigin };
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code&access_type=offline&prompt=consent&state=${encodeURIComponent(JSON.stringify(stateObj))}`;
  return res.redirect(authUrl);
});

router.get('/google/callback', async (req, res) => {
  try {
    const { code, error, state } = req.query;
    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
    const envOrigins = [process.env.CORS_ALLOWED_ORIGINS, process.env.FRONTEND_URL, process.env.CLIENT_URL]
      .filter(Boolean)
      .flatMap(v => v.split(',').map(s => s.trim()).filter(Boolean));

    // Prefer origin passed in state (from opener) if it's in allowed env origins
    let userType = 'customer';
    let stateOrigin = '';
    if (state) {
      try {
        const s = JSON.parse(decodeURIComponent(state));
        userType = ['customer', 'venue-owner'].includes(s.userType) ? s.userType : 'customer';
        stateOrigin = s.origin || '';
      } catch (err) {
        // ignore
      }
    }

    const referer = req.get('referer') || '';
    let refererOrigin = '';
    try { refererOrigin = new URL(referer).origin; } catch {}

    const candidateOrigins = [stateOrigin, refererOrigin, ...(envOrigins.length ? envOrigins : [])].filter(Boolean);
    const targetOrigin = candidateOrigins.find(o => envOrigins.includes(o)) || candidateOrigins[0] || (envOrigins[0] || 'http://localhost:5173');
    if (error || !code) {
      return res.send(`
        <script>
          if (window.opener && !window.opener.closed) {
            try {
              window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: 'oauth_failed' }, '${targetOrigin}');
              setTimeout(() => window.close(), 100);
            } catch (error) {
              try { window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: 'oauth_failed' }, '*'); setTimeout(() => window.close(), 100); } catch (err) { window.location.href = '${process.env.CLIENT_URL}/signin?error=oauth_failed'; }
            }
          } else { window.location.href = '${process.env.CLIENT_URL}/signin?error=oauth_failed'; }
        </script>
      `);
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, code, grant_type: 'authorization_code', redirect_uri: redirectUri })
    });
    const tokens = await tokenResponse.json();
    if (!tokenResponse.ok) return res.redirect(`${process.env.CLIENT_URL}/signin?error=oauth_failed`);

    const userResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`);
    const googleUser = await userResponse.json();
    if (!userResponse.ok) return res.redirect(`${process.env.CLIENT_URL}/signin?error=oauth_failed`);

    let user = await User.findOne({ email: googleUser.email });
    if (!user) {
      user = await User.create({ google_id: googleUser.id, email: googleUser.email, name: googleUser.name, profile_picture: googleUser.picture, user_type: userType, is_verified: true });
    } else {
      if (!user.google_id) {
        user.google_id = googleUser.id;
        user.profile_picture = googleUser.picture;
        user.is_verified = true;
        await user.save();
      }
    }

    const accessToken = generateAccessToken({ id: user.id, email: user.email, user_type: user.user_type });
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({ user_id: user.id, token: refreshToken, expires_at: expiresAt });

    res.send(`
      <script>
        if (window.opener && !window.opener.closed) {
          try {
            window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', accessToken: '${accessToken}', refreshToken: '${refreshToken}' }, '${targetOrigin}');
            setTimeout(() => { window.close(); }, 100);
          } catch (error) {
            try { window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', accessToken: '${accessToken}', refreshToken: '${refreshToken}' }, '*'); setTimeout(() => { window.close(); }, 100); } catch (err) { window.location.href='${process.env.CLIENT_URL}/?access_token=${accessToken}&refresh_token=${refreshToken}'; }
          }
        } else { window.location.href='${process.env.CLIENT_URL}/?access_token=${accessToken}&refresh_token=${refreshToken}'; }
      </script>
    `);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.send(`
      <script>
        if (window.opener && !window.opener.closed) {
          try {
            window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: 'oauth_failed' }, '${targetOrigin}');
            setTimeout(() => window.close(), 100);
          } catch (error) {
            try { window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: 'oauth_failed' }, '*'); setTimeout(() => window.close(), 100); } catch (err) { window.location.href = '${process.env.CLIENT_URL}/signin?error=oauth_failed'; }
          }
        } else { window.location.href = '${process.env.CLIENT_URL}/signin?error=oauth_failed'; }
      </script>
    `);
  }
});

// User Registration with OTP verification
router.post('/register', async (req, res) => {
  try {
    const { email, name, userType = 'customer', password = null, mobileNumber = null } = req.body;
    if (!email || !name) return res.status(400).json({ error: 'Email and name are required' });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ error: 'Please enter a valid email address' });
    if (!['customer', 'venue-owner'].includes(userType)) return res.status(400).json({ error: 'Invalid user type' });
    if (userType === 'venue-owner' && !password) return res.status(400).json({ error: 'Password is required for venue owners' });
    if (password && password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    if (mobileNumber) {
      const digits = String(mobileNumber).replace(/\D/g, '');
      let d = digits;
      if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
      if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
      if (d.length < 10) return res.status(400).json({ error: 'Phone number is too short. Enter exactly 10 digits.' });
      if (d.length > 10) return res.status(400).json({ error: 'Phone number is too long. Enter exactly 10 digits.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      if (existing.is_verified) return res.status(400).json({ error: 'Email is already registered' });
      await User.deleteOne({ _id: existing._id });
      await OtpVerification.deleteMany({ email });
    }

    const passwordHash = password ? await bcrypt.hash(password, 12) : null;
    await User.create({ email, name, password_hash: passwordHash, mobile_number: mobileNumber, user_type: userType, is_verified: false });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await OtpVerification.create({ email, otp, expires_at: expiresAt });

    await sendOTPEmail(email, otp, name, 'Account Verification');

    res.status(201).json({ message: 'Registration successful! Please check your email for the verification code.', email });
  } catch (error) {
    console.error('Registration error details:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Verify OTP and complete registration
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    const otpRow = await OtpVerification.findOne({ email, otp, expires_at: { $gt: new Date() } }).sort({ created_at: -1 }).lean();
    if (!otpRow) return res.status(400).json({ error: 'Invalid or expired OTP' });

    const user = await User.findOneAndUpdate({ email, is_verified: false }, { $set: { is_verified: true } }, { new: true, projection: { password_hash: 0 } });
    if (!user) return res.status(404).json({ error: 'User not found or already verified' });

    await OtpVerification.deleteMany({ email });

    const accessToken = generateAccessToken({ id: user.id, email: user.email, user_type: user.user_type });
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({ user_id: user.id, token: refreshToken, expires_at: expiresAt });

    res.json({
      message: 'Email verified successfully!',
      user: { id: user.id, email: user.email, name: user.name, userType: user.user_type, profilePicture: user.profile_picture },
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
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email, is_verified: false }).lean();
    if (!user) return res.status(404).json({ error: 'User not found or already verified' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OtpVerification.deleteMany({ email });
    await OtpVerification.create({ email, otp, expires_at: expiresAt });

    const emailSent = await sendOTPEmail(email, otp, user.name, 'Account Verification');
    if (!emailSent) return res.status(500).json({ error: 'Failed to send verification email' });

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
    if (refreshToken) await RefreshToken.deleteOne({ token: refreshToken });
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
    if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) return res.status(403).json({ error: 'Invalid refresh token' });

    const tokenRow = await RefreshToken.findOne({ token: refreshToken, expires_at: { $gt: new Date() } }).lean();
    if (!tokenRow) return res.status(403).json({ error: 'Refresh token expired or not found' });

    const user = await User.findById(decoded.id).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const newAccessToken = generateAccessToken({ id: user._id.toString(), email: user.email, user_type: user.user_type });
    res.json({ accessToken: newAccessToken, message: 'Token refreshed successfully' });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// Password-based login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ email, is_verified: true }).lean();
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    if (!user.password_hash) return res.status(401).json({ error: 'This account uses social login. Please sign in with Google.' });

    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) return res.status(401).json({ error: 'Invalid email or password' });

    const accessToken = generateAccessToken({ id: user._id.toString(), email: user.email, user_type: user.user_type });
    const refreshToken = generateRefreshToken({ id: user._id.toString(), email: user.email });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({ user_id: user._id, token: refreshToken, expires_at: expiresAt });

    res.json({
      message: 'Login successful',
      user: { id: user._id.toString(), email: user.email, name: user.name, userType: user.user_type, profilePicture: user.profile_picture },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: `Login failed: ${error.message}` });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id, { email: 1, name: 1, user_type: 1, profile_picture: 1, mobile_number: 1, is_verified: 1 }).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user._id.toString(), email: user.email, name: user.name, userType: user.user_type, profilePicture: user.profile_picture, mobileNumber: user.mobile_number, isVerified: user.is_verified });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// Forgot password - send OTP for password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email, is_verified: true }).lean();
    if (!user) return res.status(404).json({ error: "Email doesn't exist in our records" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await OtpVerification.deleteMany({ email });
    await OtpVerification.create({ email, otp, expires_at: expiresAt });

    const emailSent = await sendOTPEmail(email, otp, user.name, 'Password Reset');
    if (!emailSent) return res.status(500).json({ error: 'Failed to send reset email' });

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
    if (!email || !otp || !newPassword) return res.status(400).json({ error: 'Email, OTP, and new password are required' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters long' });

    const otpRow = await OtpVerification.findOne({ email, otp, expires_at: { $gt: new Date() } }).sort({ created_at: -1 }).lean();
    if (!otpRow) return res.status(400).json({ error: 'Invalid or expired OTP' });

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await User.updateOne({ email }, { $set: { password_hash: passwordHash } });
    await OtpVerification.deleteMany({ email });

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
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    const otpRow = await OtpVerification.findOne({ email, otp, expires_at: { $gt: new Date() } }).sort({ created_at: -1 }).lean();
    if (!otpRow) return res.status(400).json({ error: 'Invalid or expired OTP' });

    const pendingData = JSON.parse(otpRow.pending_data || '{}');
    const { userId, name, mobileNumber, password } = pendingData;

    const update = { name, email };
    if (mobileNumber) update.mobile_number = String(mobileNumber).replace(/\D/g, '').replace(/^91/, '').replace(/^0/, '');
    if (password) update.password_hash = await bcrypt.hash(password, 12);

    await User.updateOne({ _id: userId }, { $set: update });
    await OtpVerification.deleteMany({ email });

    const updatedUser = await User.findById(userId, { email: 1, name: 1, user_type: 1, profile_picture: 1, mobile_number: 1, is_verified: 1 }).lean();
    res.json({ message: 'Email verified and profile updated successfully', user: { id: updatedUser._id.toString(), email: updatedUser.email, name: updatedUser.name, userType: updatedUser.user_type, profilePicture: updatedUser.profile_picture, mobileNumber: updatedUser.mobile_number, isVerified: updatedUser.is_verified } });
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
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ error: 'Invalid email format' });

    // Normalize phone number: keep digits, drop +91 or leading 0
    let normalizedPhone = null;
    if (mobileNumber) {
      const digits = String(mobileNumber).replace(/\D/g, '');
      let d = digits;
      if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
      if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
      if (d.length < 10) return res.status(400).json({ error: 'Phone number is too short. Enter exactly 10 digits.' });
      if (d.length > 10) return res.status(400).json({ error: 'Phone number is too long. Enter exactly 10 digits.' });
      normalizedPhone = d;
    }

    const current = await User.findById(userId, { email: 1 }).lean();
    const currentEmail = current?.email;
    const emailChanged = email !== currentEmail;

    if (emailChanged) {
      const exists = await User.findOne({ email, _id: { $ne: userId } }, { _id: 1 }).lean();
      if (exists) return res.status(400).json({ error: 'Email is already taken by another user' });

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await OtpVerification.deleteMany({ email });
      await OtpVerification.create({ email, otp, expires_at: expiresAt, pending_data: JSON.stringify({ userId, name, email, mobileNumber: normalizedPhone, password }) });

      const emailSent = await sendOTPEmail(email, otp, name, 'Email Update Verification');
      if (!emailSent) return res.status(500).json({ error: 'Failed to send verification email' });

      return res.json({ requiresVerification: true, newEmail: email, message: 'Verification code sent to your new email address' });
    }

    const update = { name };
    if (normalizedPhone) update.mobile_number = normalizedPhone;
    if (password) update.password_hash = await bcrypt.hash(password, 12);
    await User.updateOne({ _id: userId }, { $set: update });

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
