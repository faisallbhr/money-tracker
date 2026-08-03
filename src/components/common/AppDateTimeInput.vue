<script setup lang="ts">
import { Calendar } from 'lucide-vue-next'
import { computed, ref } from 'vue'

import {
  formatTransactionDateTimeInput,
  fromDateTimeLocalInput,
  toDateTimeLocalInput,
} from '@/domain/date'

const props = defineProps<{
  label: string
  error?: string
  modelValue: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const input = ref<HTMLInputElement | null>(null)
const pickerValue = computed(() => toDateTimeLocalInput(props.modelValue))
const hasValue = computed(() => Boolean(props.modelValue))
const displayValue = computed(() =>
  props.modelValue ? formatTransactionDateTimeInput(props.modelValue) : '',
)

function openPicker() {
  input.value?.showPicker?.()
  input.value?.focus()
}
</script>

<template>
  <div class="grid w-full gap-1 text-sm">
    <span class="font-medium text-slate-700">{{ label }}</span>
    <div class="relative">
      <input
        ref="input"
        type="datetime-local"
        step="1"
        :value="pickerValue"
        class="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
        @click="openPicker"
        @input="
          emit(
            'update:modelValue',
            fromDateTimeLocalInput(($event.target as HTMLInputElement).value),
          )
        "
      />
      <div
        class="flex min-h-11 w-full items-center rounded-xl border border-slate-200 bg-white px-3 pr-10 text-left outline-none peer-focus:border-teal-700 peer-focus:ring-2 peer-focus:ring-teal-700/20"
        :class="hasValue ? 'text-slate-900' : 'text-slate-400'"
      >
        {{ displayValue || 'Pilih tanggal & waktu' }}
      </div>
      <Calendar
        :size="18"
        class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
      />
    </div>
    <span v-if="error" class="text-xs text-rose-700">{{ error }}</span>
  </div>
</template>
