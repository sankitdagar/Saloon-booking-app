import { Router } from 'express';
import * as service from '../controllers/serviceController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', service.getServices);
router.get('/categories', service.getCategories);
router.get('/:id', validate(service.serviceIdParam), service.getServiceById);

router.post('/', authenticate, authorize('admin'), upload.single('image'), validate(service.createServiceValidation), service.createService);
router.put('/:id', authenticate, authorize('admin'), upload.single('image'), service.updateService);
router.delete('/:id', authenticate, authorize('admin'), service.deleteService);

export default router;
