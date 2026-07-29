<script setup lang="ts">
import { Landmark, Pencil, Plus, WalletCards } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'

import AccountForm from '@/components/accounts/AccountForm.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppModal from '@/components/common/AppModal.vue'
import { useFinanceData } from '@/composables/useFinanceData'
import { calculateAccountBalances } from '@/domain/balance/balance'
import { formatMoney } from '@/domain/money'
import type { Account } from '@/types/models'
import { accountTypeLabel } from '@/utils/labels'

const data = useFinanceData()
const editingAccount = ref<Account | null>(null)
const showCreate = ref(false)
const accountBalances = computed(() =>
  calculateAccountBalances(data.accounts.value, data.transactions.value),
)

onMounted(() => data.load())

async function created() {
  showCreate.value = false
  await data.load()
}

async function updated() {
  editingAccount.value = null
  await data.load()
}
</script>

<template>
  <section class="grid gap-4">
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-sm text-slate-500">Saldo tersimpan per akun</p>
        <h2 class="text-2xl font-extrabold tracking-tight">Akun</h2>
      </div>
      <AppButton @click="showCreate = true"
        ><Plus :size="18" />Tambah</AppButton
      >
    </div>

    <article
      v-for="item in accountBalances"
      :key="item.account.id"
      class="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100"
    >
      <div class="flex items-center gap-3">
        <RouterLink
          :to="`/accounts/${item.account.id}`"
          class="flex min-w-0 flex-1 items-center gap-3"
        >
          <span
            class="grid size-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700"
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
            <h3 class="truncate font-bold">{{ item.account.name }}</h3>
            <p class="text-sm text-slate-500">
              {{ accountTypeLabel(item.account.type) }}
            </p>
          </div>
        </RouterLink>
        <div class="text-right">
          <p class="font-extrabold">{{ formatMoney(item.balanceMinor) }}</p>
          <div class="mt-1 flex justify-end gap-2">
            <AppButton
              variant="ghost"
              aria-label="Edit akun"
              @click="editingAccount = item.account"
              ><Pencil :size="16"
            /></AppButton>
          </div>
        </div>
      </div>
    </article>

    <p v-if="!data.accounts.value.length" class="empty-state">
      Belum ada akun. Tambahkan akun pertama untuk mulai mencatat saldo.
    </p>

    <AppModal
      :open="showCreate"
      title="Tambah Akun"
      @close="showCreate = false"
    >
      <AccountForm @saved="created" />
    </AppModal>
    <AppModal
      :open="Boolean(editingAccount)"
      title="Ubah Akun"
      @close="editingAccount = null"
    >
      <AccountForm
        v-if="editingAccount"
        :account="editingAccount"
        @saved="updated"
      />
    </AppModal>
  </section>
</template>
