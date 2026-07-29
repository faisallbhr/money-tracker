<script setup lang="ts">
import AppCard from '@/components/common/AppCard.vue'
import { formatMoney } from '@/domain/money'
import type { ExpenseCategoryPoint } from '@/domain/dashboard/chartData'

defineProps<{ items: readonly ExpenseCategoryPoint[] }>()
</script>

<template>
  <AppCard>
    <h2 class="section-title">Pengeluaran per Kategori</h2>
    <p class="section-subtitle">Lima kategori terbesar bulan ini</p>

    <div v-if="items.length" class="mt-4 grid gap-3">
      <div v-for="item in items" :key="item.name" class="grid gap-1">
        <div class="flex items-center justify-between gap-3 text-sm">
          <span class="min-w-0 truncate font-medium">{{ item.name }}</span>
          <span class="shrink-0 text-slate-600">{{
            formatMoney(item.amountMinor)
          }}</span>
        </div>
        <div class="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            class="h-full rounded-full bg-rose-400"
            :style="{ width: `${item.percentage}%` }"
          />
        </div>
        <p class="text-xs text-slate-500">
          {{ item.percentage }}% dari pengeluaran
        </p>
      </div>
    </div>
    <p v-else class="empty-state">Belum ada pengeluaran bulan ini.</p>
  </AppCard>
</template>
