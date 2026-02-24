<script setup lang="ts">
import { computed } from 'vue'
import meta from '@/data/site.meta.json'

const maintainerName = computed(() => meta.credits?.siteMaintainer || '—')

const maintainerUrl = computed(() => {
  const credits = (meta.credits || {}) as Record<string, unknown>
  const directUrl =
    (credits.siteMaintainerUrl as string | undefined) ||
    (credits.siteMaintainerLink as string | undefined) ||
    (credits.authorUrl as string | undefined) ||
    (credits.authorLink as string | undefined)

  if (directUrl && directUrl.trim()) return directUrl.trim()

  const fallback = (meta.links || []).find((item) => {
    const label = String(item?.label || '')
    const url = String(item?.url || '').trim()
    if (!url) return false
    return /(维护|站长|作者|主页|空间)/.test(label)
  })

  return fallback?.url?.trim() || ''
})
</script>

<template>
  <footer class="site-footer">
    <div class="app-container py-6">
      <!-- 装饰线 -->
      <div class="footer-divider">
        <div class="divider-line"></div>
        <div class="divider-stamp">狸</div>
        <div class="divider-line"></div>
      </div>

      <!-- 主要内容 -->
      <div class="footer-content">
        <div class="footer-brand">
          <div class="brand-title">{{ meta.eventName }}</div>
          <div class="brand-subtitle">{{ meta.year }} · 24h Relay Showcase</div>
        </div>

        <div class="footer-links">
          <router-link to="/" class="footer-link">作品墙</router-link>
          <span class="link-divider">·</span>
          <router-link to="/timeline" class="footer-link">时间轴</router-link>
          <span class="link-divider">·</span>
          <router-link to="/about" class="footer-link">关于</router-link>
        </div>

        <div class="footer-meta">
          <p class="meta-text">
            作品版权归参与接力的各作者所有，本站仅作展示与跳转
          </p>
          <p class="meta-text text-xs mt-1 opacity-70">
            技术支持与维护：
            <a
              v-if="maintainerUrl"
              :href="maintainerUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="maintainer-link"
            >
              {{ maintainerName }}
            </a>
            <span v-else>{{ maintainerName }}</span>
          </p>
        </div>
      </div>

      <!-- 底部小字 -->
      <div class="footer-bottom">
        <span class="stamp-mini">Mamizou 2026</span>
        <span class="copyright">二岩猯藏 角色日接力</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  position: relative;
  margin-top: auto;
  background: linear-gradient(180deg, transparent 0%, rgba(231, 215, 210, 0.4) 100%);
  border-top: 1px solid var(--mz-border);
}

.footer-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
}

.divider-line {
  flex: 1;
  max-width: 80px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--mz-border), transparent);
}

.divider-stamp {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 900;
  color: var(--mz-primary);
  border: 2px solid var(--mz-primary);
  border-radius: 6px;
  transform: rotate(-3deg);
  opacity: 0.7;
}

.footer-content {
  text-align: center;
}

.footer-brand {
  margin-bottom: 12px;
}

.brand-title {
  font-size: 16px;
  font-weight: 800;
  color: var(--mz-text);
  font-family: var(--mz-font-serif);
}

.brand-subtitle {
  font-size: 12px;
  color: var(--mz-text-3);
  margin-top: 2px;
}

.footer-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.footer-link {
  font-size: 13px;
  color: var(--mz-text-2);
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: var(--mz-primary);
}

.link-divider {
  color: var(--mz-text-3);
  opacity: 0.5;
}

.footer-meta {
  margin-bottom: 16px;
}

.meta-text {
  font-size: 12px;
  color: var(--mz-text-3);
  line-height: 1.6;
}

.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--mz-border);
}

.stamp-mini {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  padding: 3px 8px;
  background: var(--mz-seal-red);
  color: white;
  border-radius: 4px;
}

.copyright {
  font-size: 11px;
  color: var(--mz-text-3);
}

.maintainer-link {
  color: color-mix(in srgb, var(--mz-seal-red) 76%, var(--mz-text));
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: opacity 0.15s ease;
}

.maintainer-link:hover {
  opacity: 0.86;
}
</style>