import { describe, expect, it } from 'vitest'

import {
  calculateAccountBalance,
  calculateTotalBalance,
} from '@/domain/balance/balance'
import {
  getMonthlyCashFlowSeries,
  getTopExpenseCategories,
} from '@/domain/dashboard/chartData'
import {
  getDueOccurrenceDates,
  missingOccurrenceDates,
} from '@/domain/scheduling/scheduling'
import { formatMoneyInput, parseMoneyToMinor } from '@/domain/money'
import {
  withNetCashFlow,
  summarizeIncomeExpense,
} from '@/domain/transactions/summary'
import type {
  Account,
  Category,
  ScheduledTransaction,
  Transaction,
} from '@/types/models'

const account = (id: string, initialBalanceMinor = 0): Account => ({
  id,
  name: id,
  type: 'bank',
  initialBalanceMinor,
  isArchived: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
})

const transaction = (
  input: Partial<Transaction> &
    Pick<Transaction, 'type' | 'amountMinor' | 'transactionDate'>,
): Transaction => ({
  id: crypto.randomUUID(),
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...input,
})

const schedule = (
  input: Partial<ScheduledTransaction> = {},
): ScheduledTransaction => ({
  id: 'rent',
  name: 'Rent',
  type: 'expense',
  accountId: 'bank',
  amountMinor: 100_00,
  frequency: 'monthly',
  interval: 1,
  dayOfMonth: 31,
  startDate: '2026-01-31',
  behavior: 'automatic',
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...input,
})

const category = (id: string, name: string): Category => ({
  id,
  name,
  type: 'expense',
  isDefault: false,
  isArchived: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
})

describe('balance rules', () => {
  it('calculates income, expense, transfer, and Balance Adjustment impact', () => {
    const bank = account('bank', 1_000_00)
    const cash = account('cash', 100_00)
    const transactions: Transaction[] = [
      transaction({
        type: 'income',
        accountId: 'bank',
        amountMinor: 500_00,
        transactionDate: '2026-07-01',
      }),
      transaction({
        type: 'expense',
        accountId: 'bank',
        amountMinor: 125_00,
        transactionDate: '2026-07-02',
      }),
      transaction({
        type: 'transfer',
        fromAccountId: 'bank',
        toAccountId: 'cash',
        amountMinor: 200_00,
        transactionDate: '2026-07-03',
      }),
      transaction({
        type: 'adjustment',
        accountId: 'cash',
        adjustmentDirection: 'decrease',
        amountMinor: 25_00,
        transactionDate: '2026-07-04',
      }),
    ]

    expect(calculateAccountBalance(bank, transactions)).toBe(1_175_00)
    expect(calculateAccountBalance(cash, transactions)).toBe(275_00)
    expect(calculateTotalBalance([bank, cash], transactions)).toBe(1_450_00)
  })
})

describe('money input formatting', () => {
  it('formats and parses Indonesian thousands separators', () => {
    expect(formatMoneyInput('10000')).toBe('10.000')
    expect(parseMoneyToMinor('10.000')).toBe(1_000_000)
  })
})

describe('monthly summary', () => {
  it('ignores Transfer and Balance Adjustment', () => {
    const summary = withNetCashFlow(
      summarizeIncomeExpense(
        [
          transaction({
            type: 'income',
            accountId: 'bank',
            amountMinor: 500_00,
            transactionDate: '2026-07-01',
          }),
          transaction({
            type: 'expense',
            accountId: 'bank',
            amountMinor: 125_00,
            transactionDate: '2026-07-02',
          }),
          transaction({
            type: 'transfer',
            fromAccountId: 'bank',
            toAccountId: 'cash',
            amountMinor: 200_00,
            transactionDate: '2026-07-03',
          }),
          transaction({
            type: 'adjustment',
            accountId: 'cash',
            adjustmentDirection: 'increase',
            amountMinor: 25_00,
            transactionDate: '2026-07-04',
          }),
        ],
        '2026-07-01',
        '2026-07-31',
      ),
    )

    expect(summary).toEqual({
      incomeMinor: 500_00,
      expenseMinor: 125_00,
      netMinor: 375_00,
    })
  })
})

describe('scheduled transactions', () => {
  it('generates missed occurrences and clamps month end', () => {
    expect(getDueOccurrenceDates(schedule(), '2026-04-30')).toEqual([
      '2026-01-31',
      '2026-02-28',
      '2026-03-31',
      '2026-04-30',
    ])
  })

  it('skips occurrences already created', () => {
    expect(
      missingOccurrenceDates(schedule(), '2026-03-31', [
        transaction({
          type: 'expense',
          accountId: 'bank',
          amountMinor: 100_00,
          transactionDate: '2026-02-28',
          scheduledTransactionId: 'rent',
          scheduledOccurrenceDate: '2026-02-28',
        }),
      ]),
    ).toEqual(['2026-01-31', '2026-03-31'])
  })
})

describe('dashboard chart aggregation', () => {
  it('groups monthly income and expense by week and ignores Transfer', () => {
    const series = getMonthlyCashFlowSeries(
      [
        transaction({
          type: 'income',
          accountId: 'bank',
          amountMinor: 500_00,
          transactionDate: '2026-07-03',
        }),
        transaction({
          type: 'expense',
          accountId: 'bank',
          amountMinor: 125_00,
          transactionDate: '2026-07-08',
        }),
        transaction({
          type: 'transfer',
          fromAccountId: 'bank',
          toAccountId: 'cash',
          amountMinor: 200_00,
          transactionDate: '2026-07-08',
        }),
      ],
      new Date('2026-07-10T00:00:00'),
    )

    expect(series[0]).toEqual({
      label: 'M1',
      incomeMinor: 500_00,
      expenseMinor: 0,
    })
    expect(series[1]).toEqual({
      label: 'M2',
      incomeMinor: 0,
      expenseMinor: 125_00,
    })
  })

  it('returns top expense categories and groups the rest as Lainnya', () => {
    const breakdown = getTopExpenseCategories(
      [
        transaction({
          type: 'expense',
          accountId: 'bank',
          categoryId: 'food',
          amountMinor: 300_00,
          transactionDate: '2026-07-03',
        }),
        transaction({
          type: 'expense',
          accountId: 'bank',
          categoryId: 'transport',
          amountMinor: 200_00,
          transactionDate: '2026-07-04',
        }),
        transaction({
          type: 'expense',
          accountId: 'bank',
          categoryId: 'bills',
          amountMinor: 100_00,
          transactionDate: '2026-07-05',
        }),
      ],
      [
        category('food', 'Makanan'),
        category('transport', 'Transportasi'),
        category('bills', 'Tagihan'),
      ],
      new Date('2026-07-10T00:00:00'),
      2,
    )

    expect(breakdown.map((item) => [item.name, item.amountMinor])).toEqual([
      ['Makanan', 300_00],
      ['Transportasi', 200_00],
      ['Lainnya', 100_00],
    ])
  })
})
