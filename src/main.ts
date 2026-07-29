import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import { db } from './database/db'
import { seedDefaults } from './database/seed'
import { router } from './router'
import './styles.css'

async function start() {
  const app = createApp(App)
  app.use(createPinia())
  app.use(router)

  try {
    await db.open()
    await seedDefaults()
  } catch (error) {
    console.error('Failed to open local database', error)
  }

  app.mount('#app')
}

void start()
