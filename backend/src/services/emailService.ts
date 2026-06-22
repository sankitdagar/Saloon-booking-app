import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter =
  env.smtpHost && env.smtpUser
    ? nodemailer.createTransport({
        host: env.smtpHost,
        port: env.smtpPort,
        secure: env.smtpPort === 465,
        auth: { user: env.smtpUser, pass: env.smtpPass },
      })
    : null;

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  if (!transporter) {
    console.log(`[Email skipped — SMTP not configured] To: ${to}, Subject: ${subject}`);
    return;
  }

  await transporter.sendMail({
    from: env.emailFrom,
    to,
    subject,
    html,
  });
}

export function bookingConfirmedEmail(data: {
  name: string;
  date: string;
  time: string;
  services: string;
  amount: number;
}): string {
  return `
    <h2>Booking Confirmed!</h2>
    <p>Hi ${data.name},</p>
    <p>Your appointment has been confirmed.</p>
    <ul>
      <li><strong>Date:</strong> ${data.date}</li>
      <li><strong>Time:</strong> ${data.time}</li>
      <li><strong>Services:</strong> ${data.services}</li>
      <li><strong>Amount:</strong> ₹${data.amount}</li>
    </ul>
    <p>See you soon!</p>
  `;
}

export function bookingCancelledEmail(name: string, date: string, time: string): string {
  return `
    <h2>Booking Cancelled</h2>
    <p>Hi ${name},</p>
    <p>Your appointment on ${date} at ${time} has been cancelled.</p>
  `;
}

export function bookingReminderEmail(name: string, date: string, time: string): string {
  return `
    <h2>Appointment Reminder</h2>
    <p>Hi ${name},</p>
    <p>This is a reminder that you have an appointment in about 2 hours.</p>
    <p><strong>${date}</strong> at <strong>${time}</strong></p>
  `;
}

export function resetPasswordEmail(name: string, resetUrl: string): string {
  return `
    <h2>Reset Your Password</h2>
    <p>Hi ${name},</p>
    <p>Click the link below to reset your password (valid for 1 hour):</p>
    <a href="${resetUrl}">${resetUrl}</a>
  `;
}

export function otpEmail(name: string, otp: string): string {
  return `
    <h2>Phone Verification OTP</h2>
    <p>Hi ${name},</p>
    <p>Your OTP is: <strong>${otp}</strong></p>
    <p>Valid for 10 minutes.</p>
  `;
}
