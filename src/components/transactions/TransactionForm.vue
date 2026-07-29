<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'

import CategorySelect from '@/components/categories/CategorySelect.vue'
import AppButton from '@/components/common/AppButton.vue'
import AppDateTimeInput from '@/components/common/AppDateTimeInput.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppSelect from '@/components/common/AppSelect.vue'
import { nowDateTime } from '@/domain/date'
import { parseMoneyToMinor } from '@/domain/money'
import { listAccounts } from '@/repositories/accounts'
import {
  findCategoryByName,
  getCategory,
  saveCategory,
} from '@/repositories/categories'
import { listTransactions, saveTransaction } from '@/repositories/transactions'
import { transactionFormSchema } from '@/schemas/forms'
import { useToastStore } from '@/stores/toast'
import type { Account, TransactionType } from '@/types/models'

const props = defineProps<{ type: TransactionType }>()
const emit = defineEmits<{ saved: [] }>()

const toast = useToastStore()
const accounts = ref<Account[]>([])
const errors = ref<Record<string, string>>({})
const loading = ref(true)
const saving = ref(false)
const form = reactive({
  accountId: '',
  fromAccountId: '',
  toAccountId: '',
  categoryName: '',
  amount: '',
  adjustmentDirection: 'increase',
  note: '',
  transactionDate: nowDateTime(),
})

const accountOptions = computed(() => [
  { label: 'Pilih Akun', value: '' },
  ...accounts.value.map((account) => ({
    label: account.name,
    value: account.id,
  })),
])
const categoryType = computed(() =>
  props.type === 'income' || props.type === 'expense' ? props.type : 'expense',
)

onMounted(async () => {
  try {
    const nextAccounts = await listAccounts()
    accounts.value = nextAccounts

    const [lastTransaction] = await listTransactions({
      type: props.type,
      limit: 1,
    })
    if (!lastTransaction) return

    form.accountId = lastTransaction.accountId || ''
    form.fromAccountId = lastTransaction.fromAccountId || ''
    form.toAccountId = lastTransaction.toAccountId || ''
    form.amount = String(lastTransaction.amountMinor / 100)
    form.note = lastTransaction.note || ''
    form.transactionDate = nowDateTime()
    form.adjustmentDirection =
      lastTransaction.adjustmentDirection || form.adjustmentDirection
    form.categoryName = lastTransaction.categoryId
      ? (await getCategory(lastTransaction.categoryId))?.name || ''
      : ''
  } finally {
    loading.value = false
  }
})

async function submit() {
  if (loading.value || saving.value) return
  errors.value = {}
  const categoryName = form.categoryName.trim()
  const parsed = transactionFormSchema.safeParse({
    type: props.type,
    accountId: form.accountId || undefined,
    fromAccountId: form.fromAccountId || undefined,
    toAccountId: form.toAccountId || undefined,
    amountMinor: parseMoneyToMinor(form.amount) ?? 0,
    adjustmentDirection:
      props.type === 'adjustment' ? form.adjustmentDirection : undefined,
    note: form.note || undefined,
    transactionDate: form.transactionDate,
  })

  if (!parsed.success) {
    errors.value = Object.fromEntries(
      parsed.error.issues.map((issue) => [
        String(issue.path[0]),
        issue.message,
      ]),
    )
    return
  }

  saving.value = true
  try {
    const categoryId =
      categoryName && (props.type === 'income' || props.type === 'expense')
        ? (await findCategoryByName(props.type, categoryName))?.id ||
          (await saveCategory({ name: categoryName, type: props.type }))
        : undefined

    await saveTransaction({ ...parsed.data, categoryId })
    toast.show('Transaksi tersimpan.', 'success')
    emit('saved')
  } catch (error) {
    console.error(error)
    toast.show(
      error instanceof Error ? error.message : 'Gagal menyimpan transaksi.',
      'error',
    )
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="grid gap-5" @submit.prevent="submit">
    <p v-if="loading" class="loading-state">Memuat data...</p>

    <template v-else>
      <div>
        <AppInput
          v-model="form.amount"
          label="Nominal"
          inputmode="numeric"
          format="money"
          :error="errors.amountMinor"
        />
      </div>

      <div v-if="type === 'transfer'" class="grid gap-4">
        <AppSelect
          v-model="form.fromAccountId"
          label="Dari Akun"
          :options="accountOptions"
          :error="errors.fromAccountId"
        />
        <AppSelect
          v-model="form.toAccountId"
          label="Ke Akun"
          :options="accountOptions"
          :error="errors.toAccountId"
        />
      </div>
      <AppSelect
        v-else
        v-model="form.accountId"
        label="Akun"
        :options="accountOptions"
        :error="errors.accountId"
      />

      <AppSelect
        v-if="type === 'adjustment'"
        v-model="form.adjustmentDirection"
        label="Arah Penyesuaian"
        :options="[
          { label: 'Tambah Saldo', value: 'increase' },
          { label: 'Kurangi Saldo', value: 'decrease' },
        ]"
        :error="errors.adjustmentDirection"
      />
      <CategorySelect
        v-if="type === 'income' || type === 'expense'"
        v-model="form.categoryName"
        label="Kategori"
        :type="categoryType"
      />
      <AppDateTimeInput
        v-model="form.transactionDate"
        label="Tanggal & Waktu"
        :error="errors.transactionDate"
      />
      <AppInput v-model="form.note" label="Catatan" />
    </template>

    <div class="sticky bottom-0 -mx-4 bg-white p-4 sm:static sm:mx-0 sm:p-0">
      <AppButton type="submit" class="w-full" :disabled="loading || saving">
        {{ saving ? 'Menyimpan...' : 'Simpan' }}
      </AppButton>
    </div>
  </form>
</template>
