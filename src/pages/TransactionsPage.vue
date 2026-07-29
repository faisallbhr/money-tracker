<script setup lang="ts">
import { SlidersHorizontal } from 'lucide-vue-next'
import { computed, onMounted, reactive, ref } from 'vue'

import AppButton from '@/components/common/AppButton.vue'
import AppCard from '@/components/common/AppCard.vue'
import AppDateTimeInput from '@/components/common/AppDateTimeInput.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppModal from '@/components/common/AppModal.vue'
import AppSelect from '@/components/common/AppSelect.vue'
import TransactionListItem from '@/components/transactions/TransactionListItem.vue'
import { useFinanceData } from '@/composables/useFinanceData'
import type { TransactionType } from '@/types/models'

const data = useFinanceData()
const showFilters = ref(false)
const filters = reactive({
  type: '',
  accountId: '',
  categoryId: '',
  startDate: '',
  endDate: '',
  search: '',
})

const accountOptions = computed(() => [
  { label: 'Semua Akun', value: '' },
  ...data.accounts.value.map((account) => ({
    label: account.name,
    value: account.id,
  })),
])
const categoryOptions = computed(() => [
  { label: 'Semua Kategori', value: '' },
  ...data.categories.value.map((category) => ({
    label: category.name,
    value: category.id,
  })),
])

async function load() {
  await data.load({ ...filters, type: filters.type as TransactionType | '' })
  showFilters.value = false
}

onMounted(load)
</script>

<template>
  <section class="grid gap-4">
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-sm text-slate-500">Riwayat dan pencarian</p>
        <h2 class="text-2xl font-extrabold tracking-tight">Transaksi</h2>
      </div>
      <AppButton variant="secondary" @click="showFilters = true"
        ><SlidersHorizontal :size="18" />Filter</AppButton
      >
    </div>

    <AppInput
      v-model="filters.search"
      label="Cari transaksi"
      placeholder="Cari transaksi"
      hide-label
      inputmode="search"
      @keyup.enter="load"
    />

    <AppCard>
      <p v-if="data.loading.value" class="loading-state">Memuat data...</p>
      <template v-else>
        <TransactionListItem
          v-for="transaction in data.transactions.value"
          :key="transaction.id"
          :transaction="transaction"
          :accounts="data.accounts.value"
          :categories="data.categories.value"
        />
      </template>
      <p
        v-if="!data.loading.value && !data.transactions.value.length"
        class="empty-state"
      >
        Tidak ada transaksi yang cocok.
      </p>
    </AppCard>

    <AppModal
      :open="showFilters"
      title="Filter Transaksi"
      @close="showFilters = false"
    >
      <form class="grid gap-4" @submit.prevent="load">
        <AppSelect
          v-model="filters.type"
          label="Jenis Transaksi"
          :options="[
            { label: 'Semua Jenis', value: '' },
            { label: 'Pemasukan', value: 'income' },
            { label: 'Pengeluaran', value: 'expense' },
            { label: 'Transfer', value: 'transfer' },
            { label: 'Penyesuaian Saldo', value: 'adjustment' },
          ]"
        />
        <AppSelect
          v-model="filters.accountId"
          label="Akun"
          :options="accountOptions"
        />
        <AppSelect
          v-model="filters.categoryId"
          label="Kategori"
          :options="categoryOptions"
        />
        <div class="grid gap-4 sm:grid-cols-2">
          <AppDateTimeInput
            v-model="filters.startDate"
            label="Dari Tanggal & Waktu"
          />
          <AppDateTimeInput
            v-model="filters.endDate"
            label="Sampai Tanggal & Waktu"
          />
        </div>
        <AppButton type="submit" :disabled="data.loading.value">
          {{ data.loading.value ? 'Memuat...' : 'Terapkan Filter' }}
        </AppButton>
      </form>
    </AppModal>
  </section>
</template>
