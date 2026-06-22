import twilio from 'twilio';
import { env } from '../config/env';

let client: ReturnType<typeof twilio> | null = null;

if (env.twilioAccountSid && env.twilioAuthToken) {
  client = twilio(env.twilioAccountSid, env.twilioAuthToken);
}

export async function sendSms(to: string, message: string): Promise<void> {
  if (!client || !env.twilioPhoneNumber) {
    console.log(`[SMS skipped — Twilio not configured] To: ${to}, Message: ${message}`);
    return;
  }

  await client.messages.create({
    body: message,
    from: env.twilioPhoneNumber,
    to: `+91${to.replace(/^\+91/, '')}`,
  });
}

export function bookingConfirmationSms(date: string, time: string): string {
  return `Your saloon appointment is confirmed for ${date} at ${time}. See you soon!`;
}

export function bookingReminderSms(date: string, time: string): string {
  return `Reminder: Your saloon appointment is in 2 hours — ${date} at ${time}.`;
}
