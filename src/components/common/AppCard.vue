<script setup lang="ts">
defineProps<{ tag?: string }>()
</script>

<template>
  <component
    :is="tag || 'section'"
    class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-5"
  >
    <slot />
  </component>
</template>
