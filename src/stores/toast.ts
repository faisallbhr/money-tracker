import { defineStore } from 'pinia'

export const useToastStore = defineStore('toast', {
  state: () => ({
    message: '',
    type: 'info' as 'info' | 'success' | 'error',
  }),
  actions: {
    show(message: string, type: 'info' | 'success' | 'error' = 'info') {
      this.message = message
      this.type = type
      window.setTimeout(() => {
        if (this.message === message) this.message = ''
      }, 3500)
    },
  },
})
