<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { onBeforeUnmount, watch } from 'vue'

const props = defineProps<{ open: boolean; title: string }>()
const emit = defineEmits<{ close: [] }>()
let previousBodyOverflow = ''

function close() {
  emit('close')
}

function unlockBodyScroll() {
  document.body.style.overflow = previousBodyOverflow
}

function closeOnEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.open) close()
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      previousBodyOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', closeOnEscape)
      return
    }
    unlockBodyScroll()
    window.removeEventListener('keydown', closeOnEscape)
  },
)

onBeforeUnmount(() => {
  if (props.open) unlockBodyScroll()
  window.removeEventListener('keydown', closeOnEscape)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-40 grid place-items-end bg-slate-950/40 p-0 sm:place-items-center sm:p-4"
      @click.self="close"
    >
      <section
        role="dialog"
        aria-modal="true"
        :aria-label="title || 'Dialog'"
        class="max-h-[92vh] w-full overflow-auto rounded-t-3xl bg-white p-4 shadow-xl sm:max-w-xl sm:rounded-3xl"
      >
        <header
          v-if="title"
          class="mb-4 flex items-center justify-between gap-3"
        >
          <h2 class="text-lg font-bold">{{ title }}</h2>
          <button
            type="button"
            class="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
            aria-label="Tutup"
            @click="close"
          >
            <X :size="18" />
          </button>
        </header>
        <button
          v-else
          type="button"
          aria-label="Tutup"
          class="float-right -mr-1 -mt-1 grid size-10 shrink-0 place-items-center rounded-xl border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
          @click="close"
        >
          <X :size="18" />
        </button>
        <slot />
      </section>
    </div>
  </Teleport>
</template>
