<script setup lang="ts">
import AppModal from '@/components/common/AppModal.vue'
import { formatDateTimeIndonesia } from '@/domain/date'
import { formatMoney } from '@/domain/money'
import type { Account, Category, Transaction } from '@/types/models'

const props = defineProps<{
  transaction: Transaction | null
  accounts: readonly Account[]
  categories: readonly Category[]
}>()
const emit = defineEmits<{ close: [] }>()

const accountName = (id?: string) =>
  props.accounts.find((account) => account.id === id)?.name || 'Akun hilang'
const categoryName = (id?: string) =>
  props.categories.find((category) => category.id === id)?.name ||
  'Tanpa kategori'

function typeLabel(transaction: Transaction) {
  if (transaction.type === 'income') return 'Pemasukan'
  if (transaction.type === 'expense') return 'Pengeluaran'
  if (transaction.type === 'transfer') return 'Transfer'
  return 'Penyesuaian Saldo'
}

function signedAmount(transaction: Transaction) {
  if (transaction.type === 'income')
    return `+${formatMoney(transaction.amountMinor)}`
  if (transaction.type === 'expense')
    return `-${formatMoney(transaction.amountMinor)}`
  if (
    transaction.type === 'adjustment' &&
    transaction.adjustmentDirection === 'decrease'
  ) {
    return `-${formatMoney(transaction.amountMinor)}`
  }
  if (transaction.type === 'adjustment')
    return `+${formatMoney(transaction.amountMinor)}`
  return formatMoney(transaction.amountMinor)
}
</script>

<template>
  <AppModal
    :open="Boolean(transaction)"
    title="Detail Transaksi"
    @close="emit('close')"
  >
    <dl v-if="transaction" class="grid gap-3 text-sm">
      <div class="rounded-xl bg-slate-50 p-3">
        <dt class="text-xs text-slate-500">Nominal</dt>
        <dd
          class="mt-1 text-xl font-extrabold"
          :class="{
            'text-emerald-700': transaction.type === 'income',
            'text-rose-700': transaction.type === 'expense',
          }"
        >
          {{ signedAmount(transaction) }}
        </dd>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <dt class="text-xs text-slate-500">Jenis</dt>
          <dd class="mt-1 font-semibold">{{ typeLabel(transaction) }}</dd>
        </div>
        <div>
          <dt class="text-xs text-slate-500">Tanggal</dt>
          <dd class="mt-1 font-semibold">
            {{ formatDateTimeIndonesia(transaction.transactionDate) }}
          </dd>
        </div>
      </div>

      <div
        v-if="transaction.type === 'transfer'"
        class="grid grid-cols-2 gap-3"
      >
        <div>
          <dt class="text-xs text-slate-500">Dari Akun</dt>
          <dd class="mt-1 font-semibold">
            {{ accountName(transaction.fromAccountId) }}
          </dd>
        </div>
        <div>
          <dt class="text-xs text-slate-500">Ke Akun</dt>
          <dd class="mt-1 font-semibold">
            {{ accountName(transaction.toAccountId) }}
          </dd>
        </div>
      </div>

      <div v-else>
        <dt class="text-xs text-slate-500">Akun</dt>
        <dd class="mt-1 font-semibold">
          {{ accountName(transaction.accountId) }}
        </dd>
      </div>

      <div
        v-if="transaction.type === 'income' || transaction.type === 'expense'"
      >
        <dt class="text-xs text-slate-500">Kategori</dt>
        <dd class="mt-1 font-semibold">
          {{ categoryName(transaction.categoryId) }}
        </dd>
      </div>

      <div>
        <dt class="text-xs text-slate-500">Catatan</dt>
        <dd class="mt-1 whitespace-pre-wrap font-semibold">
          {{ transaction.note || '-' }}
        </dd>
      </div>
    </dl>
  </AppModal>
</template>
