import nodemailer from 'nodemailer';

// Configure email transporter
export const createTransporter = () => {
  // For development, we can use a test account from Ethereal
  // In production, this would be replaced with actual SMTP credentials
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587', 10),
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
    secure: process.env.EMAIL_SERVER_SECURE === 'true',
  });
};

// Send verification email
export const sendVerificationEmail = async (email, token, baseUrl) => {
  const transporter = createTransporter();
  const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Marketplace Support" <support@marketplace.com>',
    to: email,
    subject: 'Verify your email address',
    text: `Please verify your email address by clicking on the following link: ${verificationUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Marketplace!</h2>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email Address</a>
        </div>
        <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

// Send password reset email
export const sendPasswordResetEmail = async (email, token, baseUrl) => {
  const transporter = createTransporter();
  const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Marketplace Support" <support@marketplace.com>',
    to: email,
    subject: 'Reset your password',
    text: `You requested a password reset. Please click on the following link to reset your password: ${resetUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your Marketplace account. Please click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
        </div>
        <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};
