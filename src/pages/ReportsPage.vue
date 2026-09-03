<script setup lang="ts">
import { ArrowLeftRight, CalendarDays } from 'lucide-vue-next'
import { getDaysInMonth, format } from 'date-fns'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppCard from '@/components/common/AppCard.vue'
import ReportLineChart, {
  type ReportLinePoint,
  type ReportLineSeries,
} from '@/components/reports/ReportLineChart.vue'
import ExpensePieChart from '@/components/reports/ExpensePieChart.vue'
import TransactionDetailModal from '@/components/transactions/TransactionDetailModal.vue'
import TransactionListItem from '@/components/transactions/TransactionListItem.vue'
import { useFinanceData } from '@/composables/useFinanceData'
import { formatMonthIndonesia, transactionDateOnly } from '@/domain/date'
import { formatMoney } from '@/domain/money'
import type { Transaction } from '@/types/models'

interface CategoryReport {
  id: string
  type: 'income' | 'expense'
  name: string
  amountMinor: number
  transactions: Transaction[]
}

const data = useFinanceData()
const route = useRoute()
const router = useRouter()
const selectedMonth = ref(
  typeof route.query.month === 'string' ? route.query.month : '',
)
const reportMode = ref<'expense' | 'income'>('expense')
const selectedCategoryId = ref(
  typeof route.query.category === 'string' ? route.query.category : '',
)
const selectedTransaction = ref<Transaction | null>(null)
const categoryNames = computed(
  () =>
    new Map(
      data.categories.value.map((category) => [category.id, category.name]),
    ),
)
const monthReports = computed(() => {
  const reports = new Map<
    string,
    { month: string; incomeMinor: number; expenseMinor: number; count: number }
  >()

  for (const transaction of data.transactions.value) {
    const month = transactionDateOnly(transaction.transactionDate).slice(0, 7)
    const report = reports.get(month) || {
      month,
      incomeMinor: 0,
      expenseMinor: 0,
      count: 0,
    }
    if (transaction.type === 'income')
      report.incomeMinor += transaction.amountMinor
    if (transaction.type === 'expense')
      report.expenseMinor += transaction.amountMinor
    report.count += 1
    reports.set(month, report)
  }

  return [...reports.values()].sort((left, right) =>
    right.month.localeCompare(left.month),
  )
})
const selectedMonthTransactions = computed(() =>
  data.transactions.value.filter(
    (transaction) =>
      transactionDateOnly(transaction.transactionDate).slice(0, 7) ===
      selectedMonth.value,
  ),
)
const categoryReports = computed<CategoryReport[]>(() => {
  const reports = new Map<string, CategoryReport>()

  for (const transaction of selectedMonthTransactions.value) {
    if (transaction.type !== 'income' && transaction.type !== 'expense')
      continue
    const categoryId = transaction.categoryId || 'uncategorized'
    const id = `${transaction.type}:${categoryId}`
    const report = reports.get(id) || {
      id,
      type: transaction.type,
      name:
        categoryId === 'uncategorized'
          ? 'Lainnya'
          : categoryNames.value.get(categoryId) || 'Lainnya',
      amountMinor: 0,
      transactions: [],
    }
    report.amountMinor += transaction.amountMinor
    report.transactions.push(transaction)
    reports.set(id, report)
  }

  return [...reports.values()].sort(
    (left, right) => right.amountMinor - left.amountMinor,
  )
})
const visibleCategoryReports = computed(() =>
  categoryReports.value.filter(({ type }) => type === reportMode.value),
)
const selectedModeTotal = computed(() =>
  selectedMonthTransactions.value
    .filter(({ type }) => type === reportMode.value)
    .reduce((sum, transaction) => sum + transaction.amountMinor, 0),
)
const selectedCategory = computed(() =>
  categoryReports.value.find(({ id }) => id === selectedCategoryId.value),
)
const categoryTransactions = computed(
  () => selectedCategory.value?.transactions || [],
)
const categoryTotal = computed(() =>
  categoryTransactions.value.reduce(
    (sum, transaction) => sum + transaction.amountMinor,
    0,
  ),
)
const categoryPoints = computed<ReportLinePoint[]>(() => {
  if (!selectedMonth.value) return []
  const days = getDaysInMonth(new Date(`${selectedMonth.value}-01T00:00:00`))
  const totals = new Map<string, number>()
  for (const transaction of categoryTransactions.value) {
    const date = transactionDateOnly(transaction.transactionDate)
    totals.set(date, (totals.get(date) || 0) + transaction.amountMinor)
  }
  return Array.from({ length: days }, (_, index) => {
    const day = `${selectedMonth.value}-${String(index + 1).padStart(2, '0')}`
    return {
      label: format(new Date(`${day}T00:00:00`), 'd'),
      amountMinor: totals.get(day) || 0,
    }
  })
})
const categorySeries = computed<ReportLineSeries[]>(() => [
  {
    points: categoryPoints.value,
    label:
      selectedCategory.value?.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
    color: selectedCategory.value?.type === 'income' ? '#059669' : '#e11d48',
  },
])
function monthLabel(month: string) {
  return formatMonthIndonesia(new Date(`${month}-01T00:00:00`))
}

function openMonth(month: string) {
  selectedMonth.value = month
  selectedCategoryId.value = ''
  void router.replace({ name: 'reports', query: { month } })
}

function openCategory(categoryId: string) {
  selectedCategoryId.value = categoryId
  void router.replace({
    name: 'reports',
    query: { month: selectedMonth.value, category: categoryId },
  })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

watch(
  () => [route.query.month, route.query.category],
  ([month, category]) => {
    selectedMonth.value = typeof month === 'string' ? month : ''
    selectedCategoryId.value = typeof category === 'string' ? category : ''
  },
)
onMounted(() => data.load())
</script>

<template>
  <section class="grid gap-4">
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-sm text-slate-500">Ringkasan dan kategori</p>
        <h2 class="text-2xl font-extrabold tracking-tight">Laporan</h2>
      </div>
      <button
        v-if="selectedMonth && !selectedCategory"
        type="button"
        class="grid size-10 place-items-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
        :aria-label="
          reportMode === 'income'
            ? 'Tampilkan pengeluaran'
            : 'Tampilkan pemasukan'
        "
        :title="
          reportMode === 'income'
            ? 'Tampilkan pengeluaran'
            : 'Tampilkan pemasukan'
        "
        @click="reportMode = reportMode === 'income' ? 'expense' : 'income'"
      >
        <ArrowLeftRight :size="18" />
      </button>
    </div>

    <p v-if="data.loading.value" class="loading-state">Memuat data...</p>

    <template v-else-if="!selectedMonth">
      <AppCard
        v-for="report in monthReports"
        :key="report.month"
        tag="button"
        type="button"
        class="w-full text-left"
        @click="openMonth(report.month)"
      >
        <div class="flex w-full items-center gap-3">
          <span
            class="grid size-12 shrink-0 place-items-center rounded-2xl bg-teal-50 text-teal-700"
          >
            <CalendarDays :size="20" />
          </span>
          <div class="min-w-0 flex-1">
            <h3 class="font-bold">{{ monthLabel(report.month) }}</h3>
            <p class="text-sm text-slate-500">{{ report.count }} transaksi</p>
          </div>
          <div class="shrink-0 text-right text-sm">
            <p class="font-bold text-rose-700">
              {{ formatMoney(report.expenseMinor) }}
            </p>
            <p class="text-xs text-emerald-700">
              {{ formatMoney(report.incomeMinor) }}
            </p>
          </div>
        </div>
      </AppCard>

      <p v-if="!monthReports.length" class="empty-state">
        Belum ada transaksi untuk laporan ini.
      </p>
    </template>

    <template v-else>
      <AppCard v-if="!selectedCategory">
        <div class="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 class="section-title">{{ monthLabel(selectedMonth) }}</h3>
            <p class="section-subtitle">
              {{ reportMode === 'income' ? 'Pemasukan' : 'Pengeluaran' }} per
              kategori
            </p>
          </div>
          <div class="text-right text-sm">
            <p
              class="font-bold"
              :class="
                reportMode === 'income' ? 'text-emerald-700' : 'text-rose-700'
              "
            >
              {{ formatMoney(selectedModeTotal) }}
            </p>
          </div>
        </div>
        <ExpensePieChart :points="visibleCategoryReports" />
      </AppCard>

      <AppCard v-if="!selectedCategory">
        <h3 class="section-title mb-3">Kategori</h3>
        <button
          v-for="category in visibleCategoryReports"
          :key="category.id"
          type="button"
          class="flex min-h-14 w-full items-center justify-between gap-3 border-b border-slate-100 py-3 text-left last:border-0"
          @click="openCategory(category.id)"
        >
          <span>
            <span class="block font-semibold">{{ category.name }}</span>
            <span class="text-xs text-slate-500">
              {{ category.type === 'income' ? 'Pemasukan' : 'Pengeluaran' }} ·
              {{ category.transactions.length }} transaksi
            </span>
          </span>
          <span
            class="text-sm font-bold"
            :class="
              category.type === 'income' ? 'text-emerald-700' : 'text-rose-700'
            "
          >
            {{ formatMoney(category.amountMinor) }}
          </span>
        </button>
        <p v-if="!visibleCategoryReports.length" class="empty-state">
          Belum ada {{ reportMode === 'income' ? 'pemasukan' : 'pengeluaran' }}
          pada bulan ini.
        </p>
      </AppCard>

      <template v-else>
        <AppCard>
          <div class="mb-4 flex items-start justify-between gap-3">
            <div>
              <p class="text-sm text-slate-500">
                {{ monthLabel(selectedMonth) }}
              </p>
              <h3 class="section-title">{{ selectedCategory.name }}</h3>
            </div>
            <p
              class="text-right text-sm font-bold"
              :class="
                selectedCategory.type === 'income'
                  ? 'text-emerald-700'
                  : 'text-rose-700'
              "
            >
              {{ formatMoney(categoryTotal) }}
            </p>
          </div>
          <ReportLineChart :series="categorySeries" />
        </AppCard>
        <AppCard>
          <h3 class="section-title mb-3">Transaksi</h3>
          <TransactionListItem
            v-for="transaction in categoryTransactions"
            :key="transaction.id"
            :transaction="transaction"
            :accounts="data.accounts.value"
            :categories="data.categories.value"
            @select="selectedTransaction = $event"
          />
        </AppCard>
      </template>
    </template>

    <TransactionDetailModal
      :transaction="selectedTransaction"
      :accounts="data.accounts.value"
      :categories="data.categories.value"
      @close="selectedTransaction = null"
    />
  </section>
</template>
