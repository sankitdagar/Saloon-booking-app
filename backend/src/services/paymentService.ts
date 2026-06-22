import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

let razorpay: Razorpay | null = null;

if (env.razorpayKeyId && env.razorpayKeySecret) {
  razorpay = new Razorpay({
    key_id: env.razorpayKeyId,
    key_secret: env.razorpayKeySecret,
  });
}

export async function createRazorpayOrder(
  amountInPaise: number,
  receipt: string
): Promise<{ id: string; amount: number; currency: string }> {
  if (!razorpay) {
    // Dev mock order when Razorpay not configured
    return {
      id: `order_mock_${Date.now()}`,
      amount: amountInPaise,
      currency: 'INR',
    };
  }

  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt,
  });

  return { id: order.id, amount: Number(order.amount), currency: order.currency };
}

export function verifyRazorpayPayment(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!env.razorpayKeySecret) {
    return paymentId.startsWith('pay_mock_');
  }

  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac('sha256', env.razorpayKeySecret)
    .update(body)
    .digest('hex');

  return expected === signature;
}

export async function refundPayment(
  paymentId: string,
  amountInPaise: number
): Promise<void> {
  if (!razorpay) {
    console.log(`[Refund skipped — mock] paymentId: ${paymentId}, amount: ${amountInPaise}`);
    return;
  }

  try {
    await razorpay.payments.refund(paymentId, { amount: amountInPaise });
  } catch (err) {
    throw new ApiError(500, 'Refund failed');
  }
}

export function getRazorpayKeyId(): string {
  return env.razorpayKeyId || 'rzp_test_mock';
}
