import { db } from '@/database/db'
import { nowIso, todayDate } from '@/domain/date'
import {
  createTransactionFromSchedule,
  missingOccurrenceDates,
} from '@/domain/scheduling/scheduling'
import { validateTransactionRules } from '@/domain/transactions/rules'
import type { ScheduledTransaction } from '@/types/models'

export async function listScheduledTransactions(includeInactive = false) {
  const schedules = await db.scheduledTransactions.toArray()
  const visibleSchedules = includeInactive
    ? schedules
    : schedules.filter((schedule) => schedule.isActive)
  return visibleSchedules.sort((left, right) =>
    left.name.localeCompare(right.name),
  )
}

export async function saveScheduledTransaction(
  input: Omit<
    ScheduledTransaction,
    'id' | 'createdAt' | 'updatedAt' | 'isActive'
  > & { id?: string },
) {
  const timestamp = nowIso()
  const schedule: ScheduledTransaction = {
    ...input,
    id: input.id || crypto.randomUUID(),
    isActive: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  if (input.id)
    await db.scheduledTransactions.update(input.id, {
      ...schedule,
      createdAt: undefined,
    })
  else await db.scheduledTransactions.add(schedule)
  return schedule.id
}

export async function deactivateScheduledTransaction(id: string) {
  await db.scheduledTransactions.update(id, {
    isActive: false,
    updatedAt: nowIso(),
  })
}

export async function processOverdueSchedules() {
  const today = todayDate()
  const schedules = await listScheduledTransactions()
  const transactions = await db.transactions.toArray()
  const confirmationQueue: Array<{
    schedule: ScheduledTransaction
    occurrenceDate: string
  }> = []

  await db.transaction('rw', db.transactions, async () => {
    for (const schedule of schedules) {
      for (const occurrenceDate of missingOccurrenceDates(
        schedule,
        today,
        transactions,
      )) {
        if (schedule.behavior === 'confirmation') {
          confirmationQueue.push({ schedule, occurrenceDate })
          continue
        }
        const transaction = createTransactionFromSchedule(
          schedule,
          occurrenceDate,
        )
        validateTransactionRules(transaction)
        await db.transactions.add(transaction)
        transactions.push(transaction)
      }
    }
  })

  return confirmationQueue
}

export async function confirmScheduledOccurrence(
  schedule: ScheduledTransaction,
  occurrenceDate: string,
) {
  const transaction = createTransactionFromSchedule(schedule, occurrenceDate)
  validateTransactionRules(transaction)
  await db.transactions.add(transaction)
}
