import { isAfter, isBefore } from 'date-fns'

import {
  clampDayOfMonth,
  nextOccurrenceDate,
  parseDateOnly,
  setMonthOfYear,
  toDateOnly,
} from '@/domain/date'
import type { ScheduledTransaction, Transaction } from '@/types/models'

export function scheduledOccurrenceKey(
  scheduledTransactionId: string,
  scheduledOccurrenceDate: string,
) {
  return `${scheduledTransactionId}:${scheduledOccurrenceDate}`
}

function alignOccurrence(schedule: ScheduledTransaction, date: Date) {
  if (schedule.frequency === 'weekly') return date
  if (schedule.frequency === 'monthly') {
    // Business rule: dates past the end of a month run on that month's last day.
    return clampDayOfMonth(date, schedule.dayOfMonth ?? date.getDate())
  }
  const month = setMonthOfYear(
    date,
    schedule.monthOfYear ?? date.getMonth() + 1,
  )
  return clampDayOfMonth(month, schedule.dayOfMonth ?? date.getDate())
}

export function getDueOccurrenceDates(
  schedule: ScheduledTransaction,
  today: string,
) {
  const dueDates: string[] = []
  let cursor = alignOccurrence(schedule, parseDateOnly(schedule.startDate))
  const todayDate = parseDateOnly(today)
  const endDate = schedule.endDate ? parseDateOnly(schedule.endDate) : undefined

  while (!isAfter(cursor, todayDate)) {
    if (
      !isBefore(cursor, parseDateOnly(schedule.startDate)) &&
      (!endDate || !isAfter(cursor, endDate))
    ) {
      dueDates.push(toDateOnly(cursor))
    }
    cursor = alignOccurrence(
      schedule,
      nextOccurrenceDate(cursor, schedule.frequency, schedule.interval),
    )
  }

  return dueDates
}

export function createTransactionFromSchedule(
  schedule: ScheduledTransaction,
  occurrenceDate: string,
): Transaction {
  const timestamp = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    type: schedule.type,
    accountId: schedule.accountId,
    fromAccountId: schedule.fromAccountId,
    toAccountId: schedule.toAccountId,
    amountMinor: schedule.amountMinor,
    categoryId: schedule.categoryId,
    note: schedule.note,
    transactionDate: occurrenceDate,
    scheduledTransactionId: schedule.id,
    scheduledOccurrenceDate: occurrenceDate,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

export function missingOccurrenceDates(
  schedule: ScheduledTransaction,
  today: string,
  transactions: readonly Transaction[],
) {
  const existingKeys = new Set(
    transactions
      .filter(
        (transaction) => transaction.scheduledTransactionId === schedule.id,
      )
      .map((transaction) =>
        scheduledOccurrenceKey(
          transaction.scheduledTransactionId!,
          transaction.scheduledOccurrenceDate!,
        ),
      ),
  )

  return getDueOccurrenceDates(schedule, today).filter(
    (date) => !existingKeys.has(scheduledOccurrenceKey(schedule.id, date)),
  )
}
