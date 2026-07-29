<script setup lang="ts">
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  type ChartData,
  type ChartOptions,
  LinearScale,
  Tooltip,
} from 'chart.js'
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'

import AppCard from '@/components/common/AppCard.vue'
import { formatMoney } from '@/domain/money'
import type { CashFlowPoint } from '@/domain/dashboard/chartData'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip)

const props = defineProps<{ series: readonly CashFlowPoint[] }>()

const hasData = computed(() =>
  props.series.some((point) => point.incomeMinor > 0 || point.expenseMinor > 0),
)

const chartData = computed<ChartData<'bar'>>(() => ({
  labels: props.series.map((point) => point.label),
  datasets: [
    {
      label: 'Pemasukan',
      data: props.series.map((point) => point.incomeMinor / 100),
      backgroundColor: '#34d399',
      borderRadius: 8,
      maxBarThickness: 18,
    },
    {
      label: 'Pengeluaran',
      data: props.series.map((point) => point.expenseMinor / 100),
      backgroundColor: '#fb7185',
      borderRadius: 8,
      maxBarThickness: 18,
    },
  ],
}))

const chartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 250,
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (item) =>
          `${item.dataset.label}: ${formatMoney(Number(item.raw) * 100)}`,
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#64748b',
      },
    },
    y: {
      grid: {
        color: '#e2e8f0',
      },
      ticks: {
        color: '#64748b',
        callback: (value) => `${Number(value) / 1000}rb`,
      },
    },
  },
}
</script>

<template>
  <AppCard>
    <div class="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 class="section-title">Pergerakan Saldo</h2>
        <p class="section-subtitle">Ringkasan mingguan bulan ini</p>
      </div>
      <div class="flex gap-3 text-xs text-slate-500">
        <span class="inline-flex items-center gap-1"
          ><i class="size-2 rounded-full bg-emerald-400" />Masuk</span
        >
        <span class="inline-flex items-center gap-1"
          ><i class="size-2 rounded-full bg-rose-400" />Keluar</span
        >
      </div>
    </div>
    <div
      v-if="hasData"
      class="h-52"
      aria-label="Grafik pemasukan dan pengeluaran bulanan"
    >
      <Bar :data="chartData" :options="chartOptions" />
    </div>
    <p v-else class="empty-state">
      Belum ada transaksi bulan ini untuk ditampilkan pada grafik.
    </p>
  </AppCard>
</template>
