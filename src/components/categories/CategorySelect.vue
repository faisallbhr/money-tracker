<script setup lang="ts">
import { Check, ChevronDown, Plus } from 'lucide-vue-next'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import { listCategories } from '@/repositories/categories'
import type { Category, CategoryType } from '@/types/models'

const props = defineProps<{
  label: string
  modelValue: string
  type: CategoryType
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const root = ref<HTMLElement | null>(null)
const open = ref(false)
const search = ref(props.modelValue)
const categories = ref<Category[]>([])
const hasMore = ref(false)
const loading = ref(false)
const pageSize = 5

const exactMatch = computed(() =>
  categories.value.some(
    (category) => category.name.toLowerCase() === search.value.toLowerCase(),
  ),
)
const canCreate = computed(() => search.value.trim() && !exactMatch.value)

async function load(offset = 0) {
  loading.value = true
  try {
    const items = await listCategories({
      type: props.type,
      search: search.value,
      limit: pageSize + 1,
      offset,
    })
    const visibleItems = items.slice(0, pageSize)
    categories.value =
      offset === 0 ? visibleItems : [...categories.value, ...visibleItems]
    hasMore.value = items.length > pageSize
  } finally {
    loading.value = false
  }
}

function select(value: string) {
  search.value = value
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

function openOptions() {
  open.value = true
  void load()
  document.addEventListener('pointerdown', closeOnOutsidePointerDown, true)
}

function updateSearch(value: string) {
  search.value = value
  emit('update:modelValue', value)
  if (!open.value) openOptions()
  else void load()
}

function loadMore(event: Event) {
  const target = event.target as HTMLElement
  if (
    hasMore.value &&
    !loading.value &&
    target.scrollTop + target.clientHeight >= target.scrollHeight - 8
  ) {
    void load(categories.value.length)
  }
}

watch(
  () => props.modelValue,
  (value) => {
    search.value = value
  },
)
watch(
  () => props.type,
  () => {
    categories.value = []
    if (open.value) void load()
  },
)

onBeforeUnmount(close)
</script>

<template>
  <div ref="root" class="relative grid w-full gap-1 text-sm">
    <span class="font-medium text-slate-700" @pointerdown="close">{{
      label
    }}</span>
    <span class="relative">
      <input
        :value="search"
        class="min-h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 pr-10 text-slate-900 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
        @focus="openOptions"
        @input="updateSearch(($event.target as HTMLInputElement).value)"
      />
      <ChevronDown
        :size="18"
        class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
      />
    </span>

    <div
      v-if="open"
      class="absolute inset-x-0 top-full z-50 mt-1 max-h-44 overflow-auto overscroll-contain rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
      @scroll="loadMore"
    >
      <button
        v-for="category in categories"
        :key="category.id"
        type="button"
        class="flex min-h-10 w-full items-center justify-between rounded-lg px-3 text-left text-sm hover:bg-slate-50"
        @click.stop="select(category.name)"
      >
        <span>{{ category.name }}</span>
        <Check
          v-if="category.name === modelValue"
          :size="16"
          class="text-teal-700"
        />
      </button>
      <button
        v-if="canCreate"
        type="button"
        class="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-sm text-teal-700 hover:bg-teal-50"
        @click.stop="select(search.trim())"
      >
        <Plus :size="16" />Buat "{{ search.trim() }}"
      </button>
      <p
        v-if="!categories.length && !canCreate && !loading"
        class="px-3 py-2 text-sm text-slate-500"
      >
        Tidak ada kategori.
      </p>
      <p v-if="loading" class="px-3 py-2 text-sm text-slate-500">Memuat...</p>
    </div>
  </div>
</template>
