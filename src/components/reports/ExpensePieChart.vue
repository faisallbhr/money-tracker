<script setup lang="ts">
import {
  ArcElement,
  Chart as ChartJS,
  type ChartData,
  type ChartOptions,
  Tooltip,
} from 'chart.js'
import { computed } from 'vue'
import { Pie } from 'vue-chartjs'

import { formatMoney } from '@/domain/money'

export interface ExpensePiePoint {
  name: string
  amountMinor: number
}

ChartJS.register(ArcElement, Tooltip)

const props = defineProps<{ points: readonly ExpensePiePoint[] }>()
const colors = [
  '#0f766e',
  '#e11d48',
  '#2563eb',
  '#ca8a04',
  '#7c3aed',
  '#475569',
]
const hasData = computed(() => props.points.some((point) => point.amountMinor))
const chartData = computed<ChartData<'pie'>>(() => ({
  labels: props.points.map((point) => point.name),
  datasets: [
    {
      data: props.points.map((point) => point.amountMinor / 100),
      backgroundColor: props.points.map(
        (_, index) => colors[index % colors.length],
      ),
      borderColor: '#ffffff',
      borderWidth: 2,
    },
  ],
}))
const chartOptions: ChartOptions<'pie'> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 250 },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (item) =>
          `${item.label}: ${formatMoney(Number(item.raw) * 100)}`,
      },
    },
  },
}
</script>

<template>
  <div v-if="hasData" class="h-64" aria-label="Grafik kategori pengeluaran">
    <Pie :data="chartData" :options="chartOptions" />
  </div>
  <p v-else class="empty-state">
    Belum ada pengeluaran untuk ditampilkan pada grafik.
  </p>
</template>
