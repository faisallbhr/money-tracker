<script setup lang="ts">
import { Landmark, Pencil, Plus, WalletCards } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'

import AccountForm from '@/components/accounts/AccountForm.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppModal from '@/components/common/AppModal.vue'
import { useFinanceData } from '@/composables/useFinanceData'
import type { Account } from '@/types/models'
import { accountTypeLabel } from '@/utils/labels'

const data = useFinanceData()
const editingAccount = ref<Account | null>(null)
const showCreate = ref(false)

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
        <p class="text-sm text-slate-500">Daftar akun tersimpan</p>
        <h2 class="text-2xl font-extrabold tracking-tight">Akun</h2>
      </div>
      <AppButton @click="showCreate = true"
        ><Plus :size="18" />Tambah</AppButton
      >
    </div>

    <p v-if="data.loading.value" class="loading-state">Memuat data...</p>

    <template v-else>
      <article
        v-for="account in data.accounts.value"
        :key="account.id"
        class="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100"
      >
        <div class="flex items-center gap-3">
          <RouterLink
            :to="`/accounts/${account.id}`"
            class="flex min-w-0 flex-1 items-center gap-3"
          >
            <span
              class="grid size-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700"
            >
              <WalletCards
                v-if="account.type === 'cash' || account.type === 'ewallet'"
                :size="18"
              />
              <Landmark v-else :size="18" />
            </span>
            <div class="min-w-0">
              <h3 class="truncate font-bold">{{ account.name }}</h3>
              <p class="text-sm text-slate-500">
                {{ accountTypeLabel(account.type) }}
              </p>
            </div>
          </RouterLink>
          <AppButton
            variant="ghost"
            aria-label="Edit akun"
            @click="editingAccount = account"
            ><Pencil :size="16"
          /></AppButton>
        </div>
      </article>

      <p v-if="!data.accounts.value.length" class="empty-state">
        Belum ada akun. Tambahkan akun pertama untuk mulai mencatat saldo.
      </p>
    </template>

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
