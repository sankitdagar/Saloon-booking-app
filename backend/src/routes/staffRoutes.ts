import { Router } from 'express';
import * as staff from '../controllers/staffController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/', staff.getStaff);
router.get('/availability', staff.getAvailability);
router.get('/:id', staff.getStaffById);
router.get('/:id/availability', staff.getStaffAvailability);

router.post('/', authenticate, authorize('admin'), validate(staff.createStaffValidation), staff.createStaff);
router.put('/:id', authenticate, authorize('admin'), staff.updateStaff);
router.delete('/:id', authenticate, authorize('admin'), staff.deleteStaff);

export default router;
