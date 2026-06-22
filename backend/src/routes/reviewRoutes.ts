import { Router } from 'express';
import * as review from '../controllers/reviewController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/', authenticate, authorize('customer'), upload.array('images', 5), validate(review.createReviewValidation), review.createReview);
router.get('/service/:id', review.getServiceReviews);
router.get('/staff/:id', review.getStaffReviews);

router.get('/', authenticate, authorize('admin'), review.getAllReviews);
router.put('/:id/respond', authenticate, authorize('admin'), review.respondToReview);
router.put('/:id/hide', authenticate, authorize('admin'), review.hideReview);

export default router;
