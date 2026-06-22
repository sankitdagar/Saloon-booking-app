import { Router } from 'express';
import * as dashboard from '../controllers/dashboardController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticate, authorize('admin'), dashboard.getDashboardStats);
router.get('/customers', authenticate, authorize('admin'), dashboard.getCustomers);
router.put('/customers/:id/block', authenticate, authorize('admin'), dashboard.toggleBlockCustomer);
router.get('/customers/:id/bookings', authenticate, authorize('admin'), dashboard.getCustomerBookings);
router.get('/export', authenticate, authorize('admin'), dashboard.exportReport);

export default router;
