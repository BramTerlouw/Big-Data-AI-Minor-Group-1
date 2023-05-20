import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue')
    },
    {
      path: '/create-training',
      name: 'create training',
      component: () => import('../views/CreateTrainingView.vue')
    },
    {
      path: '/verify-position',
      name: 'verify position',
      component: () => import('../views/VerifyPositionView.vue')
    },
    {
      path: '/stream',
      name: 'stream',
      component: () => import('../views/StreamView.vue')
    }
  ]
})

export default router
