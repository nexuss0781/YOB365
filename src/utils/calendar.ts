import { SeasonType } from '../types';

export function getDayOfYear(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime() + (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  // Cap to 365 for standard calendar mapping
  return Math.min(365, Math.max(1, day));
}

export function getDateFromDayOfYear(day: number, year: number = new Date().getFullYear()): Date {
  const clampedDay = Math.min(365, Math.max(1, day));
  const date = new Date(year, 0); // Jan 1
  date.setDate(clampedDay);
  return date;
}

export function formatDayToDateString(day: number): string {
  const date = getDateFromDayOfYear(day);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatFullDate(day: number): string {
  const date = getDateFromDayOfYear(day);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
  });
}

export function getSeasonFromDay(day: number): SeasonType {
  // Calendar-based alignment:
  // Days 1 to 90: Spring (Renewal)
  // Days 91 to 181: Summer (Warmth & Energy)
  // Days 182 to 270: Autumn (Golden & Emotional)
  // Days 271 to 365: Winter (Deep Sad, Heavy, Cold, Introspective)
  if (day >= 1 && day <= 90) return 'Spring';
  if (day >= 91 && day <= 181) return 'Summer';
  if (day >= 182 && day <= 270) return 'Autumn';
  return 'Winter';
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const DAYS_IN_MONTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
