import type { Transaction } from '@/types/models'

export function validateTransactionRules(transaction: Transaction) {
  if (transaction.amountMinor <= 0)
    throw new Error('Nominal harus lebih dari nol.')

  if (transaction.type === 'transfer') {
    if (!transaction.fromAccountId || !transaction.toAccountId) {
      throw new Error('Transfer membutuhkan akun asal dan akun tujuan.')
    }
    if (transaction.fromAccountId === transaction.toAccountId) {
      throw new Error('Akun transfer harus berbeda.')
    }
    return
  }

  if (!transaction.accountId) throw new Error('Akun wajib diisi.')
  if (transaction.type === 'adjustment' && !transaction.adjustmentDirection) {
    throw new Error('Arah Penyesuaian Saldo wajib diisi.')
  }
}
