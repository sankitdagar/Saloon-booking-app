import { Response } from 'express';
import { body } from 'express-validator';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  generateResetToken,
  hashToken,
  generateOtp,
} from '../utils/jwt';
import { sendEmail, resetPasswordEmail, otpEmail } from '../services/emailService';
import { env } from '../config/env';

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit phone required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

export const loginValidation = [
  body('email').isEmail(),
  body('password').notEmpty(),
];

export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const name = String(req.body.name).trim();
  const email = String(req.body.email).toLowerCase().trim();
  const phone = String(req.body.phone).trim();
  const { password } = req.body;

  const existing = await User.findOne({ $or: [{ email }, { phone }] });
  if (existing) throw new ApiError(409, 'Email or phone already registered');

  const otp = generateOtp();
  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: 'customer',
    phoneOtp: otp,
    phoneOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
  });

  await sendEmail(user.email, 'Verify Your Phone', otpEmail(user.name, otp));

  const tokens = issueTokens(user._id.toString(), user.role);
  user.refreshToken = hashToken(tokens.refreshToken);
  await user.save();

  res.status(201).json({
    success: true,
    message: 'Registered successfully. Please verify your phone with OTP.',
    data: { user, accessToken: tokens.accessToken },
  });
});

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const email = String(req.body.email).toLowerCase().trim();
  const { password } = req.body;

  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (user.isBlocked) throw new ApiError(403, 'Your account has been blocked');

  const tokens = issueTokens(user._id.toString(), user.role);
  user.refreshToken = hashToken(tokens.refreshToken);
  await user.save();

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    data: { user, accessToken: tokens.accessToken },
  });
});

export const refresh = asyncHandler(async (req: AuthRequest, res: Response) => {
  const token = req.cookies.refreshToken ?? req.body.refreshToken;
  if (!token) throw new ApiError(401, 'Refresh token required');

  const payload = verifyRefreshToken(token);
  const user = await User.findById(payload.userId).select('+refreshToken');
  if (!user || user.refreshToken !== hashToken(token)) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const tokens = issueTokens(user._id.toString(), user.role);
  user.refreshToken = hashToken(tokens.refreshToken);
  await user.save();

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ success: true, data: { accessToken: tokens.accessToken } });
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
  }
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out' });
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  res.json({ success: true, data: req.user });
});

export const forgotPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.json({ success: true, message: 'If email exists, reset link has been sent' });
    return;
  }

  const resetToken = generateResetToken();
  user.passwordResetToken = hashToken(resetToken);
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  const resetUrl = `${env.clientUrl}/reset-password?token=${resetToken}`;
  await sendEmail(user.email, 'Reset Password', resetPasswordEmail(user.name, resetUrl));

  res.json({ success: true, message: 'If email exists, reset link has been sent' });
});

export const resetPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { token, password } = req.body;
  const user = await User.findOne({
    passwordResetToken: hashToken(token),
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) throw new ApiError(400, 'Invalid or expired reset token');

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({ success: true, message: 'Password reset successful' });
});

export const verifyPhoneOtp = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { otp } = req.body;
  const user = await User.findById(req.user!._id).select('+phoneOtp +phoneOtpExpires');
  if (!user) throw new ApiError(404, 'User not found');

  if (user.phoneOtp !== otp || !user.phoneOtpExpires || user.phoneOtpExpires < new Date()) {
    throw new ApiError(400, 'Invalid or expired OTP');
  }

  user.isPhoneVerified = true;
  user.phoneOtp = undefined;
  user.phoneOtpExpires = undefined;
  await user.save();

  res.json({ success: true, message: 'Phone verified successfully' });
});

export const resendOtp = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!._id);
  if (!user) throw new ApiError(404, 'User not found');
  if (user.isPhoneVerified) throw new ApiError(400, 'Phone already verified');

  const otp = generateOtp();
  user.phoneOtp = otp;
  user.phoneOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await sendEmail(user.email, 'Verify Your Phone', otpEmail(user.name, otp));

  res.json({ success: true, message: 'OTP sent to your email' });
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, phone } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user!._id,
    { ...(name && { name }), ...(phone && { phone }) },
    { new: true, runValidators: true }
  );
  res.json({ success: true, data: user });
});

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user!._id).select('+password');
  if (!user || !(await user.comparePassword(currentPassword))) {
    throw new ApiError(400, 'Current password is incorrect');
  }
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password changed' });
});

function issueTokens(userId: string, role: string) {
  const payload = { userId, role: role as 'customer' | 'admin' | 'staff' };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}
