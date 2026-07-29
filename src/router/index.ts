import { createRouter, createWebHashHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition || { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/pages/DashboardPage.vue'),
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: () => import('@/pages/TransactionsPage.vue'),
    },
    {
      path: '/accounts',
      name: 'accounts',
      component: () => import('@/pages/AccountsPage.vue'),
    },
    {
      path: '/accounts/:id',
      name: 'account-detail',
      component: () => import('@/pages/AccountDetailPage.vue'),
    },
    {
      path: '/scheduled',
      name: 'scheduled',
      component: () => import('@/pages/ScheduledPage.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/pages/SettingsPage.vue'),
    },
  ],
})
