import { Response } from 'express';
import { body } from 'express-validator';
import { Staff } from '../models/Staff';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { getAvailableSlots } from '../services/slotService';

export const getStaff = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { serviceId } = req.query;
  const filter: Record<string, unknown> = { isActive: true };
  if (serviceId) filter.servicesOffered = serviceId;

  const staff = await Staff.find(filter)
    .populate('userId', 'name email profileImage')
    .populate('servicesOffered', 'name category price durationInMinutes');

  res.json({ success: true, data: staff });
});

export const getStaffById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const staff = await Staff.findById(req.params.id)
    .populate('userId', 'name email profileImage')
    .populate('servicesOffered', 'name category price durationInMinutes');
  if (!staff) throw new ApiError(404, 'Staff not found');
  res.json({ success: true, data: staff });
});

export const getStaffAvailability = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { date, serviceId } = req.query;
  if (!date || !serviceId) throw new ApiError(400, 'date and serviceId are required');

  const serviceIds = String(serviceId).split(',');
  const slots = await getAvailableSlots(String(date), serviceIds, String(req.params.id));
  res.json({ success: true, data: slots[0] ?? { staffId: req.params.id, slots: [] } });
});

export const getAvailability = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { date, serviceIds, staffId } = req.query;
  if (!date || !serviceIds) throw new ApiError(400, 'date and serviceIds are required');

  const ids = String(serviceIds).split(',');
  const slots = await getAvailableSlots(String(date), ids, staffId ? String(staffId) : undefined);
  res.json({ success: true, data: slots });
});

export const createStaff = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email, phone, password, bio, servicesOffered, workingHours } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'Email already exists');

  const user = await User.create({ name, email, phone, password, role: 'staff' });
  const staff = await Staff.create({
    userId: user._id,
    bio,
    servicesOffered,
    workingHours,
  });

  const populated = await Staff.findById(staff._id)
    .populate('userId', 'name email profileImage')
    .populate('servicesOffered', 'name');

  res.status(201).json({ success: true, data: populated });
});

export const updateStaff = asyncHandler(async (req: AuthRequest, res: Response) => {
  const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate('userId', 'name email profileImage')
    .populate('servicesOffered', 'name');

  if (!staff) throw new ApiError(404, 'Staff not found');

  if (req.body.name || req.body.phone) {
    await User.findByIdAndUpdate(staff.userId, {
      ...(req.body.name && { name: req.body.name }),
      ...(req.body.phone && { phone: req.body.phone }),
    });
  }

  res.json({ success: true, data: staff });
});

export const deleteStaff = asyncHandler(async (req: AuthRequest, res: Response) => {
  const staff = await Staff.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!staff) throw new ApiError(404, 'Staff not found');
  res.json({ success: true, message: 'Staff deactivated' });
});

export const createStaffValidation = [
  body('name').trim().notEmpty(),
  body('email').isEmail(),
  body('phone').matches(/^[6-9]\d{9}$/),
  body('password').isLength({ min: 8 }),
];
