<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NSelect } from 'naive-ui'
import SiteHeader from '@/components/common/SiteHeader.vue'
import SiteFooter from '@/components/common/SiteFooter.vue'
import WorkCard from '@/components/work/WorkCard.vue'
import { useSiteData, type Work } from '@/composables/useSiteData'

type WorkTypeFilter = Work['type'] | 'all'

const search = ref('')
const typeFilter = ref<WorkTypeFilter>('all')
const { works } = useSiteData()
const router = useRouter()

const typeOptions = [
  { label: '全部类型', value: 'all' },
  { label: '文字', value: 'text' },
  { label: '图片', value: 'visual' },
  { label: '视频', value: 'video' },
  { label: '音乐', value: 'music' },
  { label: '其他', value: 'other' },
]

function slotToMinutes(slot?: string) {
  if (!slot) return 0
  const [h, m] = String(slot).split(':').map((v) => Number(v))
  const hour = typeof h === 'number' && Number.isFinite(h) ? h : 0
  const min = typeof m === 'number' && Number.isFinite(m) ? m : 0
  return hour * 60 + min
}

const filteredWorks = computed(() => {
  const q = search.value.trim().toLowerCase()
  return works
    .filter((w) => (typeFilter.value === 'all' ? true : w.type === typeFilter.value))
    .filter((w) => {
      if (!q) return true
      return (
        String(w.title || '').toLowerCase().includes(q) ||
        String(w.creatorName || '').toLowerCase().includes(q) ||
        (w.tags ?? []).some((t) => t.toLowerCase().includes(q))
      )
    })
    .slice()
    .sort((a, b) => slotToMinutes(a.slot) - slotToMinutes(b.slot))
})

/** 分组：夜半(00:00-07:59) / 日间(08:00-17:59) / 夜幕(18:00-23:59) */
const groupedWorks = computed(() => {
  const night: Work[] = []
  const day: Work[] = []
  const dusk: Work[] = []

  for (const w of filteredWorks.value) {
    const min = slotToMinutes(w.slot)
    if (min < 8 * 60) night.push(w)
    else if (min < 18 * 60) day.push(w)
    else dusk.push(w)
  }

  return [
    {
      key: 'night',
      title: '夜半',
      sub: '00:00 – 07:30',
      desc: '接力开场与深夜时段的作品',
      works: night,
    },
    {
      key: 'day',
      title: '日间',
      sub: '08:00 – 17:30',
      desc: '白天时段的作品',
      works: day,
    },
    {
      key: 'dusk',
      title: '黄昏',
      sub: '18:00 – 23:30',
      desc: '晚间至收束阶段的作品',
      works: dusk,
    },
  ]
})

const stats = computed(() => {
  const list = filteredWorks.value
  return {
    total: list.length,
    text: list.filter((w) => w.type === 'text').length,
    visual: list.filter((w) => w.type === 'visual').length,
    video: list.filter((w) => w.type === 'video').length,
  }
})

function openWork(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

function goToDetail(id: string) {
  router.push(`/work/${id}`)
}

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="app-page flex flex-col">
    <SiteHeader v-model:search="search" />

    <main class="app-container py-6 flex-1">
      <!-- A区：海报式 Hero -->
      <section class="hero-stage">
        <div class="hero-ornament hero-ornament-ring" aria-hidden="true"></div>
        <div class="hero-ornament hero-ornament-paper" aria-hidden="true"></div>
        <div class="hero-ornament hero-ornament-seal" aria-hidden="true">
          <span>GALLERY</span>
        </div>

        <div class="hero-layout">
          <div class="hero-copy">
            <div class="hero-kicker">2026.2.18</div>
            <h1 class="hero-title">
              二岩猯藏角色日24h接力
              <span class="hero-title-sub">Gallery</span>
            </h1>

            <p class="hero-desc">
              按槽位顺序浏览本次 24h 接力作品。本站用于展示与归档，
              接力活动作品主要发布于 B 站，点击下方卡片可跳转查看。
            </p>

            <div class="hero-actions">
              <RouterLink to="/timeline">
                <NButton type="primary" round>
                  去时间轴
                </NButton>
              </RouterLink>
              <RouterLink to="/about">
                <NButton round>
                  关于活动
                </NButton>
              </RouterLink>
            </div>

            <div class="hero-stats">
              <div class="stat-chip">
                <span class="stat-label">总数</span>
                <span class="stat-value">{{ stats.total }}</span>
              </div>
              <div class="stat-chip">
                <span class="stat-label">文字</span>
                <span class="stat-value">{{ stats.text }}</span>
              </div>
              <div class="stat-chip">
                <span class="stat-label">图片</span>
                <span class="stat-value">{{ stats.visual }}</span>
              </div>
              <div class="stat-chip">
                <span class="stat-label">视频</span>
                <span class="stat-value">{{ stats.video }}</span>
              </div>
            </div>
          </div>

          <div class="hero-figure-wrap">
            <div class="figure-panel" aria-hidden="true"></div>
            <div class="figure-shadow" aria-hidden="true"></div>
            <img
              src="/assets/main.png"
              alt="二岩猯藏主视觉立绘"
              class="hero-figure-image"
              loading="eager"
            />
          </div>
        </div>

        <div class="hero-control">
          <div class="control-left">
            <div class="control-title">导览筛选</div>
            <div class="control-sub">按类型筛选当前作品墙</div>
          </div>

          <div class="control-right">
            <div class="control-item">
              <span class="control-label">类型</span>
              <NSelect
                v-model:value="typeFilter"
                size="small"
                :options="typeOptions"
                class="!w-36"
              />
            </div>

            <div class="control-divider"></div>

            <div class="control-item compact">
              <span class="control-label">结果</span>
              <span class="control-count">{{ filteredWorks.length }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- C区：作品墙（带分段导航） -->
      <section class="works-shell mt-6">
        <div class="works-head">
          <div>
            <h2 class="works-title">作品墙</h2>
            <p class="works-sub">
              按时段分区展示，便于快速定位，不替代时间轴页面。
            </p>
          </div>

          <div class="works-actions">
            <button class="jump-chip" @click="scrollToSection('section-night')">
              夜半
            </button>
            <button class="jump-chip" @click="scrollToSection('section-day')">
              日间
            </button>
            <button class="jump-chip" @click="scrollToSection('section-dusk')">
              黄昏
            </button>
            <button class="jump-chip jump-chip-top" @click="scrollToTop">
              顶部
            </button>
          </div>
        </div>

        <template v-if="filteredWorks.length > 0">
          <section
            v-for="group in groupedWorks"
            :key="group.key"
            :id="`section-${group.key}`"
            class="works-group"
          >
            <div class="group-head">
              <div class="group-title-wrap">
                <h3 class="group-title">{{ group.title }}</h3>
                <span class="group-time">{{ group.sub }}</span>
              </div>
              <div class="group-count">{{ group.works.length }}</div>
            </div>

            <p class="group-desc">{{ group.desc }}</p>

            <div v-if="group.works.length > 0" class="works-grid">
              <WorkCard
                v-for="w in group.works"
                :key="w.id"
                :work="w"
                @open="openWork"
                @detail="goToDetail"
              />
            </div>

            <div v-else class="group-empty">
              本分区当前没有匹配作品
            </div>
          </section>
        </template>

        <div v-else class="empty-state">
          <div class="empty-ticket">
            <div class="empty-mark">狸</div>
            <div class="empty-title">没有匹配结果</div>
            <p class="empty-desc">换个关键词或清空筛选试试。</p>
          </div>
        </div>
      </section>
    </main>

    <!-- 浮动快捷按钮 -->
    <div class="floating-actions" aria-label="页面快捷操作">
      <RouterLink to="/timeline" class="float-btn float-link">时间轴</RouterLink>
      <button class="float-btn" @click="scrollToTop">顶部</button>
    </div>

    <SiteFooter />
  </div>
</template>

<style scoped>
/* ========== Hero：海报式舞台 ========== */
.hero-stage {
  position: relative;
  border: 1px solid color-mix(in srgb, var(--mz-border) 92%, transparent);
  border-radius: 14px;
  overflow: hidden;
  background:
    radial-gradient(circle at 16% 18%, rgba(133, 97, 90, 0.08), transparent 38%),
    radial-gradient(circle at 84% 26%, rgba(133, 97, 90, 0.12), transparent 44%),
    linear-gradient(135deg, rgba(239, 229, 224, 0.92), rgba(231, 215, 210, 0.82));
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.65) inset,
    0 14px 28px rgba(55, 33, 24, 0.08);
}

.hero-ornament {
  position: absolute;
  pointer-events: none;
}

.hero-ornament-ring {
  width: 340px;
  height: 340px;
  right: -72px;
  top: -56px;
  border-radius: 32px;
  border: 2px solid color-mix(in srgb, var(--mz-seal-red) 26%, transparent);
  opacity: 0.5;
}
.hero-ornament-ring::before {
  content: '';
  position: absolute;
  inset: 18px;
  border-radius: inherit;
  border: 1px dashed color-mix(in srgb, var(--mz-seal-red) 30%, transparent);
}

.hero-ornament-paper {
  width: 220px;
  height: 420px;
  right: 120px;
  top: 24px;
  background: linear-gradient(180deg, rgba(255, 252, 249, 0.62), rgba(231, 215, 210, 0.28));
  border: 1px solid color-mix(in srgb, var(--mz-border) 88%, transparent);
  border-radius: 8px;
  transform: rotate(8deg);
  opacity: 0.9;
}

.hero-ornament-seal {
  left: 18px;
  top: 14px;
  width: 64px;
  height: 32px;
  border-radius: 4px;
  border: 2px solid color-mix(in srgb, var(--mz-seal-red) 65%, transparent);
  background: color-mix(in srgb, var(--mz-seal-red) 10%, transparent);
  color: color-mix(in srgb, var(--mz-seal-red) 82%, var(--mz-text));
  display: grid;
  place-content: center;
  gap: 1px;
  transform: rotate(-8deg);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.08em;
  line-height: 1.05;
}

.hero-layout {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1.1fr minmax(220px, 360px);
  gap: 12px;
  align-items: end;
  padding: 24px 22px 8px 22px;
}

.hero-copy {
  min-width: 0;
  padding-top: 12px;
}

.hero-kicker {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  font-size: 12px;
  color: var(--mz-text-2);
  letter-spacing: 0.08em;
  font-weight: 700;
}
.hero-kicker::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 2px;
  background: var(--mz-seal-red);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--mz-seal-red) 18%, transparent);
}

.hero-title {
  margin: 0;
  color: var(--mz-text);
  font-family: var(--mz-font-serif);
  font-weight: 900;
  line-height: 1.08;
  font-size: clamp(30px, 4vw, 46px);
  letter-spacing: 0.01em;
  text-shadow: 1px 0 0 color-mix(in srgb, var(--mz-seal-red) 16%, transparent);
}

.hero-title-sub {
  display: block;
  margin-top: 6px;
  font-size: clamp(12px, 1.4vw, 14px);
  letter-spacing: 0.22em;
  font-weight: 700;
  color: var(--mz-text-3);
  text-transform: uppercase;
}

.hero-desc {
  margin: 12px 0 0;
  color: var(--mz-text-2);
  line-height: 1.75;
  font-size: 14px;
  max-width: 48ch;
}

.hero-actions {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hero-stats {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.stat-chip {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--mz-border) 92%, transparent);
  background: rgba(255, 252, 249, 0.8);
}
.stat-label {
  font-size: 11px;
  color: var(--mz-text-3);
}
.stat-value {
  font-size: 12px;
  font-weight: 900;
  color: var(--mz-seal-red);
  font-family: var(--mz-font-serif);
}

.hero-figure-wrap {
  position: relative;
  min-height: 320px;
  display: flex;
  align-items: end;
  justify-content: center;
}
.figure-panel {
  position: absolute;
  inset: 16px 12px 8px 28px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--mz-border) 86%, transparent);
  background: linear-gradient(180deg, rgba(255, 251, 248, 0.75), rgba(231, 215, 210, 0.38));
  transform: skewY(-1.6deg);
}
.figure-shadow {
  position: absolute;
  inset: auto 10px 0 30px;
  height: 18px;
  border-radius: 999px;
  background: rgba(64, 37, 28, 0.16);
  filter: blur(10px);
}
.hero-figure-image {
  position: relative;
  z-index: 2;
  height: clamp(300px, 36vw, 420px);
  width: auto;
  object-fit: contain;
  object-position: bottom center;
  display: block;
  transform: translateY(8px);
  filter: drop-shadow(0 14px 24px rgba(66, 39, 30, 0.18));
}

.hero-control {
  position: relative;
  z-index: 2;
  margin: 4px 14px 14px;
  border-radius: 10px;
  border: 1px dashed color-mix(in srgb, var(--mz-border) 92%, transparent);
  background: rgba(255, 252, 249, 0.78);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
}

.control-left {
  min-width: 0;
}
.control-title {
  font-size: 13px;
  font-weight: 800;
  color: var(--mz-text);
  font-family: var(--mz-font-serif);
}
.control-sub {
  font-size: 11px;
  color: var(--mz-text-3);
  margin-top: 2px;
}
.control-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.control-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.control-item.compact {
  gap: 6px;
}
.control-label {
  font-size: 11px;
  color: var(--mz-text-3);
  white-space: nowrap;
}
.control-count {
  font-size: 13px;
  font-weight: 900;
  color: var(--mz-seal-red);
  font-family: var(--mz-font-serif);
}
.control-divider {
  width: 1px;
  height: 18px;
  background: color-mix(in srgb, var(--mz-border) 90%, transparent);
}

/* ========== 作品墙容器 ========== */
.works-shell {
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--mz-border) 92%, transparent);
  background: rgba(255, 252, 249, 0.55);
  padding: 14px;
}

.works-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px dashed color-mix(in srgb, var(--mz-border) 92%, transparent);
}

.works-title {
  margin: 0;
  font-size: 20px;
  line-height: 1.2;
  font-family: var(--mz-font-serif);
  font-weight: 900;
  color: var(--mz-text);
}
.works-sub {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--mz-text-3);
}

.works-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.jump-chip {
  appearance: none;
  border: 1px solid color-mix(in srgb, var(--mz-border) 90%, transparent);
  background: rgba(255, 252, 249, 0.88);
  color: var(--mz-text-2);
  border-radius: 999px;
  height: 28px;
  padding: 0 10px;
  font-size: 12px;
  cursor: pointer;
  transition: border-color 0.15s ease, transform 0.15s ease, color 0.15s ease;
}
.jump-chip:hover {
  border-color: color-mix(in srgb, var(--mz-seal-red) 26%, var(--mz-border));
  color: var(--mz-text);
  transform: translateY(-1px);
}
.jump-chip-top {
  color: var(--mz-seal-red);
  font-weight: 700;
}

/* ========== 分组展区 ========== */
.works-group {
  scroll-margin-top: 84px;
  margin-top: 14px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--mz-border) 92%, transparent);
  background: rgba(255, 252, 249, 0.7);
  padding: 12px;
}

.group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.group-title-wrap {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}
.group-title {
  margin: 0;
  font-family: var(--mz-font-serif);
  font-size: 16px;
  font-weight: 900;
  color: var(--mz-text);
}
.group-time {
  font-size: 11px;
  color: var(--mz-text-3);
  letter-spacing: 0.05em;
}
.group-count {
  flex-shrink: 0;
  min-width: 30px;
  height: 24px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--mz-seal-red) 20%, var(--mz-border));
  background: color-mix(in srgb, var(--mz-seal-red) 7%, var(--mz-card));
  color: var(--mz-seal-red);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
}

.group-desc {
  margin: 4px 0 10px;
  font-size: 12px;
  color: var(--mz-text-3);
}

.group-empty {
  border-radius: 8px;
  border: 1px dashed color-mix(in srgb, var(--mz-border) 92%, transparent);
  background: rgba(255, 252, 249, 0.7);
  color: var(--mz-text-3);
  font-size: 12px;
  text-align: center;
  padding: 14px;
}

/* 网格 */
.works-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 700px) {
  .works-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1100px) {
  .works-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

/* Empty */
.empty-state {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}
.empty-ticket {
  width: min(420px, 100%);
  border-radius: 10px;
  border: 1px dashed color-mix(in srgb, var(--mz-border) 92%, transparent);
  background: rgba(255, 252, 249, 0.8);
  padding: 20px;
  text-align: center;
}
.empty-mark {
  font-size: 40px;
  font-weight: 900;
  color: var(--mz-primary-soft);
  opacity: 0.45;
  margin-bottom: 8px;
}
.empty-title {
  font-size: 16px;
  font-weight: 900;
  color: var(--mz-text);
  font-family: var(--mz-font-serif);
}
.empty-desc {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--mz-text-2);
}

/* 浮动快捷按钮 */
.floating-actions {
  position: fixed;
  right: 14px;
  bottom: 16px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.float-btn {
  appearance: none;
  border: 1px solid color-mix(in srgb, var(--mz-border) 88%, transparent);
  background: rgba(255, 252, 249, 0.9);
  color: var(--mz-text-2);
  border-radius: 999px;
  height: 48px;
  padding: 0 12px;
  font-size: 18px;
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(45, 27, 19, 0.08);
}

.float-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.float-btn:hover {
  color: var(--mz-text);
  border-color: color-mix(in srgb, var(--mz-seal-red) 24%, var(--mz-border));
}

/* 响应式 */
@media (max-width: 1023px) {
  .hero-layout {
    grid-template-columns: 1fr;
    gap: 4px;
    padding: 18px 16px 6px 16px;
  }

  .hero-copy {
    order: 2;
    padding-top: 0;
  }

  .hero-figure-wrap {
    order: 1;
    min-height: 250px;
    justify-content: flex-end;
    margin-right: 6px;
  }

  .figure-panel {
    inset: 8px 10px 4px 70px;
    transform: rotate(4deg);
  }

  .hero-figure-image {
    height: clamp(240px, 42vw, 320px);
    transform: translateY(4px);
  }

  .hero-control {
    margin: 4px 10px 10px;
    flex-direction: column;
    align-items: stretch;
  }

  .control-right {
    justify-content: space-between;
  }

  .works-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .works-actions {
    width: 100%;
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .hero-ornament-ring {
    width: 230px;
    height: 230px;
    right: -54px;
    top: -42px;
  }

  .hero-ornament-paper {
    width: 120px;
    height: 220px;
    right: 40px;
    top: 20px;
  }

  .hero-ornament-seal {
    width: 68px;
    height: 68px;
    font-size: 9px;
    left: 12px;
    top: 10px;
  }

  .hero-title {
    font-size: 28px;
  }

  .hero-desc {
    font-size: 13px;
  }

  .hero-stats {
    gap: 6px;
  }

  .stat-chip {
    height: 26px;
    padding: 0 8px;
  }

  .control-divider {
    display: none;
  }

  .works-shell {
    padding: 10px;
  }

  .works-group {
    padding: 10px;
  }

  .floating-actions {
    right: 10px;
    bottom: 12px;
  }

  .float-btn {
    height: 30px;
    padding: 0 10px;
    font-size: 11px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .jump-chip,
  .float-btn {
    transition: none;
  }
}
</style>