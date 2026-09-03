<script setup lang="ts">
import {
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from 'chart.js'
import { computed } from 'vue'
import { Line } from 'vue-chartjs'

import { formatMoney } from '@/domain/money'

const compactMoney = new Intl.NumberFormat('id-ID', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

export interface ReportLinePoint {
  label: string
  amountMinor: number
}

export interface ReportLineSeries {
  points: readonly ReportLinePoint[]
  label: string
  color: string
}

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip)

const props = defineProps<{ series: readonly ReportLineSeries[] }>()
const chartData = computed<ChartData<'line'>>(() => ({
  labels: props.series[0]?.points.map((point) => point.label) || [],
  datasets: props.series.map((series) => ({
    label: series.label,
    data: series.points.map((point) => point.amountMinor / 100),
    borderColor: series.color,
    backgroundColor: series.color,
    tension: 0.25,
    fill: false,
  })),
}))
const chartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: props.series.length > 1 },
    tooltip: {
      callbacks: {
        label: (item) =>
          `${item.dataset.label}: ${formatMoney(Number(item.raw) * 100)}`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => `Rp ${compactMoney.format(Number(value))}`,
      },
    },
  },
}))
</script>

<template>
  <div class="h-72" aria-label="Grafik laporan harian">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>
