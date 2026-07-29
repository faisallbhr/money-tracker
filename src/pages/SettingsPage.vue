<script setup lang="ts">
import { onMounted, ref } from 'vue'

import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppSelect from '@/components/common/AppSelect.vue'
import { APP_VERSION } from '@/config/app'
import { seedDefaults } from '@/database/seed'
import { resetAllData } from '@/repositories/settings'
import { useSettingsStore } from '@/stores/settings'
import { useToastStore } from '@/stores/toast'

const settings = useSettingsStore()
const toast = useToastStore()
const confirmReset = ref('')
const saving = ref(false)
const resetting = ref(false)

onMounted(() => settings.load())

async function save() {
  if (!settings.settings || saving.value) return
  saving.value = true
  try {
    await settings.save(settings.settings)
    toast.show('Pengaturan tersimpan.', 'success')
  } finally {
    saving.value = false
  }
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
  <p v-if="settings.loading || !settings.settings" class="loading-state">
    Memuat data...
  </p>

  <section v-else class="grid gap-4">
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

    <form class="soft-card grid gap-4" @submit.prevent="save">
      <AppSelect
        v-model="settings.settings.firstDayOfWeek"
        label="Awal Minggu"
        :options="[
          { label: 'Minggu', value: 0 },
          { label: 'Senin', value: 1 },
        ]"
      />
      <AppSelect
        v-model="settings.settings.scheduledTransactionDefaultBehavior"
        label="Perilaku Default Transaksi Terjadwal"
        :options="[
          { label: 'Otomatis', value: 'automatic' },
          { label: 'Konfirmasi', value: 'confirmation' },
        ]"
      />
      <AppButton type="submit" :disabled="saving">
        {{ saving ? 'Menyimpan...' : 'Simpan' }}
      </AppButton>
    </form>

    <section class="soft-card">
      <h3 class="font-bold text-rose-800">Reset Semua Data</h3>
      <p class="mt-1 text-sm text-slate-500">
        Ketik RESET untuk menghapus Akun, Transaksi, Kategori, Transaksi
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
    </section>

    <p class="text-center text-xs text-slate-500">Versi {{ APP_VERSION }}</p>
  </section>
</template>
