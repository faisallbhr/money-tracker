<script setup lang="ts">
const props = defineProps<{
  label: string
  error?: string
  modelValue?: string | number
  options: readonly { label: string; value: string | number }[]
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string | number] }>()

function updateValue(value: string) {
  const option = props.options.find((item) => String(item.value) === value)
  emit('update:modelValue', option?.value ?? value)
}
</script>

<template>
  <label class="grid w-full gap-1 text-sm">
    <span class="font-medium text-slate-700">{{ label }}</span>
    <select
      :value="modelValue"
      class="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
      @change="updateValue(($event.target as HTMLSelectElement).value)"
    >
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
    <span v-if="error" class="text-xs text-rose-700">{{ error }}</span>
  </label>
</template>
