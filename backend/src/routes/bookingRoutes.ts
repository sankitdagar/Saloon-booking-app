import { Router } from 'express';
import * as booking from '../controllers/bookingController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.post('/', authenticate, authorize('customer'), validate(booking.createBookingValidation), booking.createBooking);
router.get('/my', authenticate, authorize('customer'), booking.getMyBookings);
router.get('/:id', authenticate, booking.getBookingById);
router.put('/:id/cancel', authenticate, booking.cancelBooking);
router.put('/:id/reschedule', authenticate, authorize('customer'), booking.rescheduleBooking);

router.get('/', authenticate, authorize('admin', 'staff'), booking.getAllBookings);
router.put('/:id/status', authenticate, authorize('admin', 'staff'), booking.updateBookingStatus);
router.post('/walk-in', authenticate, authorize('admin'), booking.createWalkInBooking);
router.put('/:id/mark-paid', authenticate, authorize('admin'), booking.markAsPaid);

export default router;
