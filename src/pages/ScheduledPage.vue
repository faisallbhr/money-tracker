<script setup lang="ts">
import { CalendarClock, Check, Pencil, Plus, Trash2 } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'

import AppButton from '@/components/common/AppButton.vue'
import AppCard from '@/components/common/AppCard.vue'
import AppSheet from '@/components/common/AppSheet.vue'
import ScheduledForm from '@/components/scheduled/ScheduledForm.vue'
import { useFinanceData } from '@/composables/useFinanceData'
import { formatDateIndonesia, todayDate } from '@/domain/date'
import { formatMoney } from '@/domain/money'
import { missingOccurrenceDates } from '@/domain/scheduling/scheduling'
import {
  confirmScheduledOccurrence,
  deactivateScheduledTransaction,
} from '@/repositories/scheduledTransactions'
import type { ScheduledTransaction } from '@/types/models'

const data = useFinanceData()
const showCreate = ref(false)
const editingSchedule = ref<ScheduledTransaction | null>(null)
const confirmingKey = ref('')
const pendingConfirmations = computed(() =>
  data.schedules.value
    .filter((schedule) => schedule.behavior === 'confirmation')
    .flatMap((schedule) =>
      missingOccurrenceDates(
        schedule,
        todayDate(),
        data.transactions.value,
      ).map((occurrenceDate) => ({
        schedule,
        occurrenceDate,
        key: `${schedule.id}:${occurrenceDate}`,
      })),
    ),
)
onMounted(() => data.load())

async function deactivate(id: string) {
  await deactivateScheduledTransaction(id)
  await data.load()
}

async function confirm(schedule: ScheduledTransaction, occurrenceDate: string) {
  confirmingKey.value = `${schedule.id}:${occurrenceDate}`
  try {
    await confirmScheduledOccurrence(schedule, occurrenceDate)
    await data.load()
  } finally {
    confirmingKey.value = ''
  }
}

async function created() {
  showCreate.value = false
  await data.load()
}

async function updated() {
  editingSchedule.value = null
  await data.load()
}
</script>

<template>
  <section class="grid gap-4">
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-sm text-slate-500">Jadwal rutin</p>
        <h2 class="text-2xl font-extrabold tracking-tight">Terjadwal</h2>
      </div>
      <AppButton @click="showCreate = true"
        ><Plus :size="18" />Tambah</AppButton
      >
    </div>

    <p v-if="data.loading.value" class="loading-state">Memuat data...</p>

    <template v-else>
      <section v-if="pendingConfirmations.length" class="grid gap-3">
        <h3 class="section-title">Perlu Konfirmasi</h3>
        <AppCard
          v-for="item in pendingConfirmations"
          :key="item.key"
          tag="article"
        >
          <div class="flex items-center gap-3">
            <span
              class="grid size-12 place-items-center rounded-2xl bg-teal-50 text-teal-700"
            >
              <CalendarClock :size="20" />
            </span>
            <div class="min-w-0 flex-1">
              <h3 class="truncate font-bold">{{ item.schedule.name }}</h3>
              <p class="text-sm text-slate-500">
                {{ formatDateIndonesia(item.occurrenceDate) }} ·
                {{ formatMoney(item.schedule.amountMinor) }}
              </p>
            </div>
            <AppButton
              variant="secondary"
              :disabled="confirmingKey === item.key"
              @click="confirm(item.schedule, item.occurrenceDate)"
            >
              <Check :size="16" />Konfirmasi
            </AppButton>
          </div>
        </AppCard>
      </section>

      <AppCard
        v-for="schedule in data.schedules.value"
        :key="schedule.id"
        tag="article"
      >
        <div class="flex items-center gap-3">
          <span
            class="grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-700"
          >
            <CalendarClock :size="20" />
          </span>
          <div class="min-w-0 flex-1">
            <h3 class="truncate font-bold">{{ schedule.name }}</h3>
            <p class="text-sm font-semibold">
              {{ formatMoney(schedule.amountMinor) }}
            </p>
          </div>
          <div class="flex shrink-0 gap-1">
            <button
              type="button"
              class="grid size-9 place-items-center rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Edit jadwal"
              @click="editingSchedule = schedule"
            >
              <Pencil :size="16" />
            </button>
            <button
              type="button"
              class="grid size-9 place-items-center rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Nonaktifkan jadwal"
              @click="deactivate(schedule.id)"
            >
              <Trash2 :size="16" />
            </button>
          </div>
        </div>
      </AppCard>

      <p v-if="!data.schedules.value.length" class="empty-state">
        Belum ada transaksi terjadwal.
      </p>
    </template>
    <AppSheet
      :open="showCreate"
      title="Tambah Transaksi Terjadwal"
      @close="showCreate = false"
    >
      <ScheduledForm @saved="created" />
    </AppSheet>
    <AppSheet
      :open="Boolean(editingSchedule)"
      title="Ubah Transaksi Terjadwal"
      @close="editingSchedule = null"
    >
      <ScheduledForm
        v-if="editingSchedule"
        :schedule="editingSchedule"
        @saved="updated"
      />
    </AppSheet>
  </section>
</template>
