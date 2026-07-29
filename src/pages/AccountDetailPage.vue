<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import AppCard from '@/components/common/AppCard.vue'
import TransactionDetailModal from '@/components/transactions/TransactionDetailModal.vue'
import TransactionListItem from '@/components/transactions/TransactionListItem.vue'
import { useFinanceData } from '@/composables/useFinanceData'
import { calculateAccountBalance } from '@/domain/balance/balance'
import { formatMoney } from '@/domain/money'
import type { Transaction } from '@/types/models'
import { accountTypeLabel } from '@/utils/labels'

const route = useRoute()
const accountId = String(route.params.id)
const data = useFinanceData()
const selectedTransaction = ref<Transaction | null>(null)
onMounted(() => data.load({ accountId }))

const account = computed(() =>
  data.accounts.value.find((item) => item.id === accountId),
)
const balance = computed(() =>
  account.value
    ? calculateAccountBalance(account.value, data.transactions.value)
    : 0,
)
</script>

<template>
  <section class="grid gap-4">
    <p v-if="data.loading.value" class="loading-state">Memuat data...</p>
    <div
      v-else-if="account"
      class="rounded-2xl bg-gradient-to-br from-teal-700 to-emerald-500 p-4 text-white shadow-md shadow-teal-700/20"
    >
      <p class="text-sm text-teal-50">{{ accountTypeLabel(account.type) }}</p>
      <h2 class="mt-1 text-xl font-extrabold">{{ account.name }}</h2>
      <p class="mt-3 text-2xl font-extrabold">{{ formatMoney(balance) }}</p>
    </div>
    <AppCard v-if="!data.loading.value">
      <h3 class="mb-3 section-title">Riwayat Transaksi</h3>
      <TransactionListItem
        v-for="transaction in data.transactions.value"
        :key="transaction.id"
        :transaction="transaction"
        :accounts="data.accounts.value"
        :categories="data.categories.value"
        @select="selectedTransaction = $event"
      />
      <p v-if="!data.transactions.value.length" class="empty-state">
        Belum ada transaksi untuk akun ini.
      </p>
    </AppCard>
    <TransactionDetailModal
      :transaction="selectedTransaction"
      :accounts="data.accounts.value"
      :categories="data.categories.value"
      @close="selectedTransaction = null"
    />
  </section>
</template>
