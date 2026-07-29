import Dexie, { type EntityTable } from 'dexie'

import type {
  Account,
  Category,
  Metadata,
  ScheduledTransaction,
  Settings,
  Transaction,
} from '@/types/models'

export class FinanceDatabase extends Dexie {
  accounts!: EntityTable<Account, 'id'>
  transactions!: EntityTable<Transaction, 'id'>
  categories!: EntityTable<Category, 'id'>
  scheduledTransactions!: EntityTable<ScheduledTransaction, 'id'>
  settings!: EntityTable<Settings, 'id'>
  metadata!: EntityTable<Metadata, 'key'>

  constructor() {
    super('personal-finance')
    this.version(1).stores({
      accounts: '&id, type, isArchived',
      transactions:
        '&id, transactionDate, type, accountId, fromAccountId, toAccountId, categoryId, scheduledTransactionId, [scheduledTransactionId+scheduledOccurrenceDate]',
      categories: '&id, type, isArchived',
      scheduledTransactions: '&id, type, isActive, startDate',
      settings: '&id',
      metadata: '&key',
    })
  }
}

export const db = new FinanceDatabase()
