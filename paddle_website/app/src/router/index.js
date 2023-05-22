import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {requiresAuth: false, title: 'Login'}
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: {requiresAuth: true,  title: 'Dashboard'}
    },
    {
      path: '/create-training',
      name: 'create training',
      component: () => import('../views/CreateTrainingView.vue'),
      meta: {requiresAuth: true, title: 'Create Training'}
    },
    {
      path: '/verify-position',
      name: 'verify position',
      component: () => import('../views/VerifyPositionView.vue'),
      meta: {requiresAuth: true, title: 'Verify Position'}
    },
    {
      path: '/stream',
      name: 'stream',
      component: () => import('../views/StreamView.vue'),
      meta: {requiresAuth: true, title: 'Stream'}
    }
  ]
})


export default router
