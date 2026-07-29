<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'

import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppSelect from '@/components/common/AppSelect.vue'
import { todayDate } from '@/domain/date'
import { parseMoneyToMinor } from '@/domain/money'
import { listAccounts } from '@/repositories/accounts'
import { listCategories, saveCategory } from '@/repositories/categories'
import { listTransactions, saveTransaction } from '@/repositories/transactions'
import { transactionFormSchema } from '@/schemas/forms'
import { useToastStore } from '@/stores/toast'
import type { Account, Category, TransactionType } from '@/types/models'

const props = defineProps<{ type: TransactionType }>()
const emit = defineEmits<{ saved: [] }>()

const toast = useToastStore()
const accounts = ref<Account[]>([])
const categories = ref<Category[]>([])
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
  transactionDate: todayDate(),
})

const title = computed(() => {
  if (props.type === 'income') return 'Tambah Pemasukan'
  if (props.type === 'expense') return 'Tambah Pengeluaran'
  if (props.type === 'transfer') return 'Transfer'
  return 'Penyesuaian Saldo'
})

const accountOptions = computed(() => [
  { label: 'Pilih Akun', value: '' },
  ...accounts.value.map((account) => ({
    label: account.name,
    value: account.id,
  })),
])
const categorySuggestions = computed(() =>
  categories.value.filter((category) => category.type === props.type),
)
const categoryInputId = computed(() => `category-options-${props.type}`)

onMounted(async () => {
  try {
    const [nextAccounts, nextCategories] = await Promise.all([
      listAccounts(),
      listCategories(),
    ])
    accounts.value = nextAccounts
    categories.value = nextCategories

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
    form.adjustmentDirection =
      lastTransaction.adjustmentDirection || form.adjustmentDirection
    form.categoryName =
      categories.value.find(
        (category) => category.id === lastTransaction.categoryId,
      )?.name || ''
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
    const existingCategory = categories.value.find(
      (category) =>
        category.type === props.type &&
        category.name.toLowerCase() === categoryName.toLowerCase(),
    )
    const categoryId =
      categoryName && (props.type === 'income' || props.type === 'expense')
        ? existingCategory?.id ||
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
    <div>
      <p class="text-sm text-slate-500">{{ title }}</p>
      <AppInput
        v-model="form.amount"
        label="Nominal"
        inputmode="numeric"
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
    <AppInput
      v-if="type === 'income' || type === 'expense'"
      v-model="form.categoryName"
      label="Kategori"
      :list="categoryInputId"
    />
    <datalist :id="categoryInputId">
      <option
        v-for="category in categorySuggestions"
        :key="category.id"
        :value="category.name"
      />
    </datalist>
    <AppInput
      v-model="form.transactionDate"
      label="Tanggal"
      type="date"
      :error="errors.transactionDate"
    />
    <AppInput v-model="form.note" label="Catatan" />

    <div class="sticky bottom-0 -mx-4 bg-white p-4 sm:static sm:mx-0 sm:p-0">
      <AppButton type="submit" class="w-full" :disabled="loading || saving">
        {{ saving ? 'Menyimpan...' : 'Simpan' }}
      </AppButton>
    </div>
  </form>
</template>
