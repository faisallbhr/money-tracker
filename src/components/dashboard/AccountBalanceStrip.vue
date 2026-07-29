<script setup lang="ts">
import { Landmark, WalletCards } from 'lucide-vue-next'

import { formatMoney } from '@/domain/money'
import type { Account } from '@/types/models'
import { accountTypeLabel } from '@/utils/labels'

defineProps<{
  items: readonly { account: Account; balanceMinor: number }[]
}>()
</script>

<template>
  <section>
    <div class="mb-3 flex items-center justify-between">
      <h2 class="section-title">Akun</h2>
      <RouterLink to="/accounts" class="text-sm font-medium text-teal-700"
        >Lihat Semua</RouterLink
      >
    </div>
    <div
      v-if="items.length"
      class="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none]"
    >
      <RouterLink
        v-for="item in items"
        :key="item.account.id"
        :to="`/accounts/${item.account.id}`"
        class="min-w-52 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition active:scale-[0.99]"
      >
        <div class="mb-3 flex items-center gap-2">
          <span
            class="grid size-9 place-items-center rounded-xl bg-teal-50 text-teal-700"
          >
            <WalletCards
              v-if="
                item.account.type === 'cash' || item.account.type === 'ewallet'
              "
              :size="18"
            />
            <Landmark v-else :size="18" />
          </span>
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold">
              {{ item.account.name }}
            </p>
            <p class="text-xs text-slate-500">
              {{ accountTypeLabel(item.account.type) }}
            </p>
          </div>
        </div>
        <p class="text-lg font-bold tracking-tight">
          {{ formatMoney(item.balanceMinor) }}
        </p>
      </RouterLink>
    </div>
    <p v-else class="empty-state">
      Belum ada akun. Tambahkan akun pertama untuk mulai mencatat saldo.
    </p>
  </section>
</template>
