<script setup lang="ts">
import { NConfigProvider, NMessageProvider, NDialogProvider, NNotificationProvider } from 'naive-ui'
import { naiveThemeOverrides } from '@/styles/naiveTheme'
import SiteBackground from '@/components/common/SiteBackground.vue'
</script>

<template>
  <NConfigProvider :theme-overrides="naiveThemeOverrides">
    <NMessageProvider>
      <NDialogProvider>
        <NNotificationProvider>
          <div class="app-shell">
            <SiteBackground :intensity="1.2" :pattern-opacity="0.30" :pattern-scale="1.25" />
            <div class="app-content">
              <router-view />
            </div>
          </div>
        </NNotificationProvider>
      </NDialogProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>

<style scoped>
.app-shell {
  position: relative;
  min-height: 100%;
  isolation: isolate;
}

.app-content {
  position: relative;
  z-index: 1;
}
</style>
