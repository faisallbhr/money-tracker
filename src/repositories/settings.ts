import { db } from '@/database/db'
import { nowIso } from '@/domain/date'

export async function getSettings() {
  return {
    id: 'default' as const,
    includeSavingsInTotal: true,
    updatedAt: '',
    ...(await db.settings.get('default')),
  }
}

export async function setIncludeSavingsInTotal(value: boolean) {
  await db.settings.put({
    ...(await getSettings()),
    includeSavingsInTotal: value,
    updatedAt: nowIso(),
  })
}

export async function resetAllData() {
  await db.transaction(
    'rw',
    [
      db.accounts,
      db.transactions,
      db.categories,
      db.scheduledTransactions,
      db.settings,
      db.metadata,
    ],
    async () => {
      await Promise.all([
        db.accounts.clear(),
        db.transactions.clear(),
        db.categories.clear(),
        db.scheduledTransactions.clear(),
        db.settings.clear(),
        db.metadata.clear(),
      ])
    },
  )
}
