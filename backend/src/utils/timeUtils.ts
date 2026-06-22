import { DayWorkingHours, TimeRange, WeeklyWorkingHours } from '../types';

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

export function getDayName(date: Date): keyof WeeklyWorkingHours {
  return DAYS[date.getDay()] as keyof WeeklyWorkingHours;
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function addMinutesToTime(time: string, minutes: number): string {
  return minutesToTime(timeToMinutes(time) + minutes);
}

export function rangesOverlap(a: TimeRange, b: TimeRange): boolean {
  const aStart = timeToMinutes(a.startTime);
  const aEnd = timeToMinutes(a.endTime);
  const bStart = timeToMinutes(b.startTime);
  const bEnd = timeToMinutes(b.endTime);
  return aStart < bEnd && bStart < aEnd;
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function isDateOnHoliday(date: Date, holidays: Date[]): boolean {
  return holidays.some((h) => isSameDay(new Date(h), date));
}

export function isStaffDayOff(date: Date, daysOff: Date[]): boolean {
  return daysOff.some((d) => isSameDay(new Date(d), date));
}

export function getWorkingHoursForDay(
  workingHours: WeeklyWorkingHours,
  date: Date
): DayWorkingHours {
  const day = getDayName(date);
  return workingHours[day];
}

export function generateSlots(
  openTime: string,
  closeTime: string,
  durationMinutes: number,
  intervalMinutes: number,
  bookedRanges: TimeRange[]
): string[] {
  const slots: string[] = [];
  const open = timeToMinutes(openTime);
  const close = timeToMinutes(closeTime);
  const step = intervalMinutes;

  for (let start = open; start + durationMinutes <= close; start += step) {
    const slotStart = minutesToTime(start);
    const slotEnd = minutesToTime(start + durationMinutes);
    const slotRange: TimeRange = { startTime: slotStart, endTime: slotEnd };

    const conflicts = bookedRanges.some((booked) => rangesOverlap(slotRange, booked));
    if (!conflicts) {
      slots.push(slotStart);
    }
  }

  return slots;
}

export function hoursUntilAppointment(date: Date, startTime: string): number {
  const [h, m] = startTime.split(':').map(Number);
  const appointment = new Date(date);
  appointment.setHours(h, m, 0, 0);
  return (appointment.getTime() - Date.now()) / (1000 * 60 * 60);
}
