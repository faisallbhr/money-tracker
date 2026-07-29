import { db } from '@/database/db'

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
