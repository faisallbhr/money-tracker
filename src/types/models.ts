export const accountTypes = [
  'cash',
  'bank',
  'ewallet',
  'savings',
  'other',
] as const
export const transactionTypes = [
  'income',
  'expense',
  'transfer',
  'adjustment',
] as const
export const categoryTypes = ['income', 'expense'] as const
export const scheduledFrequencies = ['weekly', 'monthly', 'yearly'] as const
export const scheduledBehaviors = ['automatic', 'confirmation'] as const
export const adjustmentDirections = ['increase', 'decrease'] as const

export type AccountType = (typeof accountTypes)[number]
export type TransactionType = (typeof transactionTypes)[number]
export type CategoryType = (typeof categoryTypes)[number]
export type ScheduledFrequency = (typeof scheduledFrequencies)[number]
export type ScheduledBehavior = (typeof scheduledBehaviors)[number]
export type AdjustmentDirection = (typeof adjustmentDirections)[number]

export interface Account {
  id: string
  name: string
  type: AccountType
  initialBalanceMinor: number
  icon?: string
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  type: TransactionType
  accountId?: string
  fromAccountId?: string
  toAccountId?: string
  amountMinor: number
  adjustmentDirection?: AdjustmentDirection
  categoryId?: string
  note?: string
  transactionDate: string
  scheduledTransactionId?: string
  scheduledOccurrenceDate?: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  type: CategoryType
  icon?: string
  isDefault: boolean
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export interface ScheduledTransaction {
  id: string
  name: string
  type: Exclude<TransactionType, 'adjustment'>
  accountId?: string
  fromAccountId?: string
  toAccountId?: string
  amountMinor: number
  categoryId?: string
  note?: string
  frequency: ScheduledFrequency
  interval: number
  dayOfWeek?: number
  dayOfMonth?: number
  monthOfYear?: number
  startDate: string
  endDate?: string
  behavior: ScheduledBehavior
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Settings {
  id: 'default'
  updatedAt: string
}

export interface Metadata {
  key: string
  value: string
}
