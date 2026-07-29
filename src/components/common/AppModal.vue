<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { onBeforeUnmount, watch } from 'vue'

import AppButton from './AppButton.vue'

const props = defineProps<{ open: boolean; title: string }>()
const emit = defineEmits<{ close: [] }>()

function close() {
  emit('close')
}

function closeOnEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.open) close()
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) window.addEventListener('keydown', closeOnEscape)
    else window.removeEventListener('keydown', closeOnEscape)
  },
)

onBeforeUnmount(() => window.removeEventListener('keydown', closeOnEscape))
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
          <AppButton variant="ghost" aria-label="Tutup" @click="close">
            <X :size="18" />
          </AppButton>
        </header>
        <AppButton
          v-else
          variant="ghost"
          aria-label="Tutup"
          class="float-right -mr-1 -mt-1"
          @click="close"
        >
          <X :size="18" />
        </AppButton>
        <slot />
      </section>
    </div>
  </Teleport>
</template>
