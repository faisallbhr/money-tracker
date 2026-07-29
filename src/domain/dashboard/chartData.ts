import { endOfMonth, format, startOfMonth } from 'date-fns'

import { dateOnlyIsBetween } from '@/domain/date'
import type { Category, Transaction } from '@/types/models'

export interface ExpenseCategoryPoint {
  name: string
  amountMinor: number
  percentage: number
}

export function getTopExpenseCategories(
  transactions: readonly Transaction[],
  categories: readonly Category[],
  month: Date,
  limit = 5,
): ExpenseCategoryPoint[] {
  const startDate = format(startOfMonth(month), 'yyyy-MM-dd')
  const endDate = format(endOfMonth(month), 'yyyy-MM-dd')
  const categoryNames = new Map(
    categories.map((category) => [category.id, category.name]),
  )
  const totals = new Map<string, number>()

  for (const transaction of transactions) {
    if (transaction.type !== 'expense') continue
    if (!dateOnlyIsBetween(transaction.transactionDate, startDate, endDate))
      continue

    const name = transaction.categoryId
      ? categoryNames.get(transaction.categoryId) || 'Lainnya'
      : 'Lainnya'
    totals.set(name, (totals.get(name) || 0) + transaction.amountMinor)
  }

  const sorted = [...totals.entries()]
    .map(([name, amountMinor]) => ({ name, amountMinor }))
    .sort((left, right) => right.amountMinor - left.amountMinor)

  const visible = sorted.slice(0, limit)
  const remaining = sorted
    .slice(limit)
    .reduce((total, item) => total + item.amountMinor, 0)
  if (remaining > 0) visible.push({ name: 'Lainnya', amountMinor: remaining })

  const totalExpense = visible.reduce(
    (total, item) => total + item.amountMinor,
    0,
  )
  return visible.map((item) => ({
    ...item,
    percentage: totalExpense
      ? Math.round((item.amountMinor / totalExpense) * 100)
      : 0,
  }))
}
