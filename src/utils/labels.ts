import type {
  AccountType,
  ScheduledBehavior,
  ScheduledFrequency,
  TransactionType,
} from '@/types/models'

export function accountTypeLabel(type: AccountType) {
  return {
    cash: 'Tunai',
    bank: 'Bank',
    ewallet: 'E-wallet',
    savings: 'Tabungan',
    other: 'Lainnya',
  }[type]
}

export function transactionTypeLabel(type: TransactionType) {
  return {
    income: 'Pemasukan',
    expense: 'Pengeluaran',
    transfer: 'Transfer',
    adjustment: 'Penyesuaian Saldo',
  }[type]
}

export function frequencyLabel(frequency: ScheduledFrequency) {
  return {
    weekly: 'Mingguan',
    monthly: 'Bulanan',
    yearly: 'Tahunan',
  }[frequency]
}

export function behaviorLabel(behavior: ScheduledBehavior) {
  return {
    automatic: 'Otomatis',
    confirmation: 'Konfirmasi',
  }[behavior]
}
