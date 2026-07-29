<script setup lang="ts">
defineProps<{
  label: string
  error?: string
  type?: string
  modelValue: string | number
  inputmode?: 'text' | 'numeric' | 'decimal' | 'search'
  list?: string
  placeholder?: string
  hideLabel?: boolean
}>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <label class="grid gap-1 text-sm">
    <span
      class="font-medium text-slate-700"
      :class="{ 'sr-only': hideLabel }"
      >{{ label }}</span
    >
    <input
      :type="type || 'text'"
      :inputmode="inputmode"
      :list="list"
      :placeholder="placeholder"
      :value="modelValue"
      class="min-h-11 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
      @input="
        $emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
    />
    <span v-if="error" class="text-xs text-rose-700">{{ error }}</span>
  </label>
</template>
