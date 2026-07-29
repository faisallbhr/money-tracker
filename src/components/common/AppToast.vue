<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useToastStore } from '@/stores/toast'

const toast = useToastStore()
const { message, type } = storeToRefs(toast)
</script>

<template>
  <div
    v-if="message"
    role="status"
    class="fixed bottom-24 left-4 right-4 z-50 rounded-2xl border bg-white px-4 py-3 text-sm shadow-lg sm:left-auto sm:w-96"
    :class="{
      'border-slate-200 text-slate-900': type === 'info',
      'border-teal-200 text-teal-900': type === 'success',
      'border-rose-200 text-rose-900': type === 'error',
    }"
  >
    {{ message }}
  </div>
</template>
