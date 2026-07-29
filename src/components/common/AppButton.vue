<script setup lang="ts">
defineProps<{
  type?: 'button' | 'submit'
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
}>()
</script>

<template>
  <button
    :type="type || 'button'"
    class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
    :class="{
      'bg-teal-700 text-white shadow-sm shadow-teal-700/20 hover:bg-teal-800':
        !variant || variant === 'primary',
      'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50':
        variant === 'secondary',
      'bg-rose-700 text-white hover:bg-rose-800': variant === 'danger',
      'text-slate-700 hover:bg-slate-100': variant === 'ghost',
    }"
  >
    <slot />
  </button>
</template>
