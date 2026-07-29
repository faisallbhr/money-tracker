<script setup lang="ts">
import { computed } from 'vue'

import { fromDateTimeLocalInput, toDateTimeLocalInput } from '@/domain/date'

const props = defineProps<{
  label: string
  error?: string
  modelValue: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const displayValue = computed(() => toDateTimeLocalInput(props.modelValue))
</script>

<template>
  <label class="grid w-full gap-1 text-sm">
    <span class="font-medium text-slate-700">{{ label }}</span>
    <input
      type="datetime-local"
      step="1"
      :value="displayValue"
      class="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
      @input="
        emit(
          'update:modelValue',
          fromDateTimeLocalInput(($event.target as HTMLInputElement).value),
        )
      "
    />
    <span v-if="error" class="text-xs text-rose-700">{{ error }}</span>
  </label>
</template>
