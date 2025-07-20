import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import HeartRateView from '@/views/HeartRateView.vue';
import SleepPatternView from '@/views/SleepPatternView.vue';
import BloodPressureView from '@/views/BloodPressureView.vue';
import BloodSugarView from '@/views/BloodSugarView.vue';
import StepCountView from '@/views/StepCountView.vue';
import WeightView from '@/views/WeightView.vue';
import CallbackPage from '@/pages/callback-page.vue';
import { authGuard } from "@auth0/auth0-vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  linkActiveClass: 'active',
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/heartrate',
      name: 'heartrate',
      component: HeartRateView,
      beforeEnter: authGuard
    },
    {
      path: '/sleeppattern',
      name: 'sleeppattern',
      component: SleepPatternView,
      beforeEnter: authGuard
    },
    {
      path: '/bloodpressure',
      name: 'bloodpressure',
      component: BloodPressureView,
      beforeEnter: authGuard
    },
    {
      path: '/bloodsugar',
      name: 'bloodsugar',
      component: BloodSugarView,
      beforeEnter: authGuard
    },
    {
      path: '/stepcount',
      name: 'stepcount',
      component: StepCountView,
      beforeEnter: authGuard
    },
    {
      path: '/weight',
      name: 'weight',
      component: WeightView,
      beforeEnter: authGuard
    },
    {
      path: '/callback',
      name: 'callback',
      component: CallbackPage
    },
  ]
});

export default router;
