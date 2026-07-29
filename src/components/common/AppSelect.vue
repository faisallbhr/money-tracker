<script setup lang="ts">
import { Check, ChevronDown, Plus } from 'lucide-vue-next'
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'

type SelectValue = string | number

const props = defineProps<{
  label: string
  error?: string
  modelValue?: SelectValue
  options: readonly { label: string; value: SelectValue }[]
  searchable?: boolean
  searchValue?: string
  createLabel?: string
  loading?: boolean
  hasMore?: boolean
}>()
const emit = defineEmits<{
  'update:modelValue': [value: SelectValue]
  search: [value: string]
  open: []
  loadMore: []
  create: []
}>()
const root = ref<HTMLElement | null>(null)
const open = ref(false)
const openUp = ref(false)
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

function create() {
  emit('create')
  close()
}

function close() {
  open.value = false
  document.removeEventListener('pointerdown', closeOnOutsidePointerDown, true)
  window.removeEventListener('resize', updatePlacement)
  window.removeEventListener('scroll', updatePlacement, true)
}

function closeOnOutsidePointerDown(event: PointerEvent) {
  if (!root.value?.contains(event.target as Node)) close()
}

function updatePlacement() {
  const rect = root.value?.getBoundingClientRect()
  if (!rect) return
  const dropdownHeight = Math.min(
    176,
    selectableOptions.value.length * 40 + (props.createLabel ? 40 : 0) + 8,
  )
  const bottomSpace = window.innerHeight - rect.bottom
  openUp.value = bottomSpace < dropdownHeight && rect.top > bottomSpace
}

async function openOptions() {
  open.value = true
  emit('open')
  await nextTick()
  updatePlacement()
  document.addEventListener('pointerdown', closeOnOutsidePointerDown, true)
  window.addEventListener('resize', updatePlacement)
  window.addEventListener('scroll', updatePlacement, true)
}

function toggleOptions() {
  if (!open.value) void openOptions()
  else close()
}

function updateSearch(value: string) {
  emit('search', value)
  if (!open.value) void openOptions()
}

function loadMore(event: Event) {
  const target = event.target as HTMLElement
  if (open.value) {
    updatePlacement()
  }
  if (
    props.hasMore &&
    !props.loading &&
    target.scrollTop + target.clientHeight >= target.scrollHeight - 8
  ) {
    emit('loadMore')
  }
}

onBeforeUnmount(close)
</script>

<template>
  <div ref="root" class="relative grid w-full gap-1 text-sm">
    <span class="font-medium text-slate-700" @pointerdown="close">{{
      label
    }}</span>
    <span class="relative">
      <input
        v-if="searchable"
        :value="searchValue"
        class="min-h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 pr-10 text-slate-900 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
        @focus="openOptions"
        @input="updateSearch(($event.target as HTMLInputElement).value)"
      />
      <button
        v-else
        type="button"
        class="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-10 text-left text-slate-900 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
        :aria-expanded="open"
        @click.stop="toggleOptions"
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
      class="absolute inset-x-0 z-50 max-h-44 overflow-auto overscroll-contain rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
      :class="openUp ? 'bottom-full mb-1' : 'top-full mt-1'"
      @scroll="loadMore"
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
      <button
        v-if="createLabel"
        type="button"
        class="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-sm text-teal-700 hover:bg-teal-50"
        @click.stop="create"
      >
        <Plus :size="16" />{{ createLabel }}
      </button>
      <p
        v-if="!selectableOptions.length && !createLabel && !loading"
        class="px-3 py-2 text-sm text-slate-500"
      >
        Tidak ada pilihan.
      </p>
      <p v-if="loading" class="px-3 py-2 text-sm text-slate-500">Memuat...</p>
    </div>
    <span v-if="error" class="text-xs text-rose-700">{{ error }}</span>
  </div>
</template>
