import { Router } from 'express';
import * as auth from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, validate(auth.registerValidation), auth.register);
router.post('/login', authLimiter, validate(auth.loginValidation), auth.login);
router.post('/refresh', auth.refresh);
router.post('/logout', authenticate, auth.logout);
router.get('/me', authenticate, auth.getMe);
router.post('/forgot-password', authLimiter, auth.forgotPassword);
router.post('/reset-password', auth.resetPassword);
router.post('/verify-otp', authenticate, auth.verifyPhoneOtp);
router.post('/resend-otp', authenticate, auth.resendOtp);
router.put('/profile', authenticate, auth.updateProfile);
router.put('/change-password', authenticate, auth.changePassword);

export default router;
