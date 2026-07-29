<script setup lang="ts">
import { reactive, ref } from 'vue'

import AppButton from '@/components/common/AppButton.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppSelect from '@/components/common/AppSelect.vue'
import { parseMoneyToMinor } from '@/domain/money'
import { saveAccount } from '@/repositories/accounts'
import { accountSchema } from '@/schemas/forms'
import { useToastStore } from '@/stores/toast'
import type { Account, AccountType } from '@/types/models'

const props = defineProps<{ account?: Account }>()
const emit = defineEmits<{ saved: [] }>()
const toast = useToastStore()
const errors = ref<Record<string, string>>({})
const saving = ref(false)
const form = reactive({
  name: props.account?.name || '',
  type: props.account?.type || 'bank',
  initialBalance: props.account
    ? String(props.account.initialBalanceMinor / 100)
    : '0',
})

async function submit() {
  if (saving.value) return
  errors.value = {}
  const parsed = accountSchema.safeParse({
    name: form.name,
    type: form.type as AccountType,
    initialBalanceMinor: parseMoneyToMinor(form.initialBalance) ?? 0,
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
    await saveAccount({ ...parsed.data, id: props.account?.id })
    toast.show('Akun tersimpan.', 'success')
    emit('saved')
  } catch (error) {
    console.error(error)
    toast.show('Gagal menyimpan akun.', 'error')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="grid gap-4" @submit.prevent="submit">
    <AppInput v-model="form.name" label="Nama Akun" :error="errors.name" />
    <AppSelect
      v-model="form.type"
      label="Jenis Akun"
      :options="[
        { label: 'Tunai', value: 'cash' },
        { label: 'Bank', value: 'bank' },
        { label: 'E-wallet', value: 'ewallet' },
        { label: 'Tabungan', value: 'savings' },
        { label: 'Lainnya', value: 'other' },
      ]"
      :error="errors.type"
    />
    <AppInput
      v-model="form.initialBalance"
      label="Saldo Awal"
      inputmode="numeric"
      format="money"
      :error="errors.initialBalanceMinor"
    />
    <AppButton type="submit" :disabled="saving">
      {{ saving ? 'Menyimpan...' : 'Simpan Akun' }}
    </AppButton>
  </form>
</template>
