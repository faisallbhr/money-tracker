import { db } from '@/database/db'
import { nowIso } from '@/domain/date'
import { validateTransactionRules } from '@/domain/transactions/rules'
import type { Transaction, TransactionType } from '@/types/models'

export interface TransactionFilter {
  type?: TransactionType | ''
  accountId?: string
  categoryId?: string
  startDate?: string
  endDate?: string
  search?: string
  limit?: number
}

export async function listTransactions(filter: TransactionFilter = {}) {
  const base =
    filter.startDate || filter.endDate
      ? await db.transactions
          .where('transactionDate')
          .between(
            filter.startDate || '0000-01-01',
            filter.endDate || '9999-12-31',
            true,
            true,
          )
          .toArray()
      : await db.transactions.orderBy('transactionDate').reverse().toArray()

  const filtered = base
    .filter((transaction) => !filter.type || transaction.type === filter.type)
    .filter(
      (transaction) =>
        !filter.accountId ||
        [
          transaction.accountId,
          transaction.fromAccountId,
          transaction.toAccountId,
        ].includes(filter.accountId),
    )
    .filter(
      (transaction) =>
        !filter.categoryId || transaction.categoryId === filter.categoryId,
    )
    .filter(
      (transaction) =>
        !filter.search ||
        (transaction.note || '')
          .toLowerCase()
          .includes(filter.search.toLowerCase()),
    )
    .sort(
      (left, right) =>
        right.transactionDate.localeCompare(left.transactionDate) ||
        right.createdAt.localeCompare(left.createdAt),
    )

  return typeof filter.limit === 'number'
    ? filtered.slice(0, filter.limit)
    : filtered
}

export async function saveTransaction(
  input: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
) {
  const timestamp = nowIso()
  const transaction: Transaction = {
    ...input,
    id: input.id || crypto.randomUUID(),
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  validateTransactionRules(transaction)

  if (input.id)
    await db.transactions.update(input.id, {
      ...transaction,
      createdAt: undefined,
    })
  else await db.transactions.add(transaction)
  return transaction.id
}

export async function listTransactionsForAccount(accountId: string) {
  return listTransactions({ accountId })
}
