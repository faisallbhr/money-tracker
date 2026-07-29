<script setup lang="ts">
import { CalendarClock, Pencil, Plus, Trash2 } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'

import AppButton from '@/components/common/AppButton.vue'
import AppModal from '@/components/common/AppModal.vue'
import ScheduledForm from '@/components/scheduled/ScheduledForm.vue'
import { useFinanceData } from '@/composables/useFinanceData'
import { formatMoney } from '@/domain/money'
import { deactivateScheduledTransaction } from '@/repositories/scheduledTransactions'
import type { ScheduledTransaction } from '@/types/models'

const data = useFinanceData()
const showCreate = ref(false)
const editingSchedule = ref<ScheduledTransaction | null>(null)
onMounted(() => data.load())

async function deactivate(id: string) {
  await deactivateScheduledTransaction(id)
  await data.load()
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

    <article
      v-for="schedule in data.schedules.value"
      :key="schedule.id"
      class="soft-card"
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
    </article>

    <p v-if="!data.schedules.value.length" class="empty-state">
      Belum ada transaksi terjadwal.
    </p>
    <AppModal
      :open="showCreate"
      title="Tambah Transaksi Terjadwal"
      @close="showCreate = false"
    >
      <ScheduledForm @saved="created" />
    </AppModal>
    <AppModal
      :open="Boolean(editingSchedule)"
      title="Ubah Transaksi Terjadwal"
      @close="editingSchedule = null"
    >
      <ScheduledForm
        v-if="editingSchedule"
        :schedule="editingSchedule"
        @saved="updated"
      />
    </AppModal>
  </section>
</template>
