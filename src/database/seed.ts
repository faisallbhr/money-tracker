import { db } from '@/database/db'
import { nowIso } from '@/domain/date'
import type { Category, Settings } from '@/types/models'

const incomeCategories = [
  'Gaji',
  'Bonus',
  'Freelance',
  'Bisnis',
  'Hadiah',
  'Refund',
  'Pemasukan Lainnya',
]
const expenseCategories = [
  'Makanan & Minuman',
  'Transportasi',
  'Belanja',
  'Tagihan',
  'Tempat Tinggal',
  'Hiburan',
  'Kesehatan',
  'Pendidikan',
  'Langganan',
  'Pengeluaran Lainnya',
]

export async function seedDefaults() {
  await db.transaction('rw', db.categories, db.settings, async () => {
    if ((await db.categories.count()) === 0) {
      const timestamp = nowIso()
      const categories: Category[] = [
        ...incomeCategories.map((name) => category(name, 'income', timestamp)),
        ...expenseCategories.map((name) =>
          category(name, 'expense', timestamp),
        ),
      ]
      await db.categories.bulkAdd(categories)
    }

    const settings = await db.settings.get('default')
    if (!settings) {
      await db.settings.add(defaultSettings())
    }
  })
}

function category(
  name: string,
  type: Category['type'],
  timestamp: string,
): Category {
  return {
    id: crypto.randomUUID(),
    name,
    type,
    isDefault: true,
    isArchived: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

export function defaultSettings(): Settings {
  return {
    id: 'default',
    firstDayOfWeek: 1,
    scheduledTransactionDefaultBehavior: 'confirmation',
    updatedAt: nowIso(),
  }
}
