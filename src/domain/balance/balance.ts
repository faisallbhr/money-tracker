import type { Account, Transaction } from '@/types/models'

export function transactionImpactForAccount(
  transaction: Transaction,
  accountId: string,
) {
  if (transaction.type === 'income' && transaction.accountId === accountId)
    return transaction.amountMinor
  if (transaction.type === 'expense' && transaction.accountId === accountId)
    return -transaction.amountMinor
  if (transaction.type === 'transfer' && transaction.toAccountId === accountId)
    return transaction.amountMinor
  if (
    transaction.type === 'transfer' &&
    transaction.fromAccountId === accountId
  )
    return -transaction.amountMinor
  if (
    transaction.type === 'adjustment' &&
    transaction.accountId === accountId
  ) {
    return transaction.adjustmentDirection === 'decrease'
      ? -transaction.amountMinor
      : transaction.amountMinor
  }
  return 0
}

export function calculateAccountBalance(
  account: Account,
  transactions: readonly Transaction[],
) {
  return transactions.reduce(
    (balance, transaction) =>
      balance + transactionImpactForAccount(transaction, account.id),
    account.initialBalanceMinor,
  )
}

export function calculateAccountBalances(
  accounts: readonly Account[],
  transactions: readonly Transaction[],
) {
  return accounts.map((account) => ({
    account,
    balanceMinor: calculateAccountBalance(account, transactions),
  }))
}

export function calculateTotalBalance(
  accounts: readonly Account[],
  transactions: readonly Transaction[],
) {
  return calculateAccountBalances(accounts, transactions).reduce(
    (total, item) => total + item.balanceMinor,
    0,
  )
}
