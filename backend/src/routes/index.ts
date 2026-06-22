import { Router } from 'express';
import authRoutes from './authRoutes';
import serviceRoutes from './serviceRoutes';
import staffRoutes from './staffRoutes';
import bookingRoutes from './bookingRoutes';
import reviewRoutes from './reviewRoutes';
import couponRoutes from './couponRoutes';
import paymentRoutes from './paymentRoutes';
import settingsRoutes from './settingsRoutes';
import dashboardRoutes from './dashboardRoutes';
import userRoutes from './userRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/services', serviceRoutes);
router.use('/staff', staffRoutes);
router.use('/bookings', bookingRoutes);
router.use('/reviews', reviewRoutes);
router.use('/coupons', couponRoutes);
router.use('/payments', paymentRoutes);
router.use('/saloon-settings', settingsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/users', userRoutes);

export default router;
