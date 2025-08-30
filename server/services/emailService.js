import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function sendOTPEmail(email, otp, name = 'User', purpose = 'Verification') {
  console.log('sendOTPEmail called with:', { email, purpose, name });
  console.log('Email configuration:', {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS ? '[SET]' : '[NOT SET]'
  });

  const isPasswordReset = purpose === 'Password Reset';
  const isEmailUpdate = purpose === 'Email Update';
  const mailOptions = {
    from: {
      name: 'VenueKart',
      address: process.env.EMAIL_USER
    },
    to: email,
    subject: isPasswordReset ? 'VenueKart - Password Reset Verification' :
             isEmailUpdate ? 'VenueKart - Email Address Verification' :
             'VenueKart - Account Verification',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>VenueKart Verification</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3C3B6E 0%, #6C63FF 100%); padding: 40px 30px; text-align: center;">
            <img src="https://cdn.builder.io/api/v1/image/assets%2F86425921e7704103a71faf5b04ebcd1a%2F4184ebb3262f4bbcb03f0987cf646790?format=webp&width=800" alt="VenueKart Logo" style="height: 60px; width: auto; margin: 0 0 15px 0; display: block; margin-left: auto; margin-right: auto;" />
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 600; letter-spacing: -0.5px;">VenueKart</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; font-weight: 400;">Professional Venue Solutions</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
              ${isPasswordReset ? 'Password Reset Request' : isEmailUpdate ? 'Email Verification Required' : 'Account Verification Required'}
            </h2>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              Dear ${name},
            </p>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              ${isPasswordReset
                ? 'We received a request to reset your password. Please use the verification code below to proceed with resetting your password.'
                : isEmailUpdate
                ? 'To complete the update of your email address, please verify using the code below.'
                : 'Thank you for registering with VenueKart. To activate your account, please verify your email address using the code below.'
              }
            </p>

            <!-- Verification Code -->
            <div style="text-align: center; margin: 40px 0;">
              <div style="background: #f7fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 30px; display: inline-block;">
                <p style="color: #4a5568; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Verification Code</p>
                <div style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 700; color: #3C3B6E; letter-spacing: 8px; margin: 0;">
                  ${otp}
                </div>
              </div>
            </div>

            <div style="background: #f7fafc; border-left: 4px solid #6C63FF; padding: 20px; margin: 30px 0; border-radius: 0 4px 4px 0;">
              <p style="color: #4a5568; margin: 0; font-size: 14px; line-height: 1.5;">
                <strong>Important:</strong> This verification code will expire in 10 minutes for your security. If you did not request this ${isPasswordReset ? 'password reset' : isEmailUpdate ? 'email update' : 'verification'}, please ignore this email.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #718096; margin: 0 0 10px 0; font-size: 14px;">
              This is an automated message from VenueKart. Please do not reply to this email.
            </p>
            <p style="color: #a0aec0; margin: 0; font-size: 12px;">
              © ${new Date().getFullYear()} VenueKart. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    console.log('Attempting to send OTP email...');
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    return false;
  }
}

// Send venue inquiry email to venue owner (customer contact details hidden, price removed)
export async function sendVenueInquiryEmail(ownerEmail, inquiryData) {
  const { venue, customer, event, owner } = inquiryData;

  const mailOptions = {
    from: {
      name: 'VenueKart',
      address: process.env.EMAIL_USER
    },
    to: ownerEmail,
    subject: `New Booking Inquiry - ${venue.name}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Booking Inquiry</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3C3B6E 0%, #6C63FF 100%); padding: 40px 30px; text-align: center;">
            <img src="https://cdn.builder.io/api/v1/image/assets%2F86425921e7704103a71faf5b04ebcd1a%2F4184ebb3262f4bbcb03f0987cf646790?format=webp&width=800" alt="VenueKart Logo" style="height: 60px; width: auto; margin: 0 0 15px 0; display: block; margin-left: auto; margin-right: auto;" />
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 600; letter-spacing: -0.5px;">VenueKart</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; font-weight: 400;">New Booking Inquiry</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">New Booking Request</h2>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              You have received a new booking inquiry for your venue <strong>${venue.name}</strong>. Please review the details below.
            </p>

            <!-- Venue Information -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Venue Information</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #6C63FF;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 30%;">Venue Name:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${venue.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Location:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${venue.location}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Customer Information -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Customer Information</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #3C3B6E;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 30%;">Customer Name:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${customer.name}</td>
                  </tr>
                </table>
                <div style="background: #fff5cd; border: 1px solid #f6e05e; border-radius: 4px; padding: 15px; margin-top: 15px;">
                  <p style="color: #744210; margin: 0; font-size: 14px; line-height: 1.5;">
                    <strong>Privacy Notice:</strong> Customer contact details are protected and will be shared upon inquiry acceptance through your VenueKart dashboard.
                  </p>
                </div>
              </div>
            </div>

            <!-- Event Details -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Event Details</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #38a169;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 30%;">Event Date:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Event Type:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.type}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Guest Count:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.guestCount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Special Requests:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.specialRequests || 'None specified'}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Your Contact Information -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Your Contact Information</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #805ad5;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 30%;">Email:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${owner.email || ownerEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Phone:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${owner.phone || 'Not provided'}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Action Required -->
            <div style="background: #e6fffa; border: 1px solid #38b2ac; border-radius: 6px; padding: 20px; margin: 30px 0;">
              <h3 style="color: #234e52; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Action Required</h3>
              <p style="color: #285e61; margin: 0; font-size: 14px; line-height: 1.5;">
                Please review this inquiry and respond through your VenueKart dashboard within 24 hours. Log in to your account to accept or decline this booking request.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <h4 style="color: #2d3748; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">VenueKart</h4>
            <p style="color: #718096; margin: 0 0 15px 0; font-size: 14px;">
              Professional Venue Solutions
            </p>
            <p style="color: #718096; margin: 0 0 10px 0; font-size: 12px;">
              This inquiry was submitted through VenueKart. Customer contact details will be shared upon acceptance.
            </p>
            <p style="color: #a0aec0; margin: 0; font-size: 12px;">
              © ${new Date().getFullYear()} VenueKart. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Venue inquiry email sent successfully to ${ownerEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending venue inquiry email:', error);
    return false;
  }
}

// Send inquiry notification to VenueKart admin (with full customer details)
export async function sendInquiryNotificationToVenueKart(inquiryData) {
  const { venue, customer, event, owner } = inquiryData;
  const venuekartEmail = process.env.VENUEKART_ADMIN_EMAIL || process.env.EMAIL_USER;

  const mailOptions = {
    from: {
      name: 'VenueKart System',
      address: process.env.EMAIL_USER
    },
    to: venuekartEmail,
    subject: `[ADMIN] New Venue Inquiry - ${venue.name}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Notification - New Inquiry</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #e53e3e 0%, #fc8181 100%); padding: 40px 30px; text-align: center;">
            <img src="https://cdn.builder.io/api/v1/image/assets%2F86425921e7704103a71faf5b04ebcd1a%2F4184ebb3262f4bbcb03f0987cf646790?format=webp&width=800" alt="VenueKart Logo" style="height: 60px; width: auto; margin: 0 0 15px 0; display: block; margin-left: auto; margin-right: auto; filter: brightness(0) invert(1);" />
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 600; letter-spacing: -0.5px;">VenueKart</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; font-weight: 600;">ADMIN NOTIFICATION</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">New Venue Inquiry Received</h2>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              A new venue inquiry has been submitted through the platform. Complete details are provided below for monitoring and quality assurance.
            </p>

            <!-- Inquiry Summary -->
            <div style="background: #fff5cd; border: 1px solid #f6e05e; border-radius: 6px; padding: 20px; margin: 30px 0;">
              <h3 style="color: #744210; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Inquiry Summary</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #744210; font-weight: 600; width: 30%;">Venue:</td>
                  <td style="padding: 8px 0; color: #744210;">${venue.name} ${venue.id ? `(ID: ${venue.id})` : ''}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #744210; font-weight: 600;">Customer:</td>
                  <td style="padding: 8px 0; color: #744210;">${customer.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #744210; font-weight: 600;">Event Date:</td>
                  <td style="padding: 8px 0; color: #744210;">${new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #744210; font-weight: 600;">Event Type:</td>
                  <td style="padding: 8px 0; color: #744210;">${event.type}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #744210; font-weight: 600;">Guest Count:</td>
                  <td style="padding: 8px 0; color: #744210;">${event.guestCount}</td>
                </tr>
              </table>
            </div>

            <!-- Venue Details -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Venue Details</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #6C63FF;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 30%;">Venue Name:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${venue.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Location:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${venue.location}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Price per Day:</td>
                    <td style="padding: 8px 0; color: #2d3748;">₹${venue.price}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Customer Details (Full Access for Admin) -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Customer Details (Complete Information)</h3>
              <div style="background: #fed7d7; padding: 20px; border-radius: 6px; border-left: 4px solid #e53e3e;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #742a2a; font-weight: 600; width: 30%;">Full Name:</td>
                    <td style="padding: 8px 0; color: #742a2a;">${customer.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #742a2a; font-weight: 600;">Email Address:</td>
                    <td style="padding: 8px 0; color: #742a2a;">${customer.email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #742a2a; font-weight: 600;">Phone Number:</td>
                    <td style="padding: 8px 0; color: #742a2a;">${customer.phone}</td>
                  </tr>
                </table>
                <div style="background: #fff5f5; border: 1px solid #feb2b2; border-radius: 4px; padding: 15px; margin-top: 15px;">
                  <p style="color: #742a2a; margin: 0; font-size: 14px; line-height: 1.5;">
                    <strong>Admin Access:</strong> Complete customer contact information is provided for administrative monitoring and support purposes.
                  </p>
                </div>
              </div>
            </div>

            <!-- Event Details -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Event Details</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #38a169;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 30%;">Event Date:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Event Type:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.type}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Guest Count:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.guestCount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Special Requests:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.specialRequests || 'None specified'}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Venue Owner Details -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Venue Owner Details</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #805ad5;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 30%;">Email:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${owner.email || 'Not provided'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Phone:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${owner.phone || 'Not provided'}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Admin Monitoring Notice -->
            <div style="background: #e6fffa; border: 1px solid #38b2ac; border-radius: 6px; padding: 20px; margin: 30px 0;">
              <h3 style="color: #234e52; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Administrative Monitoring</h3>
              <p style="color: #285e61; margin: 0; font-size: 14px; line-height: 1.5;">
                This inquiry has been logged for tracking and quality assurance. Customer contact details are protected from venue owners until inquiry acceptance.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <h4 style="color: #2d3748; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">VenueKart</h4>
            <p style="color: #718096; margin: 0 0 15px 0; font-size: 14px;">
              Professional Venue Solutions
            </p>
            <p style="color: #718096; margin: 0 0 10px 0; font-size: 12px;">
              Inquiry submitted at ${new Date().toLocaleString('en-IN')}
            </p>
            <p style="color: #a0aec0; margin: 0; font-size: 12px;">
              © ${new Date().getFullYear()} VenueKart. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`VenueKart admin notification email sent successfully`);
    return true;
  } catch (error) {
    console.error('Error sending VenueKart admin notification email:', error);
    return false;
  }
}

// Send booking confirmation email to customer
export async function sendBookingConfirmationEmail(customerEmail, bookingData) {
  const { customer, venue, event, bookingId } = bookingData;

  const mailOptions = {
    from: {
      name: 'VenueKart',
      address: process.env.EMAIL_USER
    },
    to: customerEmail,
    subject: `Booking Confirmed - ${venue.name}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmed</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #38a169 0%, #68d391 100%); padding: 40px 30px; text-align: center;">
            <img src="https://cdn.builder.io/api/v1/image/assets%2F86425921e7704103a71faf5b04ebcd1a%2F4184ebb3262f4bbcb03f0987cf646790?format=webp&width=800" alt="VenueKart Logo" style="height: 60px; width: auto; margin: 0 0 15px 0; display: block; margin-left: auto; margin-right: auto; filter: brightness(0) invert(1);" />
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 600; letter-spacing: -0.5px;">VenueKart</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; font-weight: 400;">Booking Confirmation</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <!-- Confirmation Notice -->
            <div style="background: #c6f6d5; border: 1px solid #38a169; border-radius: 6px; padding: 20px; margin: 0 0 30px 0; text-align: center;">
              <h2 style="color: #276749; margin: 0 0 10px 0; font-size: 24px; font-weight: 600;">Booking Confirmed</h2>
              <p style="color: #2f855a; margin: 0; font-size: 16px;">Your venue booking has been confirmed by the venue owner.</p>
            </div>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              Dear ${customer.name},
            </p>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              Congratulations! Your booking request for <strong>${venue.name}</strong> has been confirmed. Please find your booking details below.
            </p>

            <!-- Booking Details -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Booking Details</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #38a169;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 30%;">Booking ID:</td>
                    <td style="padding: 8px 0; color: #2d3748; font-family: 'Courier New', monospace;">#${bookingId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Venue Name:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${venue.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Location:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${venue.location}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Event Date:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Event Type:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.type}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Guest Count:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.guestCount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Total Amount:</td>
                    <td style="padding: 8px 0; color: #2d3748; font-weight: 600;">₹${event.amount}</td>
                  </tr>
                </table>
              </div>
            </div>

            ${event.specialRequests && event.specialRequests !== 'None' ? `
            <!-- Special Requests -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Special Requests</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #805ad5;">
                <p style="color: #2d3748; margin: 0; font-size: 16px; line-height: 1.6;">${event.specialRequests}</p>
              </div>
            </div>
            ` : ''}

            <!-- Next Steps -->
            <div style="background: #fff5cd; border: 1px solid #f6e05e; border-radius: 6px; padding: 20px; margin: 30px 0;">
              <h3 style="color: #744210; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Next Steps</h3>
              <ol style="color: #744210; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li style="margin: 8px 0;">The venue owner will contact you directly to finalize payment and event details</li>
                <li style="margin: 8px 0;">Please keep this email as confirmation of your booking</li>
                <li style="margin: 8px 0;">Contact the venue directly for any specific arrangements or requirements</li>
              </ol>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #4a5568; margin: 0; font-size: 16px; line-height: 1.6;">
                Thank you for choosing VenueKart for your event needs. We wish you a successful event!
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <h4 style="color: #2d3748; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">VenueKart</h4>
            <p style="color: #718096; margin: 0 0 15px 0; font-size: 14px;">
              Professional Venue Solutions
            </p>
            <p style="color: #718096; margin: 0 0 10px 0; font-size: 12px;">
              If you have any questions, please contact us or the venue owner directly.
            </p>
            <p style="color: #a0aec0; margin: 0; font-size: 12px;">
              © ${new Date().getFullYear()} VenueKart. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Booking confirmation email sent successfully to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    return false;
  }
}

// Send inquiry acceptance email to VenueKart admin
export async function sendInquiryAcceptedToAdmin(inquiryData) {
  const { venue, customer, event, owner } = inquiryData;
  const venuekartEmail = process.env.VENUEKART_ADMIN_EMAIL || process.env.EMAIL_USER;

  const mailOptions = {
    from: {
      name: 'VenueKart System',
      address: process.env.EMAIL_USER
    },
    to: venuekartEmail,
    subject: `[ADMIN] Venue Inquiry Accepted - ${venue.name}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Notification - Inquiry Accepted</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #38a169 0%, #68d391 100%); padding: 40px 30px; text-align: center;">
            <img src="https://cdn.builder.io/api/v1/image/assets%2F86425921e7704103a71faf5b04ebcd1a%2F4184ebb3262f4bbcb03f0987cf646790?format=webp&width=800" alt="VenueKart Logo" style="height: 60px; width: auto; margin: 0 0 15px 0; display: block; margin-left: auto; margin-right: auto; filter: brightness(0) invert(1);" />
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 600; letter-spacing: -0.5px;">VenueKart</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; font-weight: 600;">INQUIRY ACCEPTED</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Venue Inquiry Successfully Accepted</h2>
            
            <div style="background: #c6f6d5; border: 1px solid #38a169; border-radius: 6px; padding: 20px; margin: 0 0 30px 0;">
              <h3 style="color: #276749; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">Status Update</h3>
              <p style="color: #2f855a; margin: 0; font-size: 16px;">The venue owner has accepted the booking inquiry. Customer contact details have been shared.</p>
            </div>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              The following venue inquiry has been successfully accepted by the venue owner. All relevant details are provided below for administrative tracking.
            </p>

            <!-- Complete inquiry details with same structure as admin notification -->
            <!-- Venue Details -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Venue Details</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #6C63FF;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 30%;">Venue Name:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${venue.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Location:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${venue.location}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Price per Day:</td>
                    <td style="padding: 8px 0; color: #2d3748;">₹${venue.price}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Customer Details -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Customer Details</h3>
              <div style="background: #fed7d7; padding: 20px; border-radius: 6px; border-left: 4px solid #e53e3e;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #742a2a; font-weight: 600; width: 30%;">Full Name:</td>
                    <td style="padding: 8px 0; color: #742a2a;">${customer.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #742a2a; font-weight: 600;">Email Address:</td>
                    <td style="padding: 8px 0; color: #742a2a;">${customer.email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #742a2a; font-weight: 600;">Phone Number:</td>
                    <td style="padding: 8px 0; color: #742a2a;">${customer.phone}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Event Details -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Event Details</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #38a169;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 30%;">Event Date:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Event Type:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.type}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Guest Count:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.guestCount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Special Requests:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.specialRequests || 'None specified'}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Venue Owner Details -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Venue Owner Details</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #805ad5;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 30%;">Email:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${owner.email || 'Not provided'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Phone:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${owner.phone || 'Not provided'}</td>
                  </tr>
                </table>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <h4 style="color: #2d3748; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">VenueKart</h4>
            <p style="color: #718096; margin: 0 0 15px 0; font-size: 14px;">
              Professional Venue Solutions
            </p>
            <p style="color: #718096; margin: 0 0 10px 0; font-size: 12px;">
              Inquiry accepted at ${new Date().toLocaleString('en-IN')}
            </p>
            <p style="color: #a0aec0; margin: 0; font-size: 12px;">
              © ${new Date().getFullYear()} VenueKart. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Inquiry acceptance notification sent to admin successfully`);
    return true;
  } catch (error) {
    console.error('Error sending inquiry acceptance email to admin:', error);
    return false;
  }
}

// Send inquiry acceptance email to customer
export async function sendInquiryAcceptedToCustomer(customerEmail, inquiryData) {
  const { venue, customer, event, owner } = inquiryData;

  const mailOptions = {
    from: {
      name: 'VenueKart',
      address: process.env.EMAIL_USER
    },
    to: customerEmail,
    subject: `Venue Inquiry Accepted - ${venue.name}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Inquiry Accepted</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #38a169 0%, #68d391 100%); padding: 40px 30px; text-align: center;">
            <img src="https://cdn.builder.io/api/v1/image/assets%2F86425921e7704103a71faf5b04ebcd1a%2F4184ebb3262f4bbcb03f0987cf646790?format=webp&width=800" alt="VenueKart Logo" style="height: 60px; width: auto; margin: 0 0 15px 0; display: block; margin-left: auto; margin-right: auto; filter: brightness(0) invert(1);" />
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 600; letter-spacing: -0.5px;">VenueKart</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; font-weight: 400;">Excellent News!</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <!-- Acceptance Notice -->
            <div style="background: #c6f6d5; border: 1px solid #38a169; border-radius: 6px; padding: 20px; margin: 0 0 30px 0; text-align: center;">
              <h2 style="color: #276749; margin: 0 0 10px 0; font-size: 24px; font-weight: 600;">Your Venue Inquiry Has Been Accepted</h2>
              <p style="color: #2f855a; margin: 0; font-size: 16px;">The venue owner has accepted your booking inquiry for <strong>${venue.name}</strong>.</p>
            </div>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              Dear ${customer.name},
            </p>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              We are pleased to inform you that your venue inquiry has been accepted. The venue owner is interested in hosting your event and you can now proceed with the booking process.
            </p>

            <!-- Venue Information -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Venue Information</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #6C63FF;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 30%;">Venue Name:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${venue.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Location:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${venue.location}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Price per Day:</td>
                    <td style="padding: 8px 0; color: #2d3748;">₹${venue.price}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Your Event Details -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Your Event Details</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #38a169;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 30%;">Event Date:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Event Type:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.type}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Guest Count:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.guestCount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Special Requests:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.specialRequests || 'None specified'}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Payment Instructions -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Next Steps - Complete Your Payment</h3>
              <div style="background: #fef5e7; padding: 20px; border-radius: 6px; border-left: 4px solid #d69e2e; margin: 0 0 20px 0;">
                <p style="color: #744210; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">
                  🔔 Payment Required to Confirm Your Booking
                </p>
                <p style="color: #975a16; margin: 0 0 15px 0; font-size: 14px; line-height: 1.5;">
                  To secure your booking, please complete the payment process within 48 hours. Follow these simple steps:
                </p>
                <ol style="color: #975a16; margin: 0; font-size: 14px; line-height: 1.6; padding-left: 20px;">
                  <li style="margin: 0 0 8px 0;">Log in to your VenueKart dashboard</li>
                  <li style="margin: 0 0 8px 0;">Navigate to your booking history</li>
                  <li style="margin: 0 0 8px 0;">Click "Pay Now" for this booking</li>
                  <li style="margin: 0 0 8px 0;">Complete the secure payment via Razorpay</li>
                </ol>
              </div>

              <div style="text-align: center; margin: 20px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:8080'}/user-dashboard"
                   style="display: inline-block; background: #3C3B6E; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Complete Payment Now
                </a>
              </div>

              <div style="background: #e6fffa; padding: 15px; border-radius: 6px; border-left: 4px solid #38b2ac;">
                <p style="color: #234e52; margin: 0; font-size: 13px; line-height: 1.5;">
                  <strong>💳 Secure Payment:</strong> All payments are processed securely through Razorpay with bank-level encryption.<br>
                  <strong>📞 Support:</strong> Contact us if you need assistance with the payment process.
                </p>
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #4a5568; margin: 0; font-size: 16px; line-height: 1.6;">
                Thank you for choosing VenueKart. We hope you have a wonderful event!
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <h4 style="color: #2d3748; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">VenueKart</h4>
            <p style="color: #718096; margin: 0 0 15px 0; font-size: 14px;">
              Professional Venue Solutions
            </p>
            <p style="color: #718096; margin: 0 0 10px 0; font-size: 12px;">
              We're here to help make your event successful. Best wishes!
            </p>
            <p style="color: #a0aec0; margin: 0; font-size: 12px;">
              © ${new Date().getFullYear()} VenueKart. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Inquiry acceptance email sent successfully to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending inquiry acceptance email to customer:', error);
    return false;
  }
}

// Send inquiry rejection email to VenueKart admin
export async function sendInquiryRejectedToAdmin(inquiryData) {
  const { venue, customer, event, owner } = inquiryData;
  const venuekartEmail = process.env.VENUEKART_ADMIN_EMAIL || process.env.EMAIL_USER;

  const mailOptions = {
    from: {
      name: 'VenueKart System',
      address: process.env.EMAIL_USER
    },
    to: venuekartEmail,
    subject: `[ADMIN] Venue Inquiry Declined - ${venue.name}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Notification - Inquiry Declined</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #e53e3e 0%, #fc8181 100%); padding: 40px 30px; text-align: center;">
            <img src="https://cdn.builder.io/api/v1/image/assets%2F86425921e7704103a71faf5b04ebcd1a%2F4184ebb3262f4bbcb03f0987cf646790?format=webp&width=800" alt="VenueKart Logo" style="height: 60px; width: auto; margin: 0 0 15px 0; display: block; margin-left: auto; margin-right: auto; filter: brightness(0) invert(1);" />
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 600; letter-spacing: -0.5px;">VenueKart</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; font-weight: 600;">INQUIRY DECLINED</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Venue Inquiry Has Been Declined</h2>
            
            <div style="background: #fed7d7; border: 1px solid #e53e3e; border-radius: 6px; padding: 20px; margin: 0 0 30px 0;">
              <h3 style="color: #742a2a; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">Status Update</h3>
              <p style="color: #742a2a; margin: 0; font-size: 16px;">The venue owner has declined the booking inquiry. Customer has been notified.</p>
            </div>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              The following venue inquiry has been declined by the venue owner. All relevant details are provided below for administrative tracking.
            </p>

            <!-- Complete inquiry details - similar structure as other admin emails -->
            <!-- Venue Details -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Venue Details</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #6C63FF;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 30%;">Venue Name:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${venue.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Location:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${venue.location}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Price per Day:</td>
                    <td style="padding: 8px 0; color: #2d3748;">₹${venue.price}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Customer Details -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Customer Details</h3>
              <div style="background: #fed7d7; padding: 20px; border-radius: 6px; border-left: 4px solid #e53e3e;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #742a2a; font-weight: 600; width: 30%;">Full Name:</td>
                    <td style="padding: 8px 0; color: #742a2a;">${customer.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #742a2a; font-weight: 600;">Email Address:</td>
                    <td style="padding: 8px 0; color: #742a2a;">${customer.email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #742a2a; font-weight: 600;">Phone Number:</td>
                    <td style="padding: 8px 0; color: #742a2a;">${customer.phone}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Event Details -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Event Details</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #38a169;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 30%;">Event Date:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Event Type:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.type}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Guest Count:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.guestCount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Special Requests:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.specialRequests || 'None specified'}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Venue Owner Details -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Venue Owner Details</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #805ad5;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 30%;">Email:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${owner.email || 'Not provided'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Phone:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${owner.phone || 'Not provided'}</td>
                  </tr>
                </table>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <h4 style="color: #2d3748; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">VenueKart</h4>
            <p style="color: #718096; margin: 0 0 15px 0; font-size: 14px;">
              Professional Venue Solutions
            </p>
            <p style="color: #718096; margin: 0 0 10px 0; font-size: 12px;">
              Inquiry declined at ${new Date().toLocaleString('en-IN')}
            </p>
            <p style="color: #a0aec0; margin: 0; font-size: 12px;">
              © ${new Date().getFullYear()} VenueKart. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Inquiry rejection notification sent to admin successfully`);
    return true;
  } catch (error) {
    console.error('Error sending inquiry rejection email to admin:', error);
    return false;
  }
}

// Send inquiry rejection email to customer
export async function sendInquiryRejectedToCustomer(customerEmail, inquiryData) {
  const { venue, customer, event } = inquiryData;

  const mailOptions = {
    from: {
      name: 'VenueKart',
      address: process.env.EMAIL_USER
    },
    to: customerEmail,
    subject: `Venue Inquiry Update - ${venue.name}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Inquiry Update</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3C3B6E 0%, #6C63FF 100%); padding: 40px 30px; text-align: center;">
            <img src="https://cdn.builder.io/api/v1/image/assets%2F86425921e7704103a71faf5b04ebcd1a%2F4184ebb3262f4bbcb03f0987cf646790?format=webp&width=800" alt="VenueKart Logo" style="height: 60px; width: auto; margin: 0 0 15px 0; display: block; margin-left: auto; margin-right: auto;" />
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 600; letter-spacing: -0.5px;">VenueKart</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; font-weight: 400;">Inquiry Update</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Inquiry Status Update</h2>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              Dear ${customer.name},
            </p>
            
            <div style="background: #fed7d7; border: 1px solid #e53e3e; border-radius: 6px; padding: 20px; margin: 0 0 30px 0;">
              <h3 style="color: #742a2a; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">Inquiry Status</h3>
              <p style="color: #742a2a; margin: 0; font-size: 16px;">Unfortunately, your venue inquiry for <strong>${venue.name}</strong> could not be accommodated at this time.</p>
            </div>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              We understand this may be disappointing. The venue owner was unable to accommodate your request for the specified date and requirements.
            </p>

            <!-- Inquiry Details -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Your Inquiry Details</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #6C63FF;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 30%;">Venue Name:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${venue.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Location:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${venue.location}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Event Date:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Event Type:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.type}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Guest Count:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.guestCount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Special Requests:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.specialRequests || 'None specified'}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Alternative Options -->
            <div style="background: #e6fffa; border: 1px solid #38b2ac; border-radius: 6px; padding: 20px; margin: 30px 0;">
              <h3 style="color: #234e52; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Alternative Options</h3>
              <ul style="color: #285e61; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li style="margin: 8px 0;"><strong>Browse alternative venues</strong> - We have many other excellent venues that might suit your needs</li>
                <li style="margin: 8px 0;"><strong>Try different dates</strong> - The venue might be available on alternative dates</li>
                <li style="margin: 8px 0;"><strong>Contact our support team</strong> - We can help you find suitable alternatives</li>
                <li style="margin: 8px 0;"><strong>Modify requirements</strong> - Consider adjusting guest count or other specifications</li>
              </ul>
            </div>

            <!-- Browse More Venues CTA -->
            <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f7fafc; border-radius: 6px;">
              <p style="color: #4a5568; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                Don't let this setback stop your perfect event. Let us help you find another excellent venue.
              </p>
              <a href="${process.env.FRONTEND_URL || 'https://venuekart.com'}/venues" style="background: linear-gradient(135deg, #3C3B6E 0%, #6C63FF 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                Browse Other Venues
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <h4 style="color: #2d3748; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">VenueKart</h4>
            <p style="color: #718096; margin: 0 0 15px 0; font-size: 14px;">
              Professional Venue Solutions
            </p>
            <p style="color: #718096; margin: 0 0 10px 0; font-size: 12px;">
              We're committed to helping you find the perfect venue for your event.
            </p>
            <p style="color: #a0aec0; margin: 0; font-size: 12px;">
              © ${new Date().getFullYear()} VenueKart. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Inquiry rejection email sent successfully to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending inquiry rejection email to customer:', error);
    return false;
  }
}

export async function sendBookingRejectionEmail(customerEmail, bookingData) {
  const { customer, venue, event, bookingId } = bookingData;

  const mailOptions = {
    from: {
      name: 'VenueKart',
      address: process.env.EMAIL_USER
    },
    to: customerEmail,
    subject: `Booking Status Update - ${venue.name}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Update</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3C3B6E 0%, #6C63FF 100%); padding: 40px 30px; text-align: center;">
            <img src="https://cdn.builder.io/api/v1/image/assets%2F86425921e7704103a71faf5b04ebcd1a%2F4184ebb3262f4bbcb03f0987cf646790?format=webp&width=800" alt="VenueKart Logo" style="height: 60px; width: auto; margin: 0 0 15px 0; display: block; margin-left: auto; margin-right: auto;" />
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 600; letter-spacing: -0.5px;">VenueKart</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; font-weight: 400;">Booking Update</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <!-- Status Notice -->
            <div style="background: #fed7d7; border: 1px solid #e53e3e; border-radius: 6px; padding: 20px; margin: 0 0 30px 0;">
              <h2 style="color: #742a2a; margin: 0 0 10px 0; font-size: 20px; font-weight: 600;">Booking Status Update</h2>
              <p style="color: #742a2a; margin: 0; font-size: 16px;">Unfortunately, your booking request could not be confirmed.</p>
            </div>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              Dear ${customer.name},
            </p>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              We regret to inform you that your booking request for <strong>${venue.name}</strong> could not be confirmed by the venue owner. We understand this is disappointing news.
            </p>

            <!-- Booking Details -->
            <div style="margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Booking Details</h3>
              <div style="background: #f7fafc; padding: 20px; border-radius: 6px; border-left: 4px solid #6C63FF;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600; width: 30%;">Booking ID:</td>
                    <td style="padding: 8px 0; color: #2d3748; font-family: 'Courier New', monospace;">#${bookingId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Venue Name:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${venue.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Location:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${venue.location}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Event Date:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Event Type:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.type}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #4a5568; font-weight: 600;">Guest Count:</td>
                    <td style="padding: 8px 0; color: #2d3748;">${event.guestCount}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Alternative Options -->
            <div style="background: #e6fffa; border: 1px solid #38b2ac; border-radius: 6px; padding: 20px; margin: 30px 0;">
              <h3 style="color: #234e52; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">What You Can Do Next</h3>
              <ol style="color: #285e61; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li style="margin: 8px 0;"><strong>Browse alternative venues</strong> - We have many other excellent venues that might suit your needs</li>
                <li style="margin: 8px 0;"><strong>Try different dates</strong> - The venue might be available on other dates</li>
                <li style="margin: 8px 0;"><strong>Contact our support team</strong> - Our team can help you find suitable alternatives</li>
                <li style="margin: 8px 0;"><strong>Adjust your requirements</strong> - Consider modifying guest count or other specifications</li>
              </ol>
            </div>

            <!-- Browse Venues CTA -->
            <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f7fafc; border-radius: 6px;">
              <p style="color: #4a5568; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                We're committed to helping you find the perfect venue for your event.
              </p>
              <a href="${process.env.FRONTEND_URL || 'https://venuekart.com'}" style="background: linear-gradient(135deg, #3C3B6E 0%, #6C63FF 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                Browse Other Venues
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <h4 style="color: #2d3748; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">VenueKart</h4>
            <p style="color: #718096; margin: 0 0 15px 0; font-size: 14px;">
              Professional Venue Solutions
            </p>
            <p style="color: #718096; margin: 0 0 10px 0; font-size: 12px;">
              Thank you for choosing VenueKart. We appreciate your understanding.
            </p>
            <p style="color: #a0aec0; margin: 0; font-size: 12px;">
              © ${new Date().getFullYear()} VenueKart. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Booking rejection email sent successfully to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending booking rejection email:', error);
    return false;
  }
}
