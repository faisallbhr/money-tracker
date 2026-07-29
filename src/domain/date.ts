import {
  addMonths,
  addWeeks,
  addYears,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  parseISO,
  setDate,
  setMonth,
} from 'date-fns'
import { id } from 'date-fns/locale'

export const todayDate = () => format(new Date(), 'yyyy-MM-dd')
export const nowIso = () => new Date().toISOString()
export const toDateOnly = (date: Date) => format(date, 'yyyy-MM-dd')
export const parseDateOnly = (value: string) => parseISO(`${value}T00:00:00`)

export function clampDayOfMonth(date: Date, day: number) {
  const endDay = endOfMonth(date).getDate()
  return setDate(date, Math.min(day, endDay))
}

export function nextOccurrenceDate(
  date: Date,
  frequency: string,
  interval: number,
) {
  if (frequency === 'weekly') return addWeeks(date, interval)
  if (frequency === 'monthly') return addMonths(date, interval)
  return addYears(date, interval)
}

export function dateOnlyIsBetween(value: string, start?: string, end?: string) {
  const date = parseDateOnly(value)
  if (start && isBefore(date, parseDateOnly(start))) return false
  if (end && isAfter(date, parseDateOnly(end))) return false
  return true
}

export function setMonthOfYear(date: Date, monthOfYear: number) {
  return setMonth(date, monthOfYear - 1)
}

export function formatDateIndonesia(value: string) {
  return format(parseDateOnly(value), 'd MMM yyyy', { locale: id })
}

export function formatMonthIndonesia(date: Date) {
  return format(date, 'MMMM yyyy', { locale: id })
}
