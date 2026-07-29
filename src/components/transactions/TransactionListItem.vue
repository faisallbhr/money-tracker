<script setup lang="ts">
import { ArrowRightLeft, Minus, Plus, SlidersHorizontal } from 'lucide-vue-next'

import { formatDateTimeIndonesia } from '@/domain/date'
import { formatMoney } from '@/domain/money'
import type { Account, Category, Transaction } from '@/types/models'

const props = defineProps<{
  transaction: Transaction
  accounts: readonly Account[]
  categories: readonly Category[]
}>()
const emit = defineEmits<{ select: [transaction: Transaction] }>()

const accountName = (id?: string) =>
  props.accounts.find((account) => account.id === id)?.name || 'Akun hilang'
const categoryName = (id?: string) =>
  props.categories.find((category) => category.id === id)?.name

function title() {
  if (props.transaction.type === 'income')
    return categoryName(props.transaction.categoryId) || 'Pemasukan'
  if (props.transaction.type === 'expense')
    return categoryName(props.transaction.categoryId) || 'Pengeluaran'
  if (props.transaction.type === 'transfer') return 'Transfer'
  return 'Penyesuaian Saldo'
}

function description() {
  if (props.transaction.type === 'transfer') {
    return `${accountName(props.transaction.fromAccountId)} → ${accountName(props.transaction.toAccountId)}`
  }
  return `${accountName(props.transaction.accountId)} · ${formatDateTimeIndonesia(props.transaction.transactionDate)}`
}

function signedAmount() {
  if (props.transaction.type === 'income')
    return `+${formatMoney(props.transaction.amountMinor)}`
  if (props.transaction.type === 'expense')
    return `-${formatMoney(props.transaction.amountMinor)}`
  if (
    props.transaction.type === 'adjustment' &&
    props.transaction.adjustmentDirection === 'decrease'
  ) {
    return `-${formatMoney(props.transaction.amountMinor)}`
  }
  if (props.transaction.type === 'adjustment')
    return `+${formatMoney(props.transaction.amountMinor)}`
  return formatMoney(props.transaction.amountMinor)
}
</script>

<template>
  <button
    type="button"
    class="flex min-h-[64px] w-full items-center gap-3 border-b border-slate-100 py-3 text-left last:border-0 hover:bg-slate-50 focus:outline-none active:bg-slate-50"
    @click="emit('select', transaction)"
  >
    <div
      class="grid size-11 shrink-0 place-items-center rounded-2xl"
      :class="{
        'bg-emerald-50 text-emerald-700': transaction.type === 'income',
        'bg-rose-50 text-rose-700': transaction.type === 'expense',
        'bg-sky-50 text-sky-700': transaction.type === 'transfer',
        'bg-amber-50 text-amber-700': transaction.type === 'adjustment',
      }"
    >
      <Plus v-if="transaction.type === 'income'" :size="18" />
      <Minus v-else-if="transaction.type === 'expense'" :size="18" />
      <ArrowRightLeft v-else-if="transaction.type === 'transfer'" :size="18" />
      <SlidersHorizontal v-else :size="18" />
    </div>
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-semibold">{{ title() }}</p>
      <p class="truncate text-xs text-slate-500">{{ description() }}</p>
    </div>
    <p
      class="shrink-0 text-right text-sm font-bold"
      :class="{
        'text-emerald-700': transaction.type === 'income',
        'text-rose-700': transaction.type === 'expense',
      }"
    >
      {{ signedAmount() }}
    </p>
  </button>
</template>
