<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps<{ open: boolean; title: string }>()
const emit = defineEmits<{ close: [] }>()
const dragStartY = ref<number | null>(null)
const dragOffsetY = ref(0)
let previousBodyOverflow = ''
const sheetStyle = computed(() => ({
  transform: dragOffsetY.value ? `translateY(${dragOffsetY.value}px)` : '',
}))

function close() {
  emit('close')
}

function unlockBodyScroll() {
  document.body.style.overflow = previousBodyOverflow
}

function closeOnEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.open) close()
}

function stopDrag() {
  window.removeEventListener('pointermove', drag)
  window.removeEventListener('pointerup', endDrag)
}

function startDrag(event: PointerEvent) {
  dragStartY.value = event.clientY
  window.addEventListener('pointermove', drag)
  window.addEventListener('pointerup', endDrag)
}

function drag(event: PointerEvent) {
  if (dragStartY.value === null) return
  dragOffsetY.value = Math.max(0, event.clientY - dragStartY.value)
}

function endDrag() {
  if (dragOffsetY.value > 80) close()
  dragStartY.value = null
  dragOffsetY.value = 0
  stopDrag()
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      dragOffsetY.value = 0
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
  stopDrag()
  if (props.open) unlockBodyScroll()
  window.removeEventListener('keydown', closeOnEscape)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div
        v-if="open"
        class="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/40"
        @click.self="close"
      >
        <section
          role="dialog"
          aria-modal="true"
          :aria-label="title || 'Dialog'"
          class="app-sheet flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-xl"
          :style="sheetStyle"
        >
          <button
            type="button"
            class="flex min-h-11 w-full shrink-0 touch-none items-center justify-center"
            aria-label="Geser ke bawah untuk menutup"
            @pointerdown="startDrag"
          >
            <span class="h-1.5 w-12 rounded-full bg-slate-300" />
          </button>
          <header
            v-if="title"
            class="mb-4 flex shrink-0 items-center justify-between gap-3 px-4"
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
            class="mx-4 mb-4 grid size-10 shrink-0 place-items-center self-end rounded-xl border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
            @click="close"
          >
            <X :size="18" />
          </button>
          <div class="min-h-0 flex-1 overflow-auto px-4 pb-4">
            <slot />
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
