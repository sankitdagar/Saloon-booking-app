import { Router } from 'express';
import * as coupon from '../controllers/couponController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.post('/validate', authenticate, coupon.validateCoupon);

router.get('/', authenticate, authorize('admin'), coupon.getCoupons);
router.post('/', authenticate, authorize('admin'), validate(coupon.createCouponValidation), coupon.createCoupon);
router.put('/:id', authenticate, authorize('admin'), coupon.updateCoupon);
router.delete('/:id', authenticate, authorize('admin'), coupon.deleteCoupon);

export default router;
