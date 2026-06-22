import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { isProduction } from '../config/env';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  if (err.name === 'ValidationError') {
    res.status(400).json({ success: false, message: err.message });
    return;
  }

  if ((err as { code?: number }).code === 11000) {
    res.status(409).json({ success: false, message: 'Duplicate entry — slot may already be booked' });
    return;
  }

  console.error(err);
  res.status(500).json({
    success: false,
    message: isProduction ? 'Internal server error' : err.message,
  });
}
