import { db } from '@/database/db'
import { defaultSettings } from '@/database/seed'
import { nowIso } from '@/domain/date'
import type { Settings } from '@/types/models'

export async function getSettings() {
  return (await db.settings.get('default')) || defaultSettings()
}

export async function saveSettings(settings: Settings) {
  await db.settings.put({ ...settings, id: 'default', updatedAt: nowIso() })
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
