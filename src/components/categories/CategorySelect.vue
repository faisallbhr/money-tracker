<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import AppSelect from '@/components/common/AppSelect.vue'
import { listCategories } from '@/repositories/categories'
import type { Category, CategoryType } from '@/types/models'

const props = defineProps<{
  label: string
  modelValue: string
  type: CategoryType
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const search = ref(props.modelValue)
const categories = ref<Category[]>([])
const hasMore = ref(false)
const loading = ref(false)
const pageSize = 5

const options = computed(() =>
  categories.value.map((category) => ({
    label: category.name,
    value: category.name,
  })),
)
const exactMatch = computed(() =>
  categories.value.some(
    (category) => category.name.toLowerCase() === search.value.toLowerCase(),
  ),
)
const createLabel = computed(() =>
  search.value.trim() && !exactMatch.value
    ? `Buat "${search.value.trim()}"`
    : undefined,
)

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

function updateSearch(value: string) {
  search.value = value
  emit('update:modelValue', value)
  void load()
}

function select(value: string | number) {
  search.value = String(value)
  emit('update:modelValue', String(value))
}

function create() {
  select(search.value.trim())
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
    void load()
  },
)
</script>

<template>
  <AppSelect
    :label="label"
    :model-value="modelValue"
    :options="options"
    searchable
    :search-value="search"
    :create-label="createLabel"
    :loading="loading"
    :has-more="hasMore"
    @update:model-value="select"
    @search="updateSearch"
    @open="load()"
    @load-more="load(categories.length)"
    @create="create"
  />
</template>
