import { Request, Response, NextFunction } from 'express';
import { User, IUser } from '../models/User';
import { Staff } from '../models/Staff';
import { verifyAccessToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { UserRole } from '../types';

export interface AuthRequest extends Request {
  user?: IUser;
  staffProfileId?: string;
}

export async function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication required');
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.userId);
    if (!user) throw new ApiError(401, 'User not found');
    if (user.isBlocked) throw new ApiError(403, 'Your account has been blocked');

    req.user = user;

    if (user.role === 'staff') {
      const staff = await Staff.findOne({ userId: user._id });
      if (staff) req.staffProfileId = staff._id.toString();
    }

    next();
  } catch {
    throw new ApiError(401, 'Invalid or expired token');
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) throw new ApiError(401, 'Authentication required');
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'You do not have permission to access this resource');
    }
    next();
  };
}

export function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }

  authenticate(req, _res, next).catch(() => next());
}
