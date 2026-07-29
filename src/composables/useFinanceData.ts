import { ref } from 'vue'

import { listAccounts } from '@/repositories/accounts'
import { listCategories } from '@/repositories/categories'
import { listScheduledTransactions } from '@/repositories/scheduledTransactions'
import { getSettings } from '@/repositories/settings'
import {
  listTransactions,
  type TransactionFilter,
} from '@/repositories/transactions'
import type {
  Account,
  Category,
  ScheduledTransaction,
  Settings,
  Transaction,
} from '@/types/models'

export function useFinanceData() {
  const accounts = ref<Account[]>([])
  const transactions = ref<Transaction[]>([])
  const categories = ref<Category[]>([])
  const schedules = ref<ScheduledTransaction[]>([])
  const settings = ref<Settings | null>(null)
  const loading = ref(false)

  async function load(filter: TransactionFilter = {}) {
    loading.value = true
    try {
      const [
        nextAccounts,
        nextTransactions,
        nextCategories,
        nextSchedules,
        nextSettings,
      ] = await Promise.all([
        listAccounts(true),
        listTransactions(filter),
        listCategories(true),
        listScheduledTransactions(),
        getSettings(),
      ])
      accounts.value = nextAccounts
      transactions.value = nextTransactions
      categories.value = nextCategories
      schedules.value = nextSchedules
      settings.value = nextSettings
    } finally {
      loading.value = false
    }
  }

  return {
    accounts,
    transactions,
    categories,
    schedules,
    settings,
    loading,
    load,
  }
}
