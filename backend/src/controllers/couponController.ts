import { Response } from 'express';
import { body } from 'express-validator';
import { Coupon } from '../models/Coupon';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { validateAndApplyCoupon } from '../services/slotService';

export const validateCoupon = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { code, orderAmount } = req.body;
  const { coupon, discount } = await validateAndApplyCoupon(code, orderAmount);
  res.json({
    success: true,
    data: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: discount,
      finalAmount: orderAmount - discount,
    },
  });
});

export const getCoupons = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, data: coupons });
});

export const createCoupon = asyncHandler(async (req: AuthRequest, res: Response) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, data: coupon });
});

export const updateCoupon = asyncHandler(async (req: AuthRequest, res: Response) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!coupon) throw new ApiError(404, 'Coupon not found');
  res.json({ success: true, data: coupon });
});

export const deleteCoupon = asyncHandler(async (req: AuthRequest, res: Response) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) throw new ApiError(404, 'Coupon not found');
  res.json({ success: true, message: 'Coupon deleted' });
});

export const createCouponValidation = [
  body('code').trim().notEmpty(),
  body('discountType').isIn(['percentage', 'flat']),
  body('discountValue').isFloat({ min: 0 }),
  body('validFrom').isISO8601(),
  body('validTo').isISO8601(),
  body('usageLimit').isInt({ min: 1 }),
];
