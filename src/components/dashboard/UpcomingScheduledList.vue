<script setup lang="ts">
import { CalendarClock } from 'lucide-vue-next'

import AppCard from '@/components/common/AppCard.vue'
import { formatMoney } from '@/domain/money'
import type { ScheduledTransaction } from '@/types/models'
import { behaviorLabel, frequencyLabel } from '@/utils/labels'

defineProps<{ schedules: readonly ScheduledTransaction[] }>()
</script>

<template>
  <AppCard>
    <div class="mb-3 flex items-center justify-between">
      <h2 class="section-title">Transaksi Terjadwal</h2>
      <RouterLink to="/scheduled" class="text-sm font-medium text-teal-700"
        >Lihat Semua</RouterLink
      >
    </div>
    <div v-if="schedules.length" class="grid gap-3">
      <RouterLink
        v-for="schedule in schedules"
        :key="schedule.id"
        to="/scheduled"
        class="flex items-center gap-3 rounded-xl bg-slate-50 p-3"
      >
        <span
          class="grid size-10 place-items-center rounded-xl bg-amber-100 text-amber-700"
        >
          <CalendarClock :size="18" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold">{{ schedule.name }}</p>
          <p class="text-xs text-slate-500">
            {{ frequencyLabel(schedule.frequency) }} ·
            {{ behaviorLabel(schedule.behavior) }}
          </p>
        </div>
        <strong class="shrink-0 text-sm">{{
          formatMoney(schedule.amountMinor)
        }}</strong>
      </RouterLink>
    </div>
    <p v-else class="empty-state">Belum ada transaksi terjadwal.</p>
  </AppCard>
</template>
