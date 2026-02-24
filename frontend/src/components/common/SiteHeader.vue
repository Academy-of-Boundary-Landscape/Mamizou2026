<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NIcon, NInput } from 'naive-ui'
import { Search, Home, Clock, Info } from 'lucide-vue-next'

type NavItem = {
  label: string
  to: string
  icon: any
}

const props = withDefaults(
  defineProps<{
    /** 是否显示搜索框（主页面用得到，其他页面可关） */
    showSearch?: boolean
    /** 搜索框占位 */
    searchPlaceholder?: string
    /** v-model */
    search?: string
  }>(),
  {
    showSearch: true,
    searchPlaceholder: '搜索标题 / 作者…',
    search: '',
  }
)

const emit = defineEmits<{
  (e: 'update:search', v: string): void
}>()

const route = useRoute()
const router = useRouter()

const navItems: NavItem[] = [
  { label: '作品墙', to: '/', icon: Home },
  { label: '时间轴', to: '/timeline', icon: Clock },
  { label: '关于', to: '/about', icon: Info },
]

const activePath = computed(() => route.path)

function go(to: string) {
  if (to !== route.path) router.push(to)
}

function updateSearch(v: string) {
  emit('update:search', v)
}
</script>

<template>
  <header class="site-header">
    <div class="app-container">
      <!-- 主行：Logo + 导航 + 搜索 -->
      <div class="header-main">
        <!-- 左侧：站点标识 -->
        <router-link to="/" class="header-brand">
          <div class="brand-logo">
            <img src="/assets/head.png" alt="二岩猯藏" class="logo-image" />
          </div>
          <div class="brand-info">
            <div class="brand-title">二岩猯藏 角色日24h接力</div>
            <div class="brand-subtitle">Mamizou 2026</div>
          </div>
        </router-link>

        <!-- 中间：桌面导航 -->
        <nav class="header-nav hidden md:flex">
          <button
            v-for="item in navItems"
            :key="item.to"
            class="nav-item"
            :class="{ active: activePath === item.to }"
            @click="go(item.to)"
          >
            <NIcon size="16">
              <component :is="item.icon" />
            </NIcon>
            <span>{{ item.label }}</span>
          </button>
        </nav>

        <!-- 右侧：搜索（桌面） -->
        <div v-if="showSearch" class="header-search hidden md:block">
          <NInput
            :value="props.search"
            :placeholder="searchPlaceholder"
            clearable
            size="small"
            @update:value="updateSearch"
          >
            <template #prefix>
              <NIcon size="16"><Search /></NIcon>
            </template>
          </NInput>
        </div>
      </div>

      <!-- 移动端：搜索 + 导航 -->
      <div class="header-mobile md:hidden">
        <div v-if="showSearch" class="mobile-search">
          <NInput
            :value="props.search"
            :placeholder="searchPlaceholder"
            clearable
            size="small"
            @update:value="updateSearch"
          >
            <template #prefix>
              <NIcon size="16"><Search /></NIcon>
            </template>
          </NInput>
        </div>
        <nav class="mobile-nav">
          <button
            v-for="item in navItems"
            :key="item.to"
            class="nav-item-mobile"
            :class="{ active: activePath === item.to }"
            @click="go(item.to)"
          >
            {{ item.label }}
          </button>
        </nav>
      </div>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(239, 227, 223, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--mz-border);
}

.header-main {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: inherit;
  min-width: 0;
}

.brand-logo {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--mz-card);
  border: 2px solid var(--mz-primary);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(133, 97, 90, 0.15);
  flex-shrink: 0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.header-brand:hover .brand-logo {
  transform: rotate(-3deg) scale(1.05);
  box-shadow: 0 4px 12px rgba(133, 97, 90, 0.25);
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.brand-info {
  min-width: 0;
}

.brand-title {
  font-size: 16px;
  font-weight: 800;
  line-height: 1.3;
  color: var(--mz-text);
  font-family: var(--mz-font-serif);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.brand-subtitle {
  font-size: 11px;
  color: var(--mz-text-3);
  line-height: 1.3;
  letter-spacing: 0.02em;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--mz-text-2);
  background: transparent;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-item:hover {
  color: var(--mz-primary);
  background: rgba(133, 97, 90, 0.08);
}

.nav-item.active {
  color: white;
  background: var(--mz-primary);
  font-weight: 600;
}

.header-search {
  width: 200px;
  flex-shrink: 0;
}

/* 移动端 */
.header-mobile {
  padding-bottom: 12px;
}

.mobile-search {
  margin-bottom: 10px;
}

.mobile-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.nav-item-mobile {
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  color: var(--mz-text-2);
  background: var(--mz-card);
  border: 1px solid var(--mz-border);
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-item-mobile:hover {
  border-color: var(--mz-primary-soft);
  color: var(--mz-primary);
}

.nav-item-mobile.active {
  color: white;
  background: var(--mz-primary);
  border-color: var(--mz-primary);
}

/* reduced motion */
@media (prefers-reduced-motion: reduce) {
  .brand-logo,
  .nav-item,
  .nav-item-mobile {
    transition: none;
  }
}
</style>
