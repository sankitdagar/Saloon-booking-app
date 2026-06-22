import { Router } from 'express';
import * as user from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/notifications', authenticate, user.getNotifications);
router.put('/notifications/read', authenticate, user.markAsRead);
router.put('/notifications/read-all', authenticate, user.markAllRead);
router.get('/wishlist', authenticate, user.getWishlist);
router.post('/wishlist/toggle', authenticate, user.toggleWishlist);
router.post('/profile-image', authenticate, upload.single('image'), user.uploadProfileImage);

export default router;
