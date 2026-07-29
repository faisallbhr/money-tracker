<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { onBeforeUnmount, watch } from 'vue'

const props = defineProps<{ open: boolean; title: string }>()
const emit = defineEmits<{ close: [] }>()
let previousBodyOverflow = ''

function close() {
  emit('close')
}

function closeOnEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.open) close()
}

function unlockBodyScroll() {
  document.body.style.overflow = previousBodyOverflow
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
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"
        @click.self="close"
      >
        <section
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          class="app-modal max-h-[88vh] w-full max-w-md overflow-auto rounded-2xl bg-white p-4 shadow-xl"
        >
          <header class="mb-4 flex items-center justify-between gap-3">
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
          <slot />
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
