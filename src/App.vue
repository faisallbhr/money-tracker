<script setup lang="ts">
import {
  CalendarClock,
  Home,
  Landmark,
  Plus,
  ReceiptText,
} from 'lucide-vue-next'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { computed, onMounted, ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

import AppButton from '@/components/common/AppButton.vue'
import AppModal from '@/components/common/AppModal.vue'
import AppToast from '@/components/common/AppToast.vue'
import TransactionForm from '@/components/transactions/TransactionForm.vue'
import { processOverdueSchedules } from '@/repositories/scheduledTransactions'
import { useSettingsStore } from '@/stores/settings'
import { useToastStore } from '@/stores/toast'

const settings = useSettingsStore()
const toast = useToastStore()
const route = useRoute()
const showAddMenu = ref(false)
const addType = ref<'income' | 'expense' | 'transfer' | null>(null)
const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW()
const addModalTitle = computed(() => {
  if (addType.value === 'expense') return 'Tambah Pengeluaran'
  if (addType.value === 'income') return 'Tambah Pemasukan'
  if (addType.value === 'transfer') return 'Transfer'
  return 'Tambah Transaksi'
})

const navItems = [
  { to: '/', label: 'Beranda', icon: Home },
  { to: '/transactions', label: 'Transaksi', icon: ReceiptText },
  { to: '/accounts', label: 'Akun', icon: Landmark },
  { to: '/scheduled', label: 'Terjadwal', icon: CalendarClock },
] as const

onMounted(async () => {
  await settings.load()
  try {
    const confirmations = await processOverdueSchedules()
    if (confirmations.length) {
      toast.show(
        `${confirmations.length} Transaksi Terjadwal perlu dikonfirmasi.`,
      )
    }
  } catch (error) {
    console.error(error)
    toast.show('Gagal memproses Transaksi Terjadwal.', 'error')
  }
})

function closeAddMenu() {
  showAddMenu.value = false
  addType.value = null
}

function closePwaPrompt() {
  offlineReady.value = false
  needRefresh.value = false
}

function isNavActive(to: string) {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}
</script>

<template>
  <div class="min-h-screen bg-app text-slate-950">
    <main
      class="mx-auto min-h-screen w-full max-w-4xl px-4 pb-28 pt-5 sm:px-6 lg:px-8"
    >
      <RouterView />
    </main>

    <nav
      class="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/80 bg-white/95 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur"
      aria-label="Navigasi utama"
    >
      <div
        class="mx-auto grid max-w-md grid-cols-5 items-end px-2 pt-2"
        style="padding-bottom: calc(env(safe-area-inset-bottom) + 0.5rem)"
      >
        <RouterLink
          v-for="item in navItems.slice(0, 2)"
          :key="item.to"
          :to="item.to"
          class="mobile-nav-item"
          :class="{ 'mobile-nav-active': isNavActive(item.to) }"
          active-class="mobile-nav-active"
        >
          <component :is="item.icon" :size="20" />
          <span>{{ item.label }}</span>
        </RouterLink>

        <button
          type="button"
          class="-mt-7 flex min-h-16 items-start justify-center focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
          aria-label="Tambah Transaksi"
          @click="showAddMenu = true"
        >
          <span
            class="grid size-14 place-items-center rounded-full bg-teal-700 text-white shadow-lg shadow-teal-700/25"
          >
            <Plus :size="26" />
          </span>
        </button>

        <RouterLink
          v-for="item in navItems.slice(2)"
          :key="item.to"
          :to="item.to"
          class="mobile-nav-item"
          :class="{ 'mobile-nav-active': isNavActive(item.to) }"
          active-class="mobile-nav-active"
        >
          <component :is="item.icon" :size="20" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </div>
    </nav>

    <AppModal :open="showAddMenu" :title="addModalTitle" @close="closeAddMenu">
      <div v-if="!addType" class="grid gap-3">
        <AppButton @click="addType = 'expense'">Tambah Pengeluaran</AppButton>
        <AppButton variant="secondary" @click="addType = 'income'"
          >Tambah Pemasukan</AppButton
        >
        <AppButton variant="secondary" @click="addType = 'transfer'"
          >Transfer</AppButton
        >
      </div>
      <TransactionForm v-if="addType" :type="addType" @saved="closeAddMenu" />
    </AppModal>

    <div
      v-if="offlineReady || needRefresh"
      role="alert"
      class="fixed bottom-24 left-4 right-4 z-50 rounded-2xl bg-white p-4 text-sm shadow-lg ring-1 ring-slate-200 sm:left-auto sm:w-96"
    >
      <p class="mb-3">
        {{
          needRefresh
            ? 'Versi baru tersedia.'
            : 'Aplikasi siap digunakan offline.'
        }}
      </p>
      <div class="flex gap-2">
        <AppButton v-if="needRefresh" @click="updateServiceWorker()"
          >Perbarui</AppButton
        >
        <AppButton variant="secondary" @click="closePwaPrompt">Tutup</AppButton>
      </div>
    </div>
    <AppToast />
  </div>
</template>
