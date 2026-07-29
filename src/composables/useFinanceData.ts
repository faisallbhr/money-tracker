import { onBeforeUnmount, ref } from 'vue'

import { listAccounts } from '@/repositories/accounts'
import { listCategories } from '@/repositories/categories'
import { listScheduledTransactions } from '@/repositories/scheduledTransactions'
import {
  listTransactions,
  type TransactionFilter,
} from '@/repositories/transactions'
import type {
  Account,
  Category,
  ScheduledTransaction,
  Transaction,
} from '@/types/models'

export function useFinanceData() {
  const accounts = ref<Account[]>([])
  const transactions = ref<Transaction[]>([])
  const categories = ref<Category[]>([])
  const schedules = ref<ScheduledTransaction[]>([])
  const loading = ref(false)
  let lastFilter: TransactionFilter = {}

  async function load(filter: TransactionFilter = {}) {
    lastFilter = filter
    loading.value = true
    try {
      const [nextAccounts, nextTransactions, nextCategories, nextSchedules] =
        await Promise.all([
          listAccounts(true),
          listTransactions(filter),
          listCategories(true),
          listScheduledTransactions(),
        ])
      accounts.value = nextAccounts
      transactions.value = nextTransactions
      categories.value = nextCategories
      schedules.value = nextSchedules
    } finally {
      loading.value = false
    }
  }

  function reload() {
    void load(lastFilter)
  }

  window.addEventListener('finance-data-changed', reload)
  onBeforeUnmount(() => {
    window.removeEventListener('finance-data-changed', reload)
  })

  return {
    accounts,
    transactions,
    categories,
    schedules,
    loading,
    load,
  }
}
