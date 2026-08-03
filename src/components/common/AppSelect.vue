<script setup lang="ts">
import { Check, ChevronDown, Plus, X } from 'lucide-vue-next'
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'

type SelectValue = string | number

const props = defineProps<{
  label: string
  error?: string
  modelValue?: SelectValue
  options: readonly { label: string; value: SelectValue }[]
  placeholder?: string
  searchable?: boolean
  searchValue?: string
  createLabel?: string
  loading?: boolean
  hasMore?: boolean
  clearable?: boolean
}>()
const emit = defineEmits<{
  'update:modelValue': [value: SelectValue]
  search: [value: string]
  open: []
  loadMore: []
  create: []
  clear: []
}>()
const root = ref<HTMLElement | null>(null)
const dropdown = ref<HTMLElement | null>(null)
const open = ref(false)
const dropdownStyle = ref<Record<string, string>>({})
const selectedOption = computed(() =>
  props.options.find((item) => String(item.value) === String(props.modelValue)),
)
const placeholderOption = computed(() =>
  props.options.find((item) => String(item.value) === ''),
)
const hasValue = computed(
  () => props.modelValue !== undefined && String(props.modelValue) !== '',
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

function clear() {
  emit('clear')
  close()
}

function close() {
  open.value = false
  document.removeEventListener('pointerdown', closeOnOutsidePointerDown, true)
  window.removeEventListener('resize', updatePlacement)
  window.removeEventListener('scroll', updatePlacement, true)
}

function closeOnOutsidePointerDown(event: PointerEvent) {
  const target = event.target as Node
  if (!root.value?.contains(target) && !dropdown.value?.contains(target)) {
    close()
  }
}

function updatePlacement() {
  const rect = root.value?.getBoundingClientRect()
  if (!rect) return
  const dropdownHeight = Math.min(
    176,
    selectableOptions.value.length * 40 + (props.createLabel ? 40 : 0) + 8,
  )
  const bottomSpace = window.innerHeight - rect.bottom
  const openUp = bottomSpace < dropdownHeight && rect.top > bottomSpace
  dropdownStyle.value = {
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    top: openUp ? 'auto' : `${rect.bottom + 4}px`,
    bottom: openUp ? `${window.innerHeight - rect.top + 4}px` : 'auto',
  }
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
        :placeholder="placeholder || placeholderOption?.label || 'Pilih'"
        class="min-h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 pr-16 text-slate-900 placeholder:text-slate-400 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
        @focus="openOptions"
        @input="updateSearch(($event.target as HTMLInputElement).value)"
      />
      <button
        v-else
        type="button"
        class="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-10 text-left outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
        :class="hasValue ? 'text-slate-900' : 'text-slate-400'"
        :aria-expanded="open"
        @click.stop="toggleOptions"
      >
        {{
          selectedOption?.label ||
          placeholder ||
          placeholderOption?.label ||
          'Pilih'
        }}
      </button>
      <button
        v-if="clearable && hasValue"
        type="button"
        class="absolute right-9 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 hover:cursor-pointer"
        aria-label="Hapus pilihan"
        @click.stop="clear"
      >
        <X :size="16" />
      </button>
      <ChevronDown
        :size="18"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:cursor-pointer"
      />
    </span>
    <span v-if="error" class="text-xs text-rose-700">{{ error }}</span>
  </div>
  <Teleport to="body">
    <div
      v-if="open"
      ref="dropdown"
      class="fixed z-[60] max-h-44 overflow-auto overscroll-contain rounded-xl border border-slate-200 bg-white p-1 text-sm shadow-lg"
      :style="dropdownStyle"
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
  </Teleport>
</template>
