<script setup lang="ts">
import { onMounted, ref } from 'vue'

import AppButton from '@/components/common/AppButton.vue'
import AppCard from '@/components/common/AppCard.vue'
import AppInput from '@/components/common/AppInput.vue'
import { APP_VERSION } from '@/config/app'
import { seedDefaults } from '@/database/seed'
import {
  getSettings,
  resetAllData,
  setIncludeSavingsInTotal,
} from '@/repositories/settings'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()
const confirmReset = ref('')
const resetting = ref(false)
const includeSavingsInTotal = ref(true)

onMounted(async () => {
  includeSavingsInTotal.value = (await getSettings()).includeSavingsInTotal
})

async function updateIncludeSavings() {
  await setIncludeSavingsInTotal(includeSavingsInTotal.value)
  toast.show('Pengaturan disimpan.', 'success')
}

async function resetData() {
  if (confirmReset.value !== 'RESET' || resetting.value) return
  resetting.value = true
  try {
    await resetAllData()
    await seedDefaults()
    confirmReset.value = ''
    toast.show('Semua data sudah direset.', 'success')
  } finally {
    resetting.value = false
  }
}
</script>

<template>
  <section class="grid gap-4">
    <div>
      <p class="text-sm text-slate-500">Preferensi lokal aplikasi</p>
      <h2 class="text-2xl font-extrabold tracking-tight">Lainnya</h2>
    </div>

    <p
      class="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-100"
    >
      Data tersimpan hanya di browser ini dan dapat hilang jika data situs
      dibersihkan.
    </p>

    <AppCard>
      <label class="flex cursor-pointer items-start justify-between gap-4">
        <span>
          <span class="block font-bold text-slate-800"
            >Tabungan di Total Saldo</span
          >
          <span class="mt-1 block text-sm text-slate-500">
            Sertakan saldo dompet bertipe Tabungan di total uang pada Beranda.
          </span>
        </span>
        <input
          v-model="includeSavingsInTotal"
          type="checkbox"
          class="mt-1 size-5 accent-teal-700"
          @change="updateIncludeSavings"
        />
      </label>
    </AppCard>

    <AppCard>
      <h3 class="font-bold text-rose-800">Reset Semua Data</h3>
      <p class="mt-1 text-sm text-slate-500">
        Ketik RESET untuk menghapus Dompet, Transaksi, Kategori, Transaksi
        Terjadwal, dan Pengaturan dari browser ini.
      </p>
      <div class="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <AppInput v-model="confirmReset" label="Konfirmasi" />
        <AppButton
          variant="danger"
          class="sm:mt-6 sm:h-11"
          :disabled="confirmReset !== 'RESET' || resetting"
          @click="resetData"
          >{{ resetting ? 'Mereset...' : 'Reset' }}</AppButton
        >
      </div>
    </AppCard>

    <p class="text-center text-xs text-slate-500">Versi {{ APP_VERSION }}</p>
  </section>
</template>
