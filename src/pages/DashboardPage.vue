<script setup lang="ts">
import { endOfMonth, format, getDaysInMonth, startOfMonth } from 'date-fns'
import {
  ArrowLeftRight,
  Eye,
  EyeOff,
  Settings,
  TrendingDown,
  TrendingUp,
} from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'

import AppCard from '@/components/common/AppCard.vue'
import UpcomingScheduledList from '@/components/dashboard/UpcomingScheduledList.vue'
import ReportLineChart, {
  type ReportLinePoint,
  type ReportLineSeries,
} from '@/components/reports/ReportLineChart.vue'
import TransactionDetailModal from '@/components/transactions/TransactionDetailModal.vue'
import TransactionListItem from '@/components/transactions/TransactionListItem.vue'
import { useFinanceData } from '@/composables/useFinanceData'
import { calculateTotalBalance } from '@/domain/balance/balance'
import { formatMonthIndonesia, transactionDateOnly } from '@/domain/date'
import { formatMoney } from '@/domain/money'
import {
  summarizeIncomeExpense,
  withNetCashFlow,
} from '@/domain/transactions/summary'
import type { Transaction } from '@/types/models'

const data = useFinanceData()
const showBalanceKey = 'money-tracker-show-balance'
const showBalance = ref(localStorage.getItem(showBalanceKey) !== 'false')
const selectedTransaction = ref<Transaction | null>(null)
const dashboardMode = ref<'expense' | 'income'>('expense')
const now = new Date()
const dashboardLimit = 5
const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')

onMounted(() => data.load())

watch(showBalance, (value) => {
  localStorage.setItem(showBalanceKey, String(value))
})

const totalBalance = computed(() =>
  calculateTotalBalance(data.accounts.value, data.transactions.value),
)
const summary = computed(() =>
  withNetCashFlow(
    summarizeIncomeExpense(data.transactions.value, monthStart, monthEnd),
  ),
)
const dailySeries = computed<ReportLineSeries[]>(() => {
  const totals = new Map<'income' | 'expense', Map<string, number>>([
    ['income', new Map()],
    ['expense', new Map()],
  ])
  for (const transaction of data.transactions.value) {
    if (transaction.type !== 'income' && transaction.type !== 'expense')
      continue
    const date = transactionDateOnly(transaction.transactionDate)
    if (!date.startsWith(monthStart.slice(0, 7))) continue
    const modeTotals = totals.get(transaction.type)!
    modeTotals.set(date, (modeTotals.get(date) || 0) + transaction.amountMinor)
  }
  const points = (type: 'income' | 'expense'): ReportLinePoint[] =>
    Array.from({ length: getDaysInMonth(now) }, (_, index) => {
      const day = `${monthStart.slice(0, 7)}-${String(index + 1).padStart(2, '0')}`
      return {
        label: format(new Date(`${day}T00:00:00`), 'd'),
        amountMinor: totals.get(type)!.get(day) || 0,
      }
    })
  return [
    { label: 'Pemasukan', color: '#059669', points: points('income') },
    { label: 'Pengeluaran', color: '#e11d48', points: points('expense') },
  ]
})
const visibleDailySeries = computed(() =>
  dailySeries.value.filter((series) =>
    dashboardMode.value === 'income'
      ? series.label === 'Pemasukan'
      : series.label === 'Pengeluaran',
  ),
)
const recentTransactions = computed(() =>
  data.transactions.value.slice(0, dashboardLimit),
)
const recentReportTo = computed(() => {
  const [latestTransaction] = recentTransactions.value
  if (!latestTransaction) return '/reports'
  return `/reports?month=${transactionDateOnly(latestTransaction.transactionDate).slice(0, 7)}`
})
const upcomingSchedules = computed(() =>
  data.schedules.value.slice(0, dashboardLimit),
)
</script>

<template>
  <section class="grid gap-5">
    <div class="flex items-end justify-between gap-3">
      <div>
        <p class="text-sm font-medium text-slate-500">
          {{ formatMonthIndonesia(now) }}
        </p>
        <h2 class="text-2xl font-extrabold tracking-tight">Beranda</h2>
      </div>
      <div class="flex gap-2">
        <RouterLink
          to="/settings"
          class="grid size-10 place-items-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-100"
          aria-label="Pengaturan"
        >
          <Settings :size="18" />
        </RouterLink>
      </div>
    </div>

    <p v-if="data.loading.value" class="loading-state">Memuat data...</p>

    <template v-else>
      <section
        class="overflow-hidden rounded-2xl bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-500 p-5 text-white shadow-lg shadow-teal-700/20"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm text-teal-50">Total Saldo</p>
            <p class="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {{ showBalance ? formatMoney(totalBalance) : 'Rp••••••' }}
            </p>
          </div>
          <button
            type="button"
            class="grid size-11 place-items-center rounded-full bg-white/15 focus:outline-none focus:ring-2 focus:ring-white"
            :aria-label="showBalance ? 'Sembunyikan saldo' : 'Tampilkan saldo'"
            @click="showBalance = !showBalance"
          >
            <EyeOff v-if="showBalance" :size="20" />
            <Eye v-else :size="20" />
          </button>
        </div>

        <div class="mt-5 grid grid-cols-2 gap-2">
          <div class="min-w-0 rounded-2xl bg-white/12 p-3">
            <TrendingUp :size="17" class="mb-2" />
            <p class="text-[11px] text-teal-50">Pemasukan</p>
            <p class="truncate text-sm font-bold">
              {{ showBalance ? formatMoney(summary.incomeMinor) : 'Rp••••••' }}
            </p>
          </div>
          <div class="min-w-0 rounded-2xl bg-white/12 p-3">
            <TrendingDown :size="17" class="mb-2" />
            <p class="text-[11px] text-teal-50">Pengeluaran</p>
            <p class="truncate text-sm font-bold">
              {{ showBalance ? formatMoney(summary.expenseMinor) : 'Rp••••••' }}
            </p>
          </div>
        </div>
      </section>

      <AppCard>
        <div class="mb-3 flex items-center justify-between gap-3">
          <h2 class="section-title">
            {{ dashboardMode === 'income' ? 'Pemasukan' : 'Pengeluaran' }}
          </h2>
          <button
            type="button"
            class="grid size-9 place-items-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
            :aria-label="
              dashboardMode === 'income'
                ? 'Tampilkan pengeluaran'
                : 'Tampilkan pemasukan'
            "
            :title="
              dashboardMode === 'income'
                ? 'Tampilkan pengeluaran'
                : 'Tampilkan pemasukan'
            "
            @click="
              dashboardMode = dashboardMode === 'income' ? 'expense' : 'income'
            "
          >
            <ArrowLeftRight :size="18" />
          </button>
        </div>
        <ReportLineChart :series="visibleDailySeries" />
      </AppCard>

      <AppCard>
        <div class="mb-3 flex items-center justify-between">
          <h2 class="section-title">Transaksi Terbaru</h2>
          <RouterLink
            :to="recentReportTo"
            class="text-sm font-medium text-teal-700"
          >
            Lihat Semua
          </RouterLink>
        </div>
        <TransactionListItem
          v-for="transaction in recentTransactions"
          :key="transaction.id"
          :transaction="transaction"
          :accounts="data.accounts.value"
          :categories="data.categories.value"
          @select="selectedTransaction = $event"
        />
        <p v-if="!recentTransactions.length" class="empty-state">
          Belum ada transaksi.
        </p>
      </AppCard>

      <UpcomingScheduledList :schedules="upcomingSchedules" />
    </template>

    <TransactionDetailModal
      :transaction="selectedTransaction"
      :accounts="data.accounts.value"
      :categories="data.categories.value"
      @close="selectedTransaction = null"
    />
  </section>
</template>
