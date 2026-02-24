<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { NButton, NTag } from 'naive-ui'
import SiteHeader from '@/components/common/SiteHeader.vue'
import SiteFooter from '@/components/common/SiteFooter.vue'
import CreatorBadge from '@/components/common/CreatorBadge.vue'
import { useSiteData, type Work } from '@/composables/useSiteData'

type TickNode = {
  kind: 'tick'
  key: string
  cycle: 0 | 1 | 2
  minutesInDay: number
  absMinutes: number
  slot: string
  works: Work[]
}

type LeafCharm = {
  id: number
  x: number
  y: number
  r: number
  s: number
  icon: string
}

type PuffParticle = {
  id: number
  x: number
  y: number
  dx: number
  dy: number
  rot: number
  kind: 'smoke' | 'leaf' | 'coin'
}

const { works, getCreator } = useSiteData()
const headerSearch = ref('')

const scrollEl = ref<HTMLDivElement | null>(null)
const nowTickEl = ref<HTMLElement | null>(null)
const timelineLeaves = ref<LeafCharm[]>([])
const puffs = ref<PuffParticle[]>([])

let idSeed = 1
function nextId() {
  return idSeed++
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function minutesToSlot(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${pad2(h)}:${pad2(m)}`
}

function getNowMinutes() {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}

function snapTo30(min: number) {
  return Math.round(min / 30) * 30
}

const nowMinutes = ref(getNowMinutes())
let timer: number | null = null

function normalizeTimelineSlot(slot: string) {
  return slot === '24:00' ? '00:00' : slot
}

onMounted(() => {
  timer = window.setInterval(() => {
    nowMinutes.value = getNowMinutes()
  }, 30_000)
})
onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})

const worksBySlot = computed(() => {
  const map = new Map<string, Work[]>()
  for (const w of works) {
    const slotKey = normalizeTimelineSlot(w.slot)
    const arr = map.get(slotKey) ?? []
    arr.push(w)
    map.set(slotKey, arr)
  }
  for (const [k, arr] of map.entries()) {
    arr.sort((a, b) => a.title.localeCompare(b.title))
    map.set(k, arr)
  }
  return map
})

const ticks = computed<TickNode[]>(() => {
  const res: TickNode[] = []
  const map = worksBySlot.value
  for (const cycle of [0, 1, 2] as const) {
    for (let min = 0; min < 1440; min += 30) {
      const slot = minutesToSlot(min)
      res.push({
        kind: 'tick',
        key: `c${cycle}-${slot}`,
        cycle,
        minutesInDay: min,
        absMinutes: cycle * 1440 + min,
        slot,
        works: map.get(slot) ?? [],
      })
    }
  }
  return res
})

const nowTickKey = computed(() => {
  const snapped = snapTo30(nowMinutes.value)
  const clamped = Math.max(0, Math.min(1430, snapped))
  const slot = minutesToSlot(clamped)
  return `c1-${slot}`
})

function openWork(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

const typeLabelMap: Record<string, string> = {
  text: '文字',
  visual: '图片',
  video: '视频',
  illust: '插画',
  comic: '漫画',
  music: '音乐',
  other: '其他',
}

function getTypeLabel(type: string) {
  return typeLabelMap[type] || type
}

const CHARM_EMOJIS = ['🍃', '🏮', '📜', '🪙'] as const

function randomCharmEmoji() {
  return CHARM_EMOJIS[Math.floor(Math.random() * CHARM_EMOJIS.length)] ?? '🍃'
}

function getTimelineBounds() {
  const el = scrollEl.value
  const fullWidth = Math.max(320, el?.scrollWidth ?? el?.clientWidth ?? 0)
  const fullHeight = Math.max(120, el?.clientHeight ?? 0)
  return { fullWidth, fullHeight }
}

/**
 * 鼠标滚轮转横向滚动
 */
function onWheel(e: WheelEvent) {
  const el = scrollEl.value
  if (!el) return

  const preferX = Math.abs(e.deltaX) > Math.abs(e.deltaY)
  const shouldConvert = e.shiftKey || (!preferX && Math.abs(e.deltaY) > 0)
  if (!shouldConvert) return

  const before = el.scrollLeft
  el.scrollLeft += e.deltaY

  const atStart = el.scrollLeft <= 0
  const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1
  const changed = el.scrollLeft !== before

  if (changed && !(atStart || atEnd)) {
    e.preventDefault()
  }
}

async function centerNowTick() {
  await nextTick()
  const container = scrollEl.value
  const target = nowTickEl.value
  if (!container || !target) return

  const left = target.offsetLeft - container.clientWidth / 2 + target.clientWidth / 2
  container.scrollTo({
    left: Math.max(0, left),
    behavior: 'smooth',
  })
}

/** ====== 卷轴彩蛋：可点击树叶 ====== */
function initCharmLeaves() {
  const count = 20
  const { fullWidth, fullHeight } = getTimelineBounds()
  const minX = 28
  const maxX = Math.max(minX + 1, fullWidth - 28)
  const minY = 24
  const maxY = Math.max(minY + 1, fullHeight - 24)
  const bucket = (maxX - minX) / count

  timelineLeaves.value = Array.from({ length: count }).map((_, index) => {
    const bucketStart = minX + bucket * index
    const bucketCenter = bucketStart + bucket * 0.5
    const jitter = (Math.random() - 0.5) * bucket * 0.7
    const x = Math.max(minX, Math.min(maxX, bucketCenter + jitter))
    const y = minY + Math.random() * (maxY - minY)
    return {
      id: nextId(),
      x,
      y,
      r: -35 + Math.random() * 70,
      s: 0.85 + Math.random() * 0.4,
      icon: randomCharmEmoji(),
    }
  })
}

function randomLeafPositionFar(oldX: number, oldY: number) {
  const { fullWidth, fullHeight } = getTimelineBounds()
  const minX = 28
  const maxX = Math.max(minX + 1, fullWidth - 28)
  const minY = 24
  const maxY = Math.max(minY + 1, fullHeight - 24)
  const minDist = Math.max(220, fullWidth * 0.26)

  let x = minX + Math.random() * (maxX - minX)
  let y = minY + Math.random() * (maxY - minY)

  for (let i = 0; i < 18; i++) {
    const candidateX = minX + Math.random() * (maxX - minX)
    const candidateY = minY + Math.random() * (maxY - minY)
    const dx = candidateX - oldX
    const dy = candidateY - oldY
    const dist = Math.hypot(dx, dy)
    if (dist >= minDist) {
      x = candidateX
      y = candidateY
      break
    }
    x = candidateX
    y = candidateY
  }

  return { x, y }
}

function burstLeaf(leaf: LeafCharm) {
  const count = 8 + Math.floor(Math.random() * 5)
  const baseKinds: PuffParticle['kind'][] = ['smoke', 'smoke', 'smoke', 'leaf', 'leaf', 'leaf', 'coin']
  const newOnes: PuffParticle[] = []

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.7 - 0.35)
    const speed = 16 + Math.random() * 28
    const kind = baseKinds[Math.floor(Math.random() * baseKinds.length)] ?? 'smoke'
    newOnes.push({
      id: nextId(),
      x: leaf.x,
      y: leaf.y,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed - 10,
      rot: -90 + Math.random() * 180,
      kind,
    })
  }

  puffs.value.push(...newOnes)

  // 叶子重生到更远、更随机的新位置
  const list = timelineLeaves.value
  const idx = list.findIndex((x) => x.id === leaf.id)
  if (idx >= 0) {
    const nextPos = randomLeafPositionFar(leaf.x, leaf.y)
    list[idx] = {
      ...leaf,
      x: nextPos.x,
      y: nextPos.y,
      r: -35 + Math.random() * 70,
      s: 0.85 + Math.random() * 0.45,
      icon: randomCharmEmoji(),
    }
  }

  window.setTimeout(() => {
    const ids = new Set(newOnes.map((n) => n.id))
    puffs.value = puffs.value.filter((p) => !ids.has(p.id))
  }, 900)
}

function cycleLabel(_cycle: 0 | 1 | 2) {
  return '夜巡卷'
}

onMounted(async () => {
  const el = scrollEl.value
  if (el) el.addEventListener('wheel', onWheel, { passive: false })

  await nextTick()
  initCharmLeaves()
  window.setTimeout(() => centerNowTick(), 100)
})

onBeforeUnmount(() => {
  const el = scrollEl.value
  if (el) el.removeEventListener('wheel', onWheel as any)
})
</script>

<template>
  <div class="app-page flex flex-col">
    <SiteHeader :show-search="false" v-model:search="headerSearch" />

    <main class="app-container py-6 flex-1">
      <!-- Hero 区域（卷轴题签） -->
      <section class="hero-section p-6 sm:p-8">
        <div class="hero-paper-noise"></div>

        <div class="hero-stamp">
          <span class="stamp-outline">TIMELINE</span>
        </div>

        <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between relative z-10">
          <div>
            <h1 class="hero-title section-title-accent">二岩猯藏24h接力 · 时间轴</h1>
            <p class="hero-desc">
              30 分钟刻度，<span class="font-700 text-[var(--mz-seal-red)]">24h的40部作品汇集于此</span>。
              以当前时间为中心浏览对应的接力作品。
            </p>
          </div>
          <div class="hero-actions toolbar">
            <NButton type="primary" round @click="centerNowTick">回到今夜此刻</NButton>
            <NButton round @click="$router.push('/')">回作品墙</NButton>
          </div>
        </div>

        <div class="info-bar relative z-10">
          <div class="info-item">
            <span class="info-label">今夜时刻</span>
            <span class="ticket-accent">{{ minutesToSlot(Math.max(0, Math.min(1439, nowMinutes))) }}</span>
          </div>
          <div class="info-divider"></div>
          <div class="info-item">
            <span class="info-label">浏览方式</span>
            <span class="info-value">滚轮横向浏览（Shift 也可）</span>
          </div>
          <div class="info-divider"></div>
          <div class="info-item">
            <span class="info-label">小彩蛋</span>
            <span class="info-value">试试点一下时间轴的叶子</span>
          </div>
        </div>
      </section>

      <!-- 卷轴时间轴 -->
      <section class="mt-6">
        <div class="scroll-shell">
          <div class="scroll-edge left"></div>
          <div class="scroll-edge right"></div>

          <div class="timeline-container custom-scrollbar" ref="scrollEl">
            <!-- 时间轴区域的叶子 -->
            <button
              v-for="leaf in timelineLeaves"
              :key="`timeline-${leaf.id}`"
              class="charm-leaf"
              :class="'zone-timeline'"
              :style="{
                left: `${leaf.x}px`,
                top: `${leaf.y}px`,
                transform: `rotate(${leaf.r}deg) scale(${leaf.s})`,
              }"
              @click="burstLeaf(leaf)"
              title="点我"
            >
              {{ leaf.icon }}
            </button>

            <span
              v-for="p in puffs"
              :key="`tpuff-${p.id}`"
              class="puff-item"
              :class="`kind-${p.kind}`"
              :style="{
                left: `${p.x}px`,
                top: `${p.y}px`,
                '--dx': `${p.dx}px`,
                '--dy': `${p.dy}px`,
                '--rot': `${p.rot}deg`,
              }"
            >
              {{ p.kind === 'smoke' ? '◌' : p.kind === 'coin' ? '◍' : '🍂' }}
            </span>

            <div class="timeline-track">
              <div
                v-for="node in ticks"
                :key="node.key"
                class="timeline-item"
                :class="{ 'is-now': node.key === nowTickKey }"
                :ref="(el) => (node.key === nowTickKey ? (nowTickEl = el as any) : null)"
              >
                <div class="timeline-header">
                  <div class="time-row">
                    <span class="time-label" :class="{ 'is-now-text': node.key === nowTickKey }">
                      {{ node.slot }}
                    </span>
                    <span v-if="node.key === nowTickKey" class="now-pill">今夜此刻</span>
                  </div>

                  <div class="axis-dot-wrapper">
                    <div class="axis-dot"></div>
                  </div>
                </div>

                <div class="timeline-content">
                  <!-- 仅用于视觉分段提示：样式不区分三轮 -->
                  <div v-if="node.minutesInDay === 0" class="cycle-marker">
                    <span class="cycle-chip">{{ cycleLabel(node.cycle) }}</span>
                  </div>

                  <div v-if="node.works.length" class="works-stack">
                    <div v-for="w in node.works" :key="w.id" class="work-card card-paper p-3">
                      <div class="ema-rope" aria-hidden="true"></div>
                      <div class="ema-hole left" aria-hidden="true"></div>
                      <div class="ema-hole right" aria-hidden="true"></div>
                      <div class="paper-pin"></div>
                      <div class="paper-seal">{{ getTypeLabel(w.type) }}</div>

                      <div class="mb-2 flex items-start justify-between gap-2 pr-12">
                        <div class="work-title">{{ w.title }}</div>
                      </div>

                      <div class="flex items-center gap-2 mb-3">
                        <CreatorBadge
                          v-if="getCreator(w.creatorId)"
                          :name="getCreator(w.creatorId)!.name"
                          :url="getCreator(w.creatorId)!.bilibiliSpace"
                          :avatar="getCreator(w.creatorId)!.avatar"
                          size="sm"
                        />
                      </div>

                      <div class="work-actions">
                        <button type="button" class="b-open-link" @click="openWork(w.url)">B站打开↗</button>
                        <NButton size="tiny" class="detail-stamp-btn" @click="$router.push(`/work/${w.id}`)">
                          详情
                        </NButton>
                      </div>
                    </div>
                  </div>

                  <div v-else class="empty-tick">
                    <div class="empty-seal">待变</div>
                  </div>
                </div>
              </div>
              <!-- /timeline-item -->
            </div>
          </div>
        </div>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>

<style scoped>
/* ===== Hero：卷轴题签 ===== */
.hero-section {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--mz-border) 80%, var(--mz-seal-red) 20%);
  background:
    radial-gradient(1200px 220px at 20% -20%, rgba(147, 83, 63, 0.12), transparent 60%),
    radial-gradient(1000px 180px at 85% 120%, rgba(120, 86, 56, 0.1), transparent 60%),
    linear-gradient(180deg, rgba(255, 249, 240, 0.75), rgba(248, 241, 232, 0.9));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.65),
    0 6px 18px rgba(75, 49, 34, 0.06);
}

.hero-paper-noise {
  pointer-events: none;
  position: absolute;
  inset: 0;
  opacity: 0.35;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(139, 92, 55, 0.05) 1px, transparent 1.4px),
    radial-gradient(circle at 75% 62%, rgba(139, 92, 55, 0.04) 1px, transparent 1.5px),
    linear-gradient(transparent 0, rgba(132, 95, 72, 0.025) 45%, transparent 100%);
  background-size: 22px 22px, 26px 26px, 100% 7px;
}

.hero-stamp {
  position: absolute;
  top: 14px;
  right: 16px;
  z-index: 2;
}

.stamp-outline {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 1px;
  border: 1px solid color-mix(in srgb, var(--mz-seal-red) 55%, transparent);
  color: color-mix(in srgb, var(--mz-seal-red) 82%, var(--mz-text));
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  transform: rotate(-7deg);
  background: color-mix(in srgb, var(--mz-seal-red) 10%, transparent);
  box-shadow: 0 1px 4px rgba(99, 48, 38, 0.08);
}

.hero-title {
  font-size: 28px;
  font-weight: 900;
  font-family: var(--mz-font-serif);
  color: var(--mz-text);
  margin: 0 0 8px;
  line-height: 1.3;
  text-shadow: 1px 0 0 color-mix(in srgb, var(--mz-seal-red) 18%, transparent);
}

.section-title-accent {
  position: relative;
  padding-left: 14px;
}

.section-title-accent::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.42em;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--mz-seal-red);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--mz-seal-red) 18%, transparent);
}

.hero-desc {
  font-size: 14px;
  color: var(--mz-text-2);
  line-height: 1.65;
  margin: 0;
}

.hero-actions {
  flex-wrap: wrap;
}

/* 信息条 */
.info-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
  margin-top: 20px;
  padding: 12px 14px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.55), rgba(255, 251, 245, 0.65)),
    color-mix(in srgb, var(--mz-card) 80%, transparent);
  border: 1px dashed color-mix(in srgb, var(--mz-border) 75%, var(--mz-seal-red) 25%);
  border-radius: 10px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  font-size: 12px;
  color: var(--mz-text-3);
  font-weight: 600;
}

.info-value {
  font-size: 13px;
  color: var(--mz-text-2);
}

.info-divider {
  width: 1px;
  height: 20px;
  background: var(--mz-border);
}

/* ===== 彩蛋叶子 & 烟雾 ===== */
.charm-leaf {
  position: absolute;
  z-index: 3;
  border: none;
  background: transparent;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  font-size: 16px;
  opacity: 0.72;
  filter: saturate(0.7) sepia(0.15);
  transition: transform 0.15s ease, opacity 0.15s ease;
  user-select: none;
}
.charm-leaf:hover {
  opacity: 1;
}
.charm-leaf.zone-hero {
  pointer-events: auto;
}
.charm-leaf.zone-timeline {
  pointer-events: auto;
  font-size: 15px;
  opacity: 0.62;
}

.puff-item {
  position: absolute;
  z-index: 4;
  pointer-events: none;
  line-height: 1;
  font-size: 12px;
  opacity: 0.8;
  animation: puff-burst 0.9s ease-out forwards;
  transform: translate(-50%, -50%);
}
.puff-item.kind-smoke {
  color: rgba(123, 103, 93, 0.55);
  font-size: 14px;
}
.puff-item.kind-leaf {
  font-size: 11px;
  filter: sepia(0.2) saturate(0.7);
}
.puff-item.kind-coin {
  color: color-mix(in srgb, #b98b37 80%, var(--mz-text));
  font-size: 11px;
}

@keyframes puff-burst {
  0% {
    transform: translate(-50%, -50%) translate(0, 0) rotate(0deg) scale(0.6);
    opacity: 0.95;
  }
  100% {
    transform:
      translate(-50%, -50%)
      translate(var(--dx), var(--dy))
      rotate(var(--rot))
      scale(1.15);
    opacity: 0;
  }
}

/* ===== 卷轴外框 ===== */
.scroll-shell {
  position: relative;
}

.scroll-edge {
  position: absolute;
  top: 10px;
  bottom: 18px;
  width: 26px;
  z-index: 2;
  pointer-events: none;
  border: 1px solid color-mix(in srgb, var(--mz-border) 75%, transparent);
  background:
    radial-gradient(circle at 30% 40%, rgba(255, 255, 255, 0.35), transparent 65%),
    linear-gradient(90deg, rgba(120, 89, 64, 0.25), rgba(120, 89, 64, 0.08) 40%, rgba(255,255,255,0.18));
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.2);
}

.scroll-edge.left {
  left: 0;
  border-radius: 18px 4px 4px 18px;
}
.scroll-edge.right {
  right: 0;
  border-radius: 4px 18px 18px 4px;
  transform: scaleX(-1);
}

/* ===== 滚动容器（卷轴画布） ===== */
.timeline-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  position: relative;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--mz-border) 80%, var(--mz-seal-red) 20%);
  background:
    linear-gradient(180deg, rgba(255, 252, 246, 0.98), rgba(250, 244, 236, 0.98)),
    var(--mz-bg);
  scrollbar-width: thin;
  padding: 14px 0 22px;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.75),
    0 8px 22px rgba(70, 49, 31, 0.05);
}

/* 卷轴上下边（装饰带） */
.timeline-container::before,
.timeline-container::after {
  content: '';
  position: sticky;
  left: 0;
  display: block;
  width: 100%;
  height: 10px;
  pointer-events: none;
  z-index: 1;
}

.timeline-container::before {
  top: 0;
  background:
    linear-gradient(90deg,
      rgba(122, 88, 66, 0.08),
      rgba(122, 88, 66, 0.2) 18%,
      rgba(122, 88, 66, 0.06) 50%,
      rgba(122, 88, 66, 0.2) 82%,
      rgba(122, 88, 66, 0.08));
  border-bottom: 1px solid rgba(122, 88, 66, 0.12);
}

.timeline-container::after {
  bottom: 0;
  background:
    linear-gradient(90deg,
      rgba(122, 88, 66, 0.08),
      rgba(122, 88, 66, 0.18) 18%,
      rgba(122, 88, 66, 0.05) 50%,
      rgba(122, 88, 66, 0.18) 82%,
      rgba(122, 88, 66, 0.08));
  border-top: 1px solid rgba(122, 88, 66, 0.1);
}

/* 轨道 */
.timeline-track {
  position: relative;
  display: inline-flex;
  flex-wrap: nowrap;
  min-width: 100%;
  align-items: flex-start;
  padding: 0 clamp(180px, 42vw, 420px);
  z-index: 2;
}

/* 卷轴中缝轴线 */
.timeline-track::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 40px;
  height: 3px;
  border-radius: 999px;
  background:
    linear-gradient(90deg,
      rgba(126, 87, 64, 0.18) 0%,
      rgba(126, 87, 64, 0.36) 10%,
      rgba(166, 120, 93, 0.58) 50%,
      rgba(126, 87, 64, 0.36) 90%,
      rgba(126, 87, 64, 0.18) 100%);
  box-shadow:
    0 1px 0 rgba(255,255,255,0.35),
    0 0 0 1px rgba(115, 81, 59, 0.08);
  z-index: 0;
  pointer-events: none;
}

/* 每个刻度 */
.timeline-item {
  flex: 0 0 auto;
  width: 248px;
  position: relative;
  z-index: 1;
  padding: 0 12px;
  display: flex;
  flex-direction: column;
}

/* Header */
.timeline-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
}

.time-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.time-label {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 14px;
  color: var(--mz-text-2);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}
.time-label.is-now-text {
  color: var(--mz-seal-red);
  font-weight: 900;
}

/* 当前时刻：印签感 */
.now-pill {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
  padding: 2px 8px;
  border-radius: 999px;
  color: #fff;
  background: linear-gradient(180deg, color-mix(in srgb, var(--mz-seal-red) 90%, #fff), var(--mz-seal-red));
  box-shadow: 0 1px 4px rgba(127, 43, 33, 0.22);
}

.axis-dot-wrapper {
  position: relative;
  width: 100%;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 节点像“印点/狸火” */
.axis-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 35% 35%, rgba(255,255,255,0.9), rgba(255,255,255,0.2) 35%, transparent 36%),
    color-mix(in srgb, var(--mz-border) 78%, #8d6953 22%);
  z-index: 1;
  position: relative;
  box-shadow:
    0 0 0 4px rgba(251, 246, 239, 0.95),
    0 0 0 1px rgba(129, 95, 70, 0.12);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.timeline-item.is-now .axis-dot {
  background:
    radial-gradient(circle at 35% 35%, rgba(255,255,255,0.95), rgba(255,255,255,0.2) 35%, transparent 36%),
    var(--mz-seal-red);
  transform: scale(1.5);
  box-shadow:
    0 0 0 4px rgba(251, 246, 239, 0.95),
    0 0 0 8px color-mix(in srgb, var(--mz-seal-red) 18%, transparent),
    0 0 12px rgba(153, 62, 45, 0.25);
}

/* 内容区 */
.timeline-content {
  flex: 1;
  min-height: 210px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cycle-marker {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}
.cycle-chip {
  display: inline-block;
  font-size: 11px;
  color: var(--mz-text-2);
  border: 1px dashed color-mix(in srgb, var(--mz-border) 75%, var(--mz-seal-red) 20%);
  border-radius: 999px;
  padding: 2px 10px;
  background: rgba(255, 255, 255, 0.45);
}

/* 作品堆叠 */
.works-stack {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* 和风木牌卡片 */
.work-card {
  width: 100%;
  position: relative;
  border: 1px solid color-mix(in srgb, var(--mz-border) 72%, #7a543f 28%);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(255, 251, 244, 0.9), rgba(236, 219, 198, 0.94)),
    linear-gradient(90deg, rgba(143, 106, 78, 0.22), rgba(214, 182, 150, 0.14) 30%, rgba(129, 92, 65, 0.24) 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    inset 0 0 0 1px rgba(110, 76, 54, 0.1),
    0 2px 8px rgba(72, 52, 36, 0.08);
  transition: transform 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease;
  overflow: hidden;
}
.work-card::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.42;
  background-image:
    repeating-linear-gradient(
      6deg,
      rgba(124, 86, 61, 0.12) 0 2px,
      rgba(124, 86, 61, 0.03) 2px 7px
    ),
    radial-gradient(circle at 18% 22%, rgba(126, 84, 57, 0.14) 0 1.5px, transparent 2.1px),
    radial-gradient(circle at 79% 64%, rgba(126, 84, 57, 0.12) 0 1.5px, transparent 2.2px);
}
.work-card::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: 8px;
  box-shadow:
    inset 0 0 0 1px rgba(106, 73, 51, 0.16),
    inset 0 -10px 16px rgba(121, 84, 55, 0.08),
    inset 0 10px 12px rgba(255, 255, 255, 0.18);
}
.work-card:hover {
  transform: translateY(-2px) rotate(-0.25deg);
  border-color: color-mix(in srgb, var(--mz-seal-red) 20%, #765540);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.52),
    inset 0 0 0 1px rgba(110, 76, 54, 0.12),
    0 6px 14px rgba(80, 54, 37, 0.13);
}

.ema-rope {
  position: absolute;
  top: 2px;
  left: 18px;
  right: 18px;
  height: 10px;
  border-bottom: 1px solid rgba(129, 93, 69, 0.55);
  border-radius: 0 0 999px 999px;
  opacity: 0.9;
}

.ema-hole {
  position: absolute;
  top: 6px;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background:
    radial-gradient(circle at 40% 35%, rgba(46, 30, 20, 0.72), rgba(84, 55, 38, 0.86));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 1px 1px rgba(53, 34, 23, 0.25);
}

.ema-hole.left {
  left: 16px;
}

.ema-hole.right {
  right: 16px;
}

/* 顶部纸钉 */
.paper-pin {
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  width: 38px;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(121, 85, 61, 0.25), rgba(121, 85, 61, 0.55), rgba(121, 85, 61, 0.25));
  opacity: 0.7;
}

/* 右上角印章标签 */
.paper-seal {
  position: absolute;
  top: 18px;
  right: 8px;
  min-width: 34px;
  text-align: center;
  font-size: 9px;
  line-height: 1;
  padding: 4px 6px;
  border-radius: 4px;
  color: #fff;
  letter-spacing: 0.08em;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--mz-seal-red) 88%, #fff), var(--mz-seal-red));
  box-shadow:
    0 0 0 0.5px rgba(170, 32, 26, 0.2),
    0 0 2px rgba(160, 30, 24, 0.22),
    0 1px 0 rgba(255, 255, 255, 0.1) inset;
  pointer-events: none;
}

.work-title {
  font-weight: 800;
  font-size: 14px;
  line-height: 1.4;
  color: color-mix(in srgb, var(--mz-text) 88%, #5b3e2c);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-wrap: pretty;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.28);
}

.work-actions {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 4px;
}

.b-open-link {
  border: none;
  background: transparent;
  padding: 0;
  font-size: 12px;
  font-weight: 700;
  color: color-mix(in srgb, var(--mz-seal-red) 76%, #5d2a22);
  letter-spacing: 0.02em;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
  cursor: pointer;
  transition: opacity 0.15s ease, color 0.15s ease;
}

.b-open-link:hover {
  color: var(--mz-seal-red);
  opacity: 0.92;
}

.work-actions :deep(.detail-stamp-btn.n-button) {
  --n-height: 24px !important;
  --n-padding: 0 12px !important;
  --n-border-radius: 6px !important;
  --n-color: color-mix(in srgb, var(--mz-seal-red) 86%, #6d3026) !important;
  --n-color-hover: color-mix(in srgb, var(--mz-seal-red) 92%, #5c261d) !important;
  --n-color-pressed: color-mix(in srgb, var(--mz-seal-red) 95%, #4f1f18) !important;
  --n-text-color: #fff !important;
  --n-border: 1px solid color-mix(in srgb, var(--mz-seal-red) 62%, #5f2a22) !important;
  font-weight: 800;
  letter-spacing: 0.08em;
  box-shadow:
    0 0 0 0.5px rgba(170, 32, 26, 0.18),
    0 0 2px rgba(160, 30, 24, 0.2),
    0 1px 0 rgba(255, 255, 255, 0.08) inset;
}

/* 空刻度：做成小印 */
.empty-tick {
  width: 100%;
  min-height: 64px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 18px;
  color: var(--mz-text-3);
}
.empty-seal {
  font-size: 11px;
  letter-spacing: 0.12em;
  color: color-mix(in srgb, var(--mz-text-3) 78%, var(--mz-seal-red) 22%);
  border: 1px dashed color-mix(in srgb, var(--mz-border) 85%, var(--mz-seal-red) 15%);
  border-radius: 999px;
  padding: 2px 10px;
  opacity: 0.8;
  background: rgba(255,255,255,0.35);
}

/* reduced motion */
@media (prefers-reduced-motion: reduce) {
  .axis-dot,
  .work-card,
  .charm-leaf,
  .puff-item {
    transition: none !important;
    animation: none !important;
  }
}

/* 移动端微调 */
@media (max-width: 640px) {
  .timeline-item {
    width: 228px;
    padding: 0 10px;
  }
  .hero-title {
    font-size: 22px;
  }
  .now-pill {
    padding: 2px 6px;
  }
}
</style>