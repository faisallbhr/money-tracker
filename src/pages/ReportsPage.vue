<script setup lang="ts">
import { CalendarDays } from 'lucide-vue-next'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import AppCard from '@/components/common/AppCard.vue'
import ExpensePieChart from '@/components/reports/ExpensePieChart.vue'
import TransactionDetailModal from '@/components/transactions/TransactionDetailModal.vue'
import TransactionListItem from '@/components/transactions/TransactionListItem.vue'
import { useFinanceData } from '@/composables/useFinanceData'
import { formatMonthIndonesia, transactionDateOnly } from '@/domain/date'
import { formatMoney } from '@/domain/money'
import type { Transaction } from '@/types/models'

interface CategoryReport {
  id: string
  name: string
  amountMinor: number
  transactions: Transaction[]
}

const data = useFinanceData()
const route = useRoute()
const selectedMonth = ref('')
const selectedCategoryId = ref('')
const selectedTransaction = ref<Transaction | null>(null)
const transactionLimit = ref(25)
const loadMoreTarget = ref<HTMLElement | null>(null)
let loadMoreObserver: IntersectionObserver | null = null
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
const selectedMonthReport = computed(() =>
  monthReports.value.find((report) => report.month === selectedMonth.value),
)
const categoryReports = computed<CategoryReport[]>(() => {
  const reports = new Map<string, CategoryReport>()

  for (const transaction of selectedMonthTransactions.value) {
    if (transaction.type !== 'expense') continue
    const id = transaction.categoryId || 'uncategorized'
    const report = reports.get(id) || {
      id,
      name:
        id === 'uncategorized'
          ? 'Lainnya'
          : categoryNames.value.get(id) || 'Lainnya',
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
const selectedCategory = computed(() =>
  categoryReports.value.find(
    (report) => report.id === selectedCategoryId.value,
  ),
)
const visibleCategoryTransactions = computed(
  () =>
    selectedCategory.value?.transactions.slice(0, transactionLimit.value) || [],
)
const hasMoreCategoryTransactions = computed(
  () =>
    Boolean(selectedCategory.value) &&
    visibleCategoryTransactions.value.length <
      selectedCategory.value!.transactions.length,
)

function monthLabel(month: string) {
  return formatMonthIndonesia(new Date(`${month}-01T00:00:00`))
}

function openMonth(month: string) {
  selectedMonth.value = month
  selectedCategoryId.value = ''
}

async function load() {
  await data.load()
  if (typeof route.query.month === 'string') {
    selectedMonth.value = route.query.month
  }
}

function loadMoreTransactions() {
  if (hasMoreCategoryTransactions.value) transactionLimit.value += 25
}

async function observeLoadMoreTarget() {
  loadMoreObserver?.disconnect()
  await nextTick()
  if (!loadMoreTarget.value) return
  loadMoreObserver = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) loadMoreTransactions()
  })
  loadMoreObserver.observe(loadMoreTarget.value)
}

watch(selectedCategoryId, () => {
  transactionLimit.value = 25
  void observeLoadMoreTarget()
})
watch(hasMoreCategoryTransactions, () => void observeLoadMoreTarget())
watch(
  () => route.query.month,
  (month) => {
    if (typeof month === 'string') selectedMonth.value = month
  },
)
onMounted(load)
onBeforeUnmount(() => loadMoreObserver?.disconnect())
</script>

<template>
  <section class="grid gap-4">
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-sm text-slate-500">Ringkasan dan kategori</p>
        <h2 class="text-2xl font-extrabold tracking-tight">Laporan</h2>
      </div>
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
      <AppCard>
        <div class="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 class="section-title">{{ monthLabel(selectedMonth) }}</h3>
            <p class="section-subtitle">Pengeluaran per kategori</p>
          </div>
          <div v-if="selectedMonthReport" class="text-right text-sm">
            <p class="font-bold text-rose-700">
              {{ formatMoney(selectedMonthReport.expenseMinor) }}
            </p>
            <p class="text-xs text-emerald-700">
              {{ formatMoney(selectedMonthReport.incomeMinor) }}
            </p>
          </div>
        </div>
        <ExpensePieChart :points="categoryReports" />
      </AppCard>

      <AppCard>
        <h3 class="section-title mb-3">Kategori</h3>
        <button
          v-for="category in categoryReports"
          :key="category.id"
          type="button"
          class="flex min-h-14 w-full items-center justify-between gap-3 border-b border-slate-100 py-3 text-left last:border-0"
          @click="
            selectedCategoryId =
              selectedCategoryId === category.id ? '' : category.id
          "
        >
          <span>
            <span class="block font-semibold">{{ category.name }}</span>
            <span class="text-xs text-slate-500">
              {{ category.transactions.length }} transaksi
            </span>
          </span>
          <span class="text-sm font-bold text-rose-700">
            {{ formatMoney(category.amountMinor) }}
          </span>
        </button>
        <p v-if="!categoryReports.length" class="empty-state">
          Belum ada pengeluaran pada bulan ini.
        </p>
      </AppCard>

      <AppCard v-if="selectedCategory">
        <h3 class="section-title mb-2">{{ selectedCategory.name }}</h3>
        <TransactionListItem
          v-for="transaction in visibleCategoryTransactions"
          :key="transaction.id"
          :transaction="transaction"
          :accounts="data.accounts.value"
          :categories="data.categories.value"
          @select="selectedTransaction = $event"
        />
        <div
          v-if="hasMoreCategoryTransactions"
          ref="loadMoreTarget"
          class="h-8"
          aria-hidden="true"
        />
      </AppCard>
    </template>

    <TransactionDetailModal
      :transaction="selectedTransaction"
      :accounts="data.accounts.value"
      :categories="data.categories.value"
      @close="selectedTransaction = null"
    />
  </section>
</template>
