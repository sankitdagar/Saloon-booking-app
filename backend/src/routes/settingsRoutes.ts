import { Router } from 'express';
import * as settings from '../controllers/settingsController';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', settings.getSettings);
router.put('/', authenticate, authorize('admin'), upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]), settings.updateSettings);

export default router;
