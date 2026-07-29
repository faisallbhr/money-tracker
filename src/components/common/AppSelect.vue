<script setup lang="ts">
import { Check, ChevronDown } from 'lucide-vue-next'
import { computed, onBeforeUnmount, ref } from 'vue'

const props = defineProps<{
  label: string
  error?: string
  modelValue?: string | number
  options: readonly { label: string; value: string | number }[]
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string | number] }>()
const root = ref<HTMLElement | null>(null)
const open = ref(false)
const selectedOption = computed(() =>
  props.options.find((item) => String(item.value) === String(props.modelValue)),
)
const placeholderOption = computed(() =>
  props.options.find((item) => String(item.value) === ''),
)
const selectableOptions = computed(() =>
  props.options.filter((item) => String(item.value) !== ''),
)

function select(value: string | number) {
  emit('update:modelValue', value)
  close()
}

function close() {
  open.value = false
  document.removeEventListener('pointerdown', closeOnOutsidePointerDown, true)
}

function closeOnOutsidePointerDown(event: PointerEvent) {
  if (!root.value?.contains(event.target as Node)) close()
}

function toggle() {
  open.value = !open.value
  if (open.value)
    document.addEventListener('pointerdown', closeOnOutsidePointerDown, true)
  else close()
}

onBeforeUnmount(close)
</script>

<template>
  <div ref="root" class="relative grid w-full gap-1 text-sm">
    <span class="font-medium text-slate-700" @pointerdown="close">{{
      label
    }}</span>
    <span class="relative">
      <button
        type="button"
        class="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-10 text-left text-slate-900 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
        :aria-expanded="open"
        @click.stop="toggle"
      >
        {{ selectedOption?.label || placeholderOption?.label || 'Pilih' }}
      </button>
      <ChevronDown
        :size="18"
        class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
      />
    </span>
    <div
      v-if="open"
      class="absolute inset-x-0 top-full z-50 mt-1 max-h-44 overflow-auto overscroll-contain rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
    >
      <button
        v-for="option in selectableOptions"
        :key="option.value"
        type="button"
        class="flex min-h-10 w-full items-center justify-between rounded-lg px-3 text-left text-sm hover:bg-slate-50"
        @click.stop="select(option.value)"
      >
        <span>{{ option.label }}</span>
        <Check
          v-if="String(option.value) === String(modelValue)"
          :size="16"
          class="text-teal-700"
        />
      </button>
    </div>
    <span v-if="error" class="text-xs text-rose-700">{{ error }}</span>
  </div>
</template>
