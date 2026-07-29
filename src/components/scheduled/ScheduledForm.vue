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
import { saveScheduledTransaction } from '@/repositories/scheduledTransactions'
import { getSettings } from '@/repositories/settings'
import { scheduledTransactionSchema } from '@/schemas/forms'
import { useToastStore } from '@/stores/toast'
import type {
  Account,
  ScheduledBehavior,
  ScheduledTransaction,
} from '@/types/models'

const props = defineProps<{ schedule?: ScheduledTransaction }>()
const emit = defineEmits<{ saved: [] }>()
const toast = useToastStore()
const accounts = ref<Account[]>([])
const errors = ref<Record<string, string>>({})
const loading = ref(true)
const saving = ref(false)
const form = reactive({
  name: props.schedule?.name || '',
  type: props.schedule?.type || 'expense',
  accountId: props.schedule?.accountId || '',
  fromAccountId: props.schedule?.fromAccountId || '',
  toAccountId: props.schedule?.toAccountId || '',
  amount: props.schedule ? String(props.schedule.amountMinor / 100) : '',
  categoryName: '',
  note: props.schedule?.note || '',
  frequency: props.schedule?.frequency || 'monthly',
  interval: props.schedule?.interval || 1,
  dayOfMonth: props.schedule?.dayOfMonth || new Date().getDate(),
  startDate: props.schedule?.startDate || nowDateTime(),
  endDate: props.schedule?.endDate || '',
  behavior: (props.schedule?.behavior || 'confirmation') as ScheduledBehavior,
})

const accountOptions = computed(() => [
  { label: 'Pilih Akun', value: '' },
  ...accounts.value.map((account) => ({
    label: account.name,
    value: account.id,
  })),
])
const categoryType = computed(() =>
  form.type === 'income' || form.type === 'expense' ? form.type : 'expense',
)

onMounted(async () => {
  try {
    const [nextAccounts, settings] = await Promise.all([
      listAccounts(),
      getSettings(),
    ])
    accounts.value = nextAccounts
    form.behavior =
      props.schedule?.behavior || settings.scheduledTransactionDefaultBehavior
    form.categoryName = props.schedule?.categoryId
      ? (await getCategory(props.schedule.categoryId))?.name || ''
      : ''
  } finally {
    loading.value = false
  }
})

async function submit() {
  if (loading.value || saving.value) return
  errors.value = {}
  const categoryName = form.categoryName.trim()
  const parsed = scheduledTransactionSchema.safeParse({
    name: form.name,
    type: form.type,
    accountId: form.accountId || undefined,
    fromAccountId: form.fromAccountId || undefined,
    toAccountId: form.toAccountId || undefined,
    amountMinor: parseMoneyToMinor(form.amount) ?? 0,
    note: form.note || undefined,
    frequency: form.frequency,
    interval: Number(form.interval),
    dayOfMonth: Number(form.dayOfMonth),
    startDate: form.startDate,
    endDate: form.endDate || undefined,
    behavior: form.behavior,
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
      categoryName && (form.type === 'income' || form.type === 'expense')
        ? (await findCategoryByName(form.type, categoryName))?.id ||
          (await saveCategory({ name: categoryName, type: form.type }))
        : undefined

    await saveScheduledTransaction({
      ...parsed.data,
      id: props.schedule?.id,
      categoryId,
    })
    toast.show('Transaksi Terjadwal tersimpan.', 'success')
    emit('saved')
  } catch (error) {
    console.error(error)
    toast.show('Gagal menyimpan Transaksi Terjadwal.', 'error')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="grid gap-4" @submit.prevent="submit">
    <p v-if="loading" class="loading-state">Memuat data...</p>

    <template v-else>
      <AppInput v-model="form.name" label="Nama" :error="errors.name" />
      <AppSelect
        v-model="form.type"
        label="Jenis"
        :options="[
          { label: 'Pemasukan', value: 'income' },
          { label: 'Pengeluaran', value: 'expense' },
          { label: 'Transfer', value: 'transfer' },
        ]"
      />
      <div v-if="form.type === 'transfer'" class="grid gap-4">
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
      <AppInput
        v-model="form.amount"
        label="Nominal"
        inputmode="numeric"
        format="money"
        :error="errors.amountMinor"
      />
      <div class="grid gap-4 sm:grid-cols-2">
        <AppDateTimeInput v-model="form.startDate" label="Mulai" />
        <AppInput
          v-model="form.dayOfMonth"
          label="Tanggal Bulanan"
          type="number"
        />
      </div>
      <AppSelect
        v-model="form.frequency"
        label="Frekuensi"
        :options="[
          { label: 'Mingguan', value: 'weekly' },
          { label: 'Bulanan', value: 'monthly' },
          { label: 'Tahunan', value: 'yearly' },
        ]"
      />
      <AppSelect
        v-model="form.behavior"
        label="Perilaku"
        :options="[
          { label: 'Otomatis', value: 'automatic' },
          { label: 'Konfirmasi', value: 'confirmation' },
        ]"
      />
      <CategorySelect
        v-if="form.type !== 'transfer'"
        v-model="form.categoryName"
        label="Kategori"
        :type="categoryType"
      />
      <AppInput v-model="form.note" label="Catatan" />
    </template>

    <AppButton type="submit" :disabled="loading || saving">
      {{ saving ? 'Menyimpan...' : 'Simpan' }}
    </AppButton>
  </form>
</template>
