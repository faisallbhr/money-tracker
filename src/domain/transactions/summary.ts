import { dateOnlyIsBetween } from '@/domain/date'
import type { Transaction } from '@/types/models'

export function summarizeIncomeExpense(
  transactions: readonly Transaction[],
  startDate: string,
  endDate: string,
) {
  return transactions.reduce(
    (summary, transaction) => {
      if (!dateOnlyIsBetween(transaction.transactionDate, startDate, endDate))
        return summary
      if (transaction.type === 'income')
        summary.incomeMinor += transaction.amountMinor
      if (transaction.type === 'expense')
        summary.expenseMinor += transaction.amountMinor
      return summary
    },
    { incomeMinor: 0, expenseMinor: 0, netMinor: 0 },
  )
}

export function withNetCashFlow(summary: {
  incomeMinor: number
  expenseMinor: number
}) {
  return {
    ...summary,
    netMinor: summary.incomeMinor - summary.expenseMinor,
  }
}
