import { Router } from 'express';
import * as payment from '../controllers/paymentController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/create-order', authenticate, authorize('customer'), payment.createPaymentOrder);
router.post('/verify', authenticate, authorize('customer'), payment.verifyPayment);
router.post('/mock', authenticate, authorize('customer'), payment.mockPayment);

export default router;
