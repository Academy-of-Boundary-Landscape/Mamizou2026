import { createRouter, createWebHistory } from 'vue-router'

import GalleryPage from '@/pages/GalleryPage.vue'
import TimelinePage from '@/pages/TimelinePage.vue'
import WorkDetailPage from '@/pages/WorkDetailPage.vue'
import AboutPage from '@/pages/AboutPage.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: GalleryPage },
    { path: '/timeline', component: TimelinePage },
    { path: '/work/:id', component: WorkDetailPage },
    { path: '/about', component: AboutPage },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

export default router
