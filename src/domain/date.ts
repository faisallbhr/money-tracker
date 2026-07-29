import {
  addMonths,
  addWeeks,
  addYears,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  isValid,
  parse,
  parseISO,
  setDate,
  setMonth,
} from 'date-fns'
import { id } from 'date-fns/locale'

export const todayDate = () => format(new Date(), 'yyyy-MM-dd')
export const nowDateTime = () => format(new Date(), 'yyyy-MM-dd HH:mm:ss')
export const nowIso = () => new Date().toISOString()
export const toDateOnly = (date: Date) => format(date, 'yyyy-MM-dd')
export const parseDateOnly = (value: string) => parseISO(`${value}T00:00:00`)
export const transactionDateOnly = (value: string) => value.slice(0, 10)

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
  const date = parseDateOnly(transactionDateOnly(value))
  if (start && isBefore(date, parseDateOnly(start))) return false
  if (end && isAfter(date, parseDateOnly(end))) return false
  return true
}

export function parseTransactionDateTimeInput(value: string) {
  const trimmed = value.trim()
  const normalizedIso = trimmed.replace('T', ' ')
  const isoMatch = normalizedIso.match(
    /^(\d{4})-(\d{2})-(\d{2})(?: (\d{2}):(\d{2})(?::(\d{2}))?)?$/,
  )
  if (isoMatch) {
    const [, year, month, day, hour = '00', minute = '00', second = '00'] =
      isoMatch
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
  }

  const parsed = parse(trimmed, 'd/M/yyyy H:mm:ss', new Date())
  if (!isValid(parsed)) return null
  return format(parsed, 'yyyy-MM-dd HH:mm:ss')
}

export function formatTransactionDateTimeInput(value: string) {
  const parsed = parseTransactionDateTimeInput(value)
  if (!parsed) return value
  return format(parseISO(parsed.replace(' ', 'T')), 'dd/MM/yyyy HH:mm:ss')
}

export function toDateTimeLocalInput(value: string) {
  const parsed = parseTransactionDateTimeInput(value)
  return parsed ? parsed.replace(' ', 'T') : ''
}

export function fromDateTimeLocalInput(value: string) {
  return parseTransactionDateTimeInput(value) || ''
}

export function setMonthOfYear(date: Date, monthOfYear: number) {
  return setMonth(date, monthOfYear - 1)
}

export function formatDateIndonesia(value: string) {
  return format(parseDateOnly(transactionDateOnly(value)), 'd MMM yyyy', {
    locale: id,
  })
}

export function formatDateTimeIndonesia(value: string) {
  return formatTransactionDateTimeInput(value)
}

export function formatMonthIndonesia(date: Date) {
  return format(date, 'MMMM yyyy', { locale: id })
}
