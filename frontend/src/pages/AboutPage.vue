<script setup lang="ts">
import { computed, ref } from 'vue'
import { NButton, NCarousel, NCarouselItem, NDivider, NIcon, NTag } from 'naive-ui'
import { Github } from 'lucide-vue-next'
import SiteHeader from '@/components/common/SiteHeader.vue'
import SiteFooter from '@/components/common/SiteFooter.vue'
import CreatorBadge from '@/components/common/CreatorBadge.vue'
import { useSiteData } from '@/composables/useSiteData'
import meta from '@/data/site.meta.json'

/**
 * About 页内容结构：
 * 1) 作者碎碎念（可直接在这里改文案，或未来挪到 site.meta.json）
 * 2) 轮播图：宣传图 / 预告图 / 现场照等（路径放 public/posters/...）
 * 3) 参与者名单：点击头像/名字直达 B 站空间
 */

const headerSearch = ref('')
const posterIndex = ref(0)
const { works } = useSiteData()
const githubRepoUrl = 'https://github.com/Academy-of-Boundary-Landscape/Mamizou2026'

type AboutCreator = {
  id: string
  name: string
  bilibiliSpace: string
  avatar?: string
}

// 轮播图素材：放在 public/posters/ 下（你自行替换文件名即可）
const posters = ref<
  {
    src: string
    alt: string
    caption?: string
  }[]
>([
  {
    src: '/posters/fin.jpg',
    alt: '活动终宣海报',
    caption: '活动终宣海报 + 接力排班表',
  },
  {
    src: '/posters/second.png',
    alt: '活动二宣海报',
    caption: '活动二宣海报',
  },
  {
    src: '/posters/first.jpg',
    alt:'活动一宣海报',
    caption: '活动一宣海报'
  },
  {
    src: '/posters/main_visual.jpg',
    alt: '活动主视觉图',
    caption: '活动主视觉图',
  },
])

const sortedCreators = computed(() => {
  const creatorMap = new Map<string, AboutCreator>()

  for (const w of works as any[]) {
    const creatorId = String(w?.creatorId || '')
    const creatorName = String(w?.creatorName || '').trim()
    const bilibiliSpace = String(w?.bilibiliSpace || '').trim()
    const avatar = String(w?.avatar || '').trim()

    if (!creatorId || !creatorName) continue
    if (!creatorMap.has(creatorId)) {
      creatorMap.set(creatorId, {
        id: creatorId,
        name: creatorName,
        bilibiliSpace,
        avatar,
      })
    }
  }

  return [...creatorMap.values()].sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'))
})

const maintainerName = computed(() => meta.credits?.siteMaintainer || '站点维护者')

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
  <div class="app-page flex flex-col">
    <SiteHeader :show-search="false" v-model:search="headerSearch" />

    <main class="app-container py-6 flex-1">
      <!-- Hero 区域 -->
      <section class="hero-section p-6 sm:p-8">
        <div class="hero-stamp">
          <span class="stamp-outline">ABOUT</span>
        </div>

        <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 class="hero-title">关于</h1>
            <p class="hero-desc">
              {{ meta.eventName }} · {{ meta.year }}
              <span class="mx-2 opacity-40">/</span>
              作品展示与跳转站
            </p>
          </div>
          <div class="hero-actions toolbar">
            <RouterLink to="/">
              <NButton type="primary" round>回作品墙</NButton>
            </RouterLink>
            <RouterLink to="/timeline">
              <NButton round>去时间轴</NButton>
            </RouterLink>
          </div>
        </div>
      </section>

      <!-- 碎碎念 -->
      <section class="card-paper p-5 mt-6 note-section">
        <div class="flex items-center gap-2">
          <NTag round size="small" type="primary" class="seal-tag">碎碎念</NTag>
        </div>

        <div class="mt-3 space-y-3 leading-relaxed text-[var(--mz-text-1)]">
          <p>
            很荣幸有机会给这次接力活动写归档站点，它定位非常简单：把这次接力的作品按时间整理好，方便回看、转发和归档。
            作品本体都在 B 站，本站只负责展示封面、信息与跳转，并做一点美术花活。
          </p>
          <p class="text-[var(--mz-text-2)]">
            如果你是作品作者，希望撤下展示 / 修改信息 / 更新链接，欢迎联系主办或站点维护者。
          </p>

          <p class="text-[var(--mz-text-2)] text-sm">
            站点维护：
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

          <div>
            <NButton
              tag="a"
              :href="githubRepoUrl"
              target="_blank"
              rel="noopener noreferrer"
              round
              size="small"
              class="github-btn"
            >
              <template #icon>
                <NIcon size="16"><Github /></NIcon>
              </template>
              GitHub 仓库
            </NButton>
          </div>

          <div class="mt-2 flex flex-wrap gap-2">
            <span class="pill text-xs"># 归档</span>
            <span class="pill text-xs"># 24h 接力</span>
            <span class="pill text-xs"># 二岩猯藏</span>
            <span class="pill text-xs"># 2.18是猯藏之日</span>
          </div>
        </div>
      </section>

      <!-- 中部：轮播图（竖版海报友好） -->
    <section class="mt-6 card-paper p-5">
      <div class="flex items-end justify-between gap-3">
        <div>
          <h2 class="h2-title section-title-accent">宣传图 / 相关图集</h2>
        </div>
        <NTag round size="small" class="seal-chip">Posters</NTag>
      </div>

      <div class="mt-4">
        <!-- 主轮播：竖图居中展示 -->
        <NCarousel
          v-model:current-index="posterIndex"
          autoplay
          :interval="5200"
          show-arrow
          draggable
          class="poster-carousel"
        >
          <NCarouselItem v-for="p in posters" :key="p.src">
            <figure class="poster-figure">
              <div class="poster-frame">
                <img :src="p.src" :alt="p.alt" class="poster-img" loading="lazy" />
              </div>

              <figcaption v-if="p.caption" class="poster-caption">
                {{ p.caption }}
              </figcaption>
            </figure>
          </NCarouselItem>
        </NCarousel>

        <!-- 缩略图条（横向滚动） -->
        <div class="poster-thumbs mt-4">
          <button
            v-for="(p, i) in posters"
            :key="p.src"
            type="button"
            class="thumb"
            :class="{ active: i === posterIndex }"
            @click="posterIndex = i"
            :title="p.alt"
          >
            <img :src="p.src" :alt="p.alt" class="thumb-img" loading="lazy" />
          </button>
        </div>

      </div>
    </section>
      <NDivider class="my-8" />

      <!-- 底部：参与者名单 -->
      <section class="panel p-4 creators-section">
        <div class="flex items-end justify-between gap-3">
          <div>
            <h2 class="h2-title section-title-accent">参与者名单</h2>
            <p class="p-muted mt-1">点击头像或名字直达 B 站主页。</p>
          </div>
          <div class="pill count-pill">
            <span class="text-xs opacity-70">人数</span>
            <span class="text-sm font-800">{{ sortedCreators.length }}</span>
          </div>
        </div>

        <div class="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
          <div
            v-for="c in sortedCreators"
            :key="c.id"
            class="card-paper px-3 py-2.5 flex items-center gap-2"
          >
            <CreatorBadge
              :name="c.name"
              :url="c.bilibiliSpace"
              :avatar="c.avatar"
              size="md"
              :show-button="false"
            />
          </div>
        </div>

        <div class="mt-4 text-xs text-[var(--mz-text-3)]">
          说明：作者信息为搭建网站时(2026.2.20)录入；详细资料以 B 站空间为准。
        </div>
      </section>

      <!-- 页脚小字 -->
      <section class="mt-6 text-center text-xs text-[var(--mz-text-3)]">
        <div>
          {{ meta.description }}
        </div>
      </section>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
/* Hero 区域 */
.hero-section {
  position: relative;
  background: linear-gradient(135deg, var(--mz-bg-soft) 0%, rgba(231, 215, 210, 0.6) 100%);
}

.hero-stamp {
  position: absolute;
  top: 14px;
  right: 16px;
}

.stamp-outline {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--mz-seal-red) 55%, transparent);
  color: color-mix(in srgb, var(--mz-seal-red) 82%, var(--mz-text));
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  transform: rotate(-7deg);
  background: color-mix(in srgb, var(--mz-seal-red) 10%, transparent);
}

.hero-title {
  font-size: 28px;
  font-weight: 900;
  font-family: var(--mz-font-serif);
  color: var(--mz-text);
  margin: 0 0 8px;
  line-height: 1.3;
  text-shadow: 1px 0 0 color-mix(in srgb, var(--mz-seal-red) 26%, transparent);
}

.hero-desc {
  font-size: 14px;
  color: var(--mz-text-2);
  line-height: 1.6;
  margin: 0;
}

.hero-actions {
  flex-wrap: wrap;
}

.note-section,
.creators-section {
  border-top: 1px solid color-mix(in srgb, var(--mz-seal-red) 22%, var(--mz-border));
}

.section-title-accent {
  position: relative;
  padding-left: 14px;
}

.section-title-accent::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--mz-seal-red);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--mz-seal-red) 20%, transparent);
}

.seal-tag,
.seal-chip {
  border-color: color-mix(in srgb, var(--mz-seal-red) 42%, var(--mz-border)) !important;
  color: color-mix(in srgb, var(--mz-seal-red) 82%, var(--mz-text)) !important;
  background: color-mix(in srgb, var(--mz-seal-red) 10%, var(--mz-card)) !important;
}

.count-pill {
  border-color: color-mix(in srgb, var(--mz-seal-red) 28%, var(--mz-border));
}

.carousel {
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--mz-border);
  background: var(--mz-bg-soft);
}

.carousel-figure {
  position: relative;
  width: 100%;
  height: clamp(220px, 42vw, 420px);
  margin: 0;
}

.carousel-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.carousel-caption {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 250, 248, 0.82);
  border: 1px solid rgba(231, 215, 210, 0.9);
  color: var(--mz-text-1);
  font-size: 13px;
  backdrop-filter: blur(6px);
}
/* 主轮播容器：更适合竖图 */
.poster-carousel {
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--mz-border);
  background: linear-gradient(180deg, rgba(231, 215, 210, 0.6), rgba(239, 227, 223, 0.6));
  min-width: 0;
}

/* 竖版主舞台：高一些，像展览画框 */
.poster-figure {
  position: relative;
  width: 100%;
  height: clamp(520px, 70vh, 780px);
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  padding: 14px;
  min-width: 0;
}

/* 画框：让竖图居中，不裁切 */
.poster-frame {
  flex: 1 1 auto;
  width: 100%;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  border: 1px solid rgba(231, 215, 210, 0.9);
  background: rgba(255, 250, 248, 0.55);
  backdrop-filter: blur(6px);
  min-width: 0;
}

/* 竖图：contain 保留完整构图 */
.poster-img {
  max-height: 100%;
  max-width: min(520px, 92%);
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
  border-radius: 12px;
  box-shadow: 0 18px 50px rgba(50, 30, 20, 0.18);
}

/* caption：放在底部像展牌 */
.poster-caption {
  margin-top: 0;
  flex: 0 0 auto;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 250, 248, 0.86);
  border: 1px solid rgba(231, 215, 210, 0.9);
  color: var(--mz-text-1);
  font-size: 13px;
  line-height: 1.5;
  overflow-wrap: anywhere;
  word-break: break-word;
}

/* 缩略图条：横向滚动 */
.poster-thumbs {
  display: flex;
  gap: 10px;
  justify-content: center;
  overflow-x: auto;
  padding: 6px 2px;
}

.poster-thumbs::before,
.poster-thumbs::after {
  content: '';
  flex: 0 0 2px;
}

.thumb {
  flex: 0 0 auto;
  width: 72px;
  height: 96px; /* 竖图缩略比例 */
  border-radius: 12px;
  border: 1px solid var(--mz-border);
  background: rgba(255, 250, 248, 0.6);
  overflow: hidden;
  transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

.thumb:hover {
  transform: translateY(-1px);
  border-color: rgba(133, 97, 90, 0.5);
}

.thumb.active {
  border-color: var(--mz-seal-red);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--mz-seal-red) 24%, transparent);
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 缩略图可以裁切没关系 */
  display: block;
}

.maintainer-link {
  color: color-mix(in srgb, var(--mz-seal-red) 80%, var(--mz-text));
  text-decoration: underline;
  text-underline-offset: 2px;
}

.maintainer-link:hover {
  opacity: 0.85;
}
</style>
