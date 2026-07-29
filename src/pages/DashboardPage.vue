<script setup lang="ts">
import { endOfMonth, format, startOfMonth } from 'date-fns'
import {
  Eye,
  EyeOff,
  Settings,
  TrendingDown,
  TrendingUp,
} from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'

import CashFlowChart from '@/components/dashboard/CashFlowChart.vue'
import ExpenseCategoryBreakdown from '@/components/dashboard/ExpenseCategoryBreakdown.vue'
import UpcomingScheduledList from '@/components/dashboard/UpcomingScheduledList.vue'
import TransactionListItem from '@/components/transactions/TransactionListItem.vue'
import { useFinanceData } from '@/composables/useFinanceData'
import { calculateTotalBalance } from '@/domain/balance/balance'
import { formatMonthIndonesia } from '@/domain/date'
import {
  getMonthlyCashFlowSeries,
  getTopExpenseCategories,
} from '@/domain/dashboard/chartData'
import { formatMoney } from '@/domain/money'
import {
  summarizeIncomeExpense,
  withNetCashFlow,
} from '@/domain/transactions/summary'

const data = useFinanceData()
const showBalance = ref(true)
const now = new Date()
const dashboardLimit = 5
const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')

onMounted(() => data.load())

const totalBalance = computed(() =>
  calculateTotalBalance(data.accounts.value, data.transactions.value),
)
const summary = computed(() =>
  withNetCashFlow(
    summarizeIncomeExpense(data.transactions.value, monthStart, monthEnd),
  ),
)
const cashFlowSeries = computed(() =>
  getMonthlyCashFlowSeries(data.transactions.value, now),
)
const expenseCategories = computed(() =>
  getTopExpenseCategories(
    data.transactions.value,
    data.categories.value,
    now,
    dashboardLimit - 1,
  ),
)
const recentTransactions = computed(() =>
  data.transactions.value.slice(0, dashboardLimit),
)
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
        <RouterLink
          to="/transactions"
          class="rounded-full bg-white px-4 py-2 text-sm font-semibold text-teal-700 shadow-sm ring-1 ring-slate-100"
        >
          Lihat Semua
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

      <CashFlowChart :series="cashFlowSeries" />
      <ExpenseCategoryBreakdown :items="expenseCategories" />

      <section class="soft-card">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="section-title">Transaksi Terbaru</h2>
          <RouterLink
            to="/transactions"
            class="text-sm font-medium text-teal-700"
            >Lihat Semua</RouterLink
          >
        </div>
        <TransactionListItem
          v-for="transaction in recentTransactions"
          :key="transaction.id"
          :transaction="transaction"
          :accounts="data.accounts.value"
          :categories="data.categories.value"
        />
        <p v-if="!recentTransactions.length" class="empty-state">
          Belum ada transaksi.
        </p>
      </section>

      <UpcomingScheduledList :schedules="upcomingSchedules" />
    </template>
  </section>
</template>
