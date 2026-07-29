import { endOfMonth, format, getDate, startOfMonth } from 'date-fns'

import {
  dateOnlyIsBetween,
  parseDateOnly,
  transactionDateOnly,
} from '@/domain/date'
import type { Category, Transaction } from '@/types/models'

export interface CashFlowPoint {
  label: string
  incomeMinor: number
  expenseMinor: number
}

export interface ExpenseCategoryPoint {
  name: string
  amountMinor: number
  percentage: number
}

export function getMonthlyCashFlowSeries(
  transactions: readonly Transaction[],
  month: Date,
): CashFlowPoint[] {
  const weeks = [
    { label: 'M1', startDay: 1, endDay: 7 },
    { label: 'M2', startDay: 8, endDay: 14 },
    { label: 'M3', startDay: 15, endDay: 21 },
    { label: 'M4', startDay: 22, endDay: 28 },
    { label: 'M5', startDay: 29, endDay: 31 },
  ]
  const monthKey = format(month, 'yyyy-MM')

  return weeks.map((week) => {
    const weekTransactions = transactions.filter((transaction) => {
      const date = transactionDateOnly(transaction.transactionDate)
      if (!date.startsWith(monthKey)) return false
      const day = getDate(parseDateOnly(date))
      return day >= week.startDay && day <= week.endDay
    })

    return weekTransactions.reduce(
      (point, transaction) => {
        if (transaction.type === 'income')
          point.incomeMinor += transaction.amountMinor
        if (transaction.type === 'expense')
          point.expenseMinor += transaction.amountMinor
        return point
      },
      { label: week.label, incomeMinor: 0, expenseMinor: 0 },
    )
  })
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
