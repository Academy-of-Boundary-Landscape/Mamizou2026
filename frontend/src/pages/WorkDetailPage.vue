<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  NAlert,
  NButton,
  NDivider,
  NSkeleton,
  NTag,
} from 'naive-ui'
import MarkdownIt from 'markdown-it'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-vue-next'
import SiteHeader from '@/components/common/SiteHeader.vue'
import SiteFooter from '@/components/common/SiteFooter.vue'
import CreatorBadge from '@/components/common/CreatorBadge.vue'
import { useSiteData } from '@/composables/useSiteData'

type RenderMode = 'text' | 'visual' | 'embed'

const route = useRoute()
const headerSearch = ref('')

const { works, getCreator } = useSiteData()

const work = computed(() => works.find((w) => w.id === String(route.params.id)))
const creator = computed(() => (work.value ? getCreator(work.value.creatorId) : undefined))

/**
 * 兼容字段：
 * - contentFile / contentUrl / content (字符串)
 * 对 text：文本文件内容就是正文（纯文本/markdown 都先按纯文本展示）
 * 对 visual：文本文件内容是图片 URL 列表（每行一个，可混空行）
 */
function getContentFileUrl(w: any): string | undefined {
  return w?.contentFile || w?.contentUrl || w?.content
}

const renderMode = computed<RenderMode>(() => {
  const t = work.value?.type
  if (t === 'text') return 'text'
  if (t === 'visual') return 'visual'
  return 'embed'
})

const contentLoading = ref(false)
const contentError = ref('')
const textContent = ref('')
const imageUrls = ref<string[]>([])

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
  typographer: true,
})

const renderedTextHtml = computed(() => {
  if (!textContent.value) return ''
  return markdown.render(textContent.value)
})

function normalizeLines(raw: string) {
  return raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => !s.startsWith('#')) // 允许在 txt 里写注释
}

function isImageFileUrl(input: string) {
  const clean = (input.split('?')[0] ?? '').split('#')[0] ?? ''
  return /\.(png|jpe?g|webp|gif|bmp|svg|avif)$/i.test(clean)
}

async function loadExternalContent() {
  contentError.value = ''
  textContent.value = ''
  imageUrls.value = []

  const w: any = work.value
  if (!w) return

  const mode = renderMode.value
  if (mode === 'embed') return

  const fileUrl = getContentFileUrl(w)
  if (!fileUrl) {
    contentError.value = mode === 'text'
      ? '这个文字作品还没有配置正文文件（contentFile）。'
      : '这个画类作品还没有配置图片列表文件或图片文件（contentFile）。'
    return
  }

  if (mode === 'visual' && isImageFileUrl(fileUrl)) {
    imageUrls.value = [fileUrl]
    return
  }

  contentLoading.value = true
  try {
    const res = await fetch(fileUrl)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const raw = await res.text()

    if (mode === 'text') {
      textContent.value = raw.trim()
    } else {
      imageUrls.value = normalizeLines(raw)
      if (!imageUrls.value.length) {
        contentError.value = '图片列表文件为空（请在文本文件里每行放一个图片 URL）。'
      }
    }
  } catch (err: any) {
    contentError.value = `读取内容失败：${err?.message ?? String(err)}`
  } finally {
    contentLoading.value = false
  }
}

watch(() => work.value?.id, () => {
  loadExternalContent()
}, { immediate: true })

onMounted(() => {
  // route 首次进入时 watch(immediate) 已处理，这里可留空
})

function openWork(url?: string) {
  if (!url) return
  window.open(url, '_blank', 'noopener,noreferrer')
}

function extractBvid(url?: string): string | null {
  if (!url) return null
  const m = url.match(/BV([A-Za-z0-9]+)/i)
  return m ? `BV${m[1]}` : null
}

function extractIframeSrc(input?: string): string {
  if (!input) return ''
  const trimmed = input.trim()

  // 直接就是播放器地址
  if (/^(https?:)?\/\/player\.bilibili\.com\/player\.html/i.test(trimmed)) {
    return trimmed.startsWith('//') ? `https:${trimmed}` : trimmed
  }

  // 传入的是 iframe 片段，提取 src
  const match = trimmed.match(/<iframe[^>]*\bsrc=["']([^"']+)["'][^>]*>/i)
  if (!match?.[1]) return ''
  const src = match[1].trim()
  if (!src) return ''
  return src.startsWith('//') ? `https:${src}` : src
}

const bvid = computed(() => {
  const w: any = work.value
  if (!w) return null
  return w?.bilibili?.bvid || extractBvid(w.url)
})

const bilibiliEmbedUrl = computed(() => {
  const w: any = work.value
  if (!w) return ''

  const rawEmbed =
    w?.bilibiliUrl ||
    w?.bilibili?.url ||
    w?.bilibili?.iframe ||
    w?.bilibili?.embed ||
    w?.url

  const directEmbedUrl = extractIframeSrc(rawEmbed)
  if (directEmbedUrl) return directEmbedUrl

  if (!bvid.value) return ''
  // 推荐嵌入地址（基础版）
  return `https://player.bilibili.com/player.html?bvid=${encodeURIComponent(bvid.value)}&page=1`
})

const heroCoverSrc = computed(() => {
  const w: any = work.value
  if (!w) return ''

  const cover = String(w.cover || '').trim()
  if (cover) return cover

  if (renderMode.value !== 'visual') return '/posters/second.png'

  const fileUrl = String(getContentFileUrl(w) || '').trim()
  if (fileUrl && isImageFileUrl(fileUrl)) return fileUrl

  return imageUrls.value[0] || '/posters/second.png'
})

const sortedWorks = computed(() => [...works].slice().sort((a, b) => a.slot.localeCompare(b.slot)))
const prevNext = computed(() => {
  const w = work.value
  if (!w) return { prev: undefined, next: undefined }
  const idx = sortedWorks.value.findIndex((x) => x.id === w.id)
  return {
    prev: idx > 0 ? sortedWorks.value[idx - 1] : undefined,
    next: idx >= 0 && idx < sortedWorks.value.length - 1 ? sortedWorks.value[idx + 1] : undefined,
  }
})
</script>

<template>
  <div class="app-page flex flex-col">
    <SiteHeader :show-search="false" v-model:search="headerSearch" />

    <main class="app-container py-6 flex-1">
      <template v-if="work">
        <!-- 顶部信息展牌 -->
        <section class="hero-section p-6 sm:p-8">
          <div class="hero-stamp">
            <span class="stamp">{{ work.slot }}</span>
          </div>

          <div class="flex flex-col gap-6 lg:flex-row">
            <!-- 左侧：封面占位 -->
            <div class="cover-area">
              <div class="cover-frame">
                <img
                  v-if="heroCoverSrc"
                  :src="heroCoverSrc"
                  alt="作品封面"
                  class="hero-cover-image"
                  loading="lazy"
                />
                <span v-else class="cover-icon">狸</span>
              </div>
            </div>

            <!-- 右侧：展牌信息 -->
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-3">
                <NTag round size="small" type="primary">{{ work.type.toUpperCase() }}</NTag>
              </div>

              <h1 class="work-title">{{ work.title }}</h1>

              <div class="creator-section mt-4">
                <span class="section-label">作者</span>
                <CreatorBadge
                  v-if="creator"
                  :name="creator.name"
                  :url="creator.bilibiliSpace"
                  :avatar="creator.avatar"
                  size="md"
                  show-button
                />
                <span v-else class="text-sm text-[var(--mz-text-2)]">Unknown creator</span>
              </div>

              <div v-if="work.tags?.length" class="tags-section mt-4">
                <span class="section-label">标签</span>
                <div class="tags-list">
                  <span v-for="t in work.tags" :key="t" class="pill-sm">{{ t }}</span>
                </div>
              </div>

              <div class="actions-section mt-6">
                <NButton type="primary" round @click="openWork(work.url)">
                  <template #icon>
                    <ExternalLink :size="16" />
                  </template>
                  在 B 站打开
                </NButton>
                <RouterLink to="/timeline">
                  <NButton round>时间轴</NButton>
                </RouterLink>
                <RouterLink to="/">
                  <NButton round>作品墙</NButton>
                </RouterLink>
              </div>
            </div>
          </div>
        </section>

        <!-- 主内容 -->
        <section class="content-section card-paper p-6 mt-6">
          <div class="section-header">
            <h2 class="section-title-text">作品内容</h2>
            <NTag round size="small">
              {{
                renderMode === 'text'
                  ? '文字展示'
                  : renderMode === 'visual'
                    ? '图片展示'
                    : 'B站播放器'
              }}
            </NTag>
          </div>

          <NDivider class="!my-4" />

          <!-- 文字类 -->
          <template v-if="renderMode === 'text'">
            <div v-if="contentLoading" class="space-y-3">
              <NSkeleton text :repeat="6" />
            </div>

            <NAlert v-else-if="contentError" type="warning" class="!rounded-[14px]">
              {{ contentError }}
            </NAlert>

            <article v-else class="text-article">
              <div class="markdown-body" v-html="renderedTextHtml" />
            </article>
          </template>

          <!-- 画类 -->
          <template v-else-if="renderMode === 'visual'">
            <div v-if="contentLoading" class="grid gap-4 sm:grid-cols-2">
              <div class="image-skeleton" v-for="i in 4" :key="i">
                <NSkeleton height="220px" />
              </div>
            </div>

            <NAlert v-else-if="contentError" type="warning" class="!rounded-[14px]">
              {{ contentError }}
            </NAlert>

            <div v-else class="image-grid">
              <figure v-for="src in imageUrls" :key="src" class="image-card">
                <img :src="src" alt="作品图片" class="work-image" loading="lazy" />
              </figure>
            </div>
          </template>

          <!-- 视频 / 其他：B站 iframe -->
          <template v-else>
            <div v-if="bilibiliEmbedUrl" class="video-wrap">
              <iframe
                class="video-frame"
                :src="bilibiliEmbedUrl"
                scrolling="no"
                frameborder="0"
                allowfullscreen="true"
              />
            </div>

            <NAlert v-else type="info" class="!rounded-[14px]">
              这个作品无法自动识别 B 站视频号（BV）。请点击上方按钮前往原链接观看。
            </NAlert>
          </template>
        </section>

        <!-- 上一棒 / 下一棒 接力导航 -->
        <section class="relay-nav mt-6">
          <div class="relay-nav-inner">
            <RouterLink
              v-if="prevNext.prev"
              :to="`/work/${prevNext.prev.id}`"
              class="relay-btn relay-prev relay-link"
            >
              <ChevronLeft :size="18" />
              <div class="relay-btn-content">
                <span class="relay-label">上一棒</span>
                <span class="relay-title">{{ prevNext.prev.title }}</span>
              </div>
            </RouterLink>
            <button v-else class="relay-btn relay-prev" :disabled="true">
              <ChevronLeft :size="18" />
              <div class="relay-btn-content">
                <span class="relay-label">上一棒</span>
              </div>
            </button>

            <div class="relay-center">
              <span class="stamp-primary">接力</span>
            </div>

            <RouterLink
              v-if="prevNext.next"
              :to="`/work/${prevNext.next.id}`"
              class="relay-btn relay-next relay-link"
            >
              <div class="relay-btn-content">
                <span class="relay-label">下一棒</span>
                <span class="relay-title">{{ prevNext.next.title }}</span>
              </div>
              <ChevronRight :size="18" />
            </RouterLink>
            <button v-else class="relay-btn relay-next" :disabled="true">
              <div class="relay-btn-content">
                <span class="relay-label">下一棒</span>
              </div>
              <ChevronRight :size="18" />
            </button>
          </div>
        </section>
      </template>

      <!-- work 不存在 -->
      <template v-else>
        <section class="empty-state card-paper p-8 text-center">
          <div class="empty-icon">狸</div>
          <div class="empty-title">没有找到这个作品</div>
          <p class="empty-desc">可能是链接错误，或者数据里还没录入。</p>
          <div class="mt-6">
            <RouterLink to="/">
              <NButton type="primary" round>返回作品墙</NButton>
            </RouterLink>
          </div>
        </section>
      </template>
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

.cover-area {
  flex-shrink: 0;
}

.cover-frame {
  width: 280px;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--mz-card) 0%, var(--mz-bg-soft) 100%);
  border: 2px dashed var(--mz-border);
  border-radius: 14px;
  overflow: hidden;
}

.hero-cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.cover-icon {
  font-size: 48px;
  font-weight: 900;
  color: var(--mz-primary-soft);
  opacity: 0.4;
}

.work-title {
  font-size: 24px;
  font-weight: 900;
  font-family: var(--mz-font-serif);
  color: var(--mz-text);
  margin: 0;
  line-height: 1.4;
}

.section-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: var(--mz-text-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.actions-section {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

/* 内容区域 */
.content-section {
  position: relative;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-title-text {
  font-size: 18px;
  font-weight: 800;
  font-family: var(--mz-font-serif);
  color: var(--mz-text);
  margin: 0;
}

.text-article {
  border: 1px solid var(--mz-border);
  border-radius: 14px;
  background: var(--mz-card);
  padding: 20px;
}

.text-pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.75;
  color: var(--mz-text);
  font-family: inherit;
  font-size: 15px;
}

.markdown-body {
  color: var(--mz-text);
  font-size: 15px;
  line-height: 1.8;
  word-break: break-word;
}

.markdown-body :deep(*) {
  max-width: 100%;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4),
.markdown-body :deep(h5),
.markdown-body :deep(h6) {
  margin: 1.2em 0 0.6em;
  line-height: 1.4;
  font-family: var(--mz-font-serif);
  font-weight: 800;
}

.markdown-body :deep(p) {
  margin: 0.8em 0;
}

.markdown-body :deep(strong) {
  font-weight: 800;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin: 0.8em 0;
  padding-left: 1.4em;
}

.markdown-body :deep(blockquote) {
  margin: 1em 0;
  padding: 0.6em 0.9em;
  border-left: 3px solid var(--mz-border);
  background: var(--mz-bg-soft);
  color: var(--mz-text-2);
}

.markdown-body :deep(code) {
  padding: 0.1em 0.35em;
  border-radius: 6px;
  background: var(--mz-bg-soft);
}

.markdown-body :deep(pre) {
  margin: 0.9em 0;
  padding: 0.8em 1em;
  border: 1px solid var(--mz-border);
  border-radius: 10px;
  background: var(--mz-bg-soft);
  overflow-x: auto;
}

.markdown-body :deep(pre code) {
  padding: 0;
  background: transparent;
}

.markdown-body :deep(a) {
  color: var(--mz-primary);
  text-decoration: underline;
}

.image-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 420px));
  justify-content: center;
}

.image-card {
  margin: 0;
  border: 1px solid var(--mz-border);
  border-radius: 12px;
  background: var(--mz-card);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.image-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--mz-shadow-sm);
}

.work-image {
  width: 100%;
  display: block;
  object-fit: cover;
  object-position: center;
  background: var(--mz-bg-soft);
}

.image-url {
  padding: 8px 12px;
  font-size: 11px;
  color: var(--mz-text-3);
  border-top: 1px solid var(--mz-border);
  word-break: break-all;
  background: var(--mz-bg-soft);
}

.video-wrap {
  width: 100%;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--mz-border);
  background: #000;
  aspect-ratio: 16 / 9;
}

.video-frame {
  width: 100%;
  height: 100%;
  display: block;
}

.image-skeleton {
  border-radius: 12px;
  overflow: hidden;
}

/* 接力导航 */
.relay-nav {
  position: relative;
}

.relay-nav-inner {
  display: flex;
  align-items: stretch;
  gap: 12px;
}

.relay-btn {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: var(--mz-card);
  border: 2px solid var(--mz-border);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.relay-link {
  text-decoration: none;
}

.relay-btn:hover:not(:disabled) {
  border-color: var(--mz-primary);
  background: var(--mz-bg-soft);
}

.relay-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.relay-next {
  flex-direction: row-reverse;
  text-align: right;
}

.relay-btn-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.relay-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--mz-text-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.relay-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--mz-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.relay-center {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
}

/* Empty state */
.empty-state {
  max-width: 480px;
  margin: 60px auto 0;
}

.empty-icon {
  font-size: 56px;
  font-weight: 900;
  color: var(--mz-primary-soft);
  opacity: 0.4;
  margin-bottom: 20px;
}

.empty-title {
  font-size: 20px;
  font-weight: 800;
  color: var(--mz-text);
  margin-bottom: 8px;
  font-family: var(--mz-font-serif);
}

.empty-desc {
  font-size: 14px;
  color: var(--mz-text-2);
  margin: 0;
}

/* reduced motion */
@media (prefers-reduced-motion: reduce) {
  .image-card,
  .relay-btn {
    transition: none;
  }
}
</style>
