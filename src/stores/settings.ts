import { defineStore } from 'pinia'

import { getSettings, saveSettings } from '@/repositories/settings'
import type { Settings } from '@/types/models'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: null as Settings | null,
    loading: false,
  }),
  actions: {
    async load() {
      this.loading = true
      try {
        this.settings = await getSettings()
      } finally {
        this.loading = false
      }
    },
    async save(settings: Settings) {
      await saveSettings(settings)
      this.settings = settings
    },
  },
})
