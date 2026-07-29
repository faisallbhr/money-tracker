import { defineStore } from 'pinia'

import { getSettings, saveSettings } from '@/repositories/settings'
import type { Settings } from '@/types/models'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: null as Settings | null,
  }),
  actions: {
    async load() {
      this.settings = await getSettings()
    },
    async save(settings: Settings) {
      await saveSettings(settings)
      this.settings = settings
    },
  },
})
