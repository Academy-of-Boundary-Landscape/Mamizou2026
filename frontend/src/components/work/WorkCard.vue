<script setup lang="ts">
import { computed } from 'vue'
import { NButton } from 'naive-ui'
import type { Work } from '@/composables/useSiteData'
import CreatorBadge from '@/components/common/CreatorBadge.vue'

const props = defineProps<{
  work: Work
  showDetail?: boolean
}>()

const emit = defineEmits<{
  (e: 'open', url: string): void
  (e: 'detail', id: string): void
}>()

function openWork() {
  if (props.work.url) emit('open', props.work.url)
}

function goToDetail() {
  emit('detail', props.work.id)
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
const typeLabel = computed(() => typeLabelMap[props.work.type] || props.work.type)

const stampRotateDeg = computed(() => {
  const s = String(props.work.id || props.work.creatorName || props.work.type || 'stamp')
  let hash = 0
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) | 0
  }
  // 生成 -4.5deg ~ +4.5deg 的稳定“随机”角度
  const normalized = ((hash >>> 0) % 900) / 100 - 4.5
  return `${normalized.toFixed(2)}deg`
})
</script>

<template>
  <article class="work-ticket" :class="`type-${work.type}`">
    <!-- 左侧打孔边 -->
    <div class="ticket-spine" aria-hidden="true">
      <span v-for="i in 6" :key="i" class="spine-hole"></span>
    </div>

    <!-- 主体 -->
    <div class="ticket-body" @click="goToDetail">
      <!-- 折角 -->
      <span class="corner-fold" aria-hidden="true"></span>

      <!-- 顶部：槽位 + 类型 -->
      <header class="ticket-head">
        <div class="slot-chip" :title="`槽位 ${work.slot}`">
          <span class="slot-time">{{ work.slot }}</span>
        </div>

        <span
        class="type-stamp"
        :style="{ '--stamp-rot': stampRotateDeg }"
        >
        {{ typeLabel }}
        </span>
      </header>

      <!-- 中间：预览窗 -->
      <div class="preview-window">
        <img
          v-if="work.cover"
          :src="work.cover"
          class="preview-image"
          :alt="`${work.creatorName || '作品'} 预览`"
          loading="lazy"
        />
        <img
          v-else
          src="/assets/default_background.jpg"
          class="preview-image"
          :alt="`${work.creatorName || '作品'} 占位图`"
          loading="lazy"
        />
      </div>

      <!-- 主信息：作者（替代作品名） -->
      <div class="ticket-main">
        <div class="author-line">
          <CreatorBadge
            :name="work.creatorName || '未填写'"
            :url="work.bilibiliSpace || work.url || ''"
            :avatar="work.avatar"
            size="sm"
            :show-button="false"
          />
        </div>


        <!-- tags -->
        <div v-if="work.tags?.length" class="tag-list">
            <span v-for="t in work.tags.slice(0, 2)" :key="t" class="tag-chip">{{ t }}</span>
            <span v-if="work.tags.length > 2" class="tag-chip muted">+{{ work.tags.length - 2 }}</span>
        </div>
        </div>

      <!-- 底部撕线 + 按钮 -->
      <div class="tear-line" aria-hidden="true"></div>

      <footer class="ticket-actions">
        <NButton
          type="primary"
          size="small"
          round
          :disabled="!work.url"
          @click.stop="openWork"
        >
          作品B站链接
        </NButton>

        <NButton
          v-if="showDetail !== false"
          size="small"
          round
          ghost
          @click.stop="goToDetail"
        >
          详情
        </NButton>
      </footer>
    </div>
  </article>
</template>
<style scoped>
/* ========= 整体票签 ========= */
.work-ticket {
  position: relative;
  display: flex;
  min-height: 272px;
  height: 100%;
  border: 1px solid color-mix(in srgb, var(--mz-border) 86%, rgba(90, 60, 50, 0.18));
  border-radius: 10px;
  overflow: hidden;

  background:
    radial-gradient(circle at 14% 18%, rgba(255, 255, 255, 0.72) 0 10%, transparent 45%),
    radial-gradient(circle at 86% 82%, rgba(220, 195, 180, 0.10) 0 12%, transparent 55%),
    linear-gradient(180deg, rgba(255, 252, 247, 0.98), rgba(244, 236, 228, 0.96));
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.78) inset,
    0 0 0 1px rgba(255, 255, 255, 0.24) inset,
    0 10px 22px rgba(38, 22, 16, 0.10);

  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease,
    filter 0.18s ease;

  /* 票签切角（保留右上切角空间） */
  clip-path: polygon(
    0 0,
    calc(100% - 18px) 0,
    100% 18px,
    100% calc(100% - 10px),
    calc(100% - 10px) 100%,
    0 100%
  );
}

.work-ticket::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.08;
  background-image:
    radial-gradient(rgba(90, 60, 50, 0.9) 0.55px, transparent 0.8px),
    radial-gradient(rgba(90, 60, 50, 0.6) 0.45px, transparent 0.7px);
  background-size: 10px 10px, 13px 13px;
  background-position: 0 0, 5px 7px;
}

.work-ticket::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: 10px;
  box-shadow:
    0 0 0 1px rgba(120, 88, 76, 0.05) inset,
    0 -12px 20px rgba(255, 255, 255, 0.25) inset,
    0 14px 18px rgba(120, 80, 60, 0.04) inset;
}

/* ========= 左侧票孔边 ========= */
.ticket-spine {
  position: relative;
  width: 16px;
  flex: 0 0 16px;
  border-right: 1px dashed color-mix(in srgb, var(--mz-border) 84%, rgba(100, 70, 60, 0.2));
  background: linear-gradient(180deg, rgba(229, 214, 207, 0.56), rgba(229, 214, 207, 0.18));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  padding: 7px 0;
  z-index: 1;
}

.ticket-spine::before {
  content: '';
  position: absolute;
  top: 4px;
  bottom: 4px;
  right: 2px;
  width: 1px;
  background: linear-gradient(180deg, rgba(255,255,255,0.65), rgba(130,90,75,0.10), rgba(255,255,255,0.4));
  opacity: 0.7;
}

.spine-hole {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background:
    radial-gradient(circle at 35% 30%, rgba(255,255,255,0.42), transparent 55%),
    color-mix(in srgb, var(--mz-seal-red) 28%, var(--mz-border));
  opacity: 0.92;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.32) inset,
    0 0 0 1px rgba(90, 55, 46, 0.08);
}

/* ========= 主体 ========= */
.ticket-body {
  position: relative;
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 9px;
  /* 右侧留更多空间给折角，避免头部标签撞上去 */
  padding: 10px 12px 9px 11px;
  z-index: 1;
}

/* ========= 右上折角（修复+加大） ========= */
/* 关键点：
   1) 用更大的尺寸
   2) 折角在 ticket-body 内部但不遮挡头部内容
   3) 增加折痕和阴影，像真纸张
*/
.corner-fold {
  position: absolute;
  top: 0;
  right: 0;
  width: 40px;   /* 加大 */
  height: 40px;  /* 加大 */
  pointer-events: none;
  z-index: 3;
}

/* 折角正面 */
.corner-fold::before {
  content: '';
  position: absolute;
  inset: 0;
  clip-path: polygon(100% 0, 0 0, 100% 100%);
  background:
    linear-gradient(
      135deg,
      rgba(210, 182, 170, 0.78) 0 44%,
      rgba(251, 246, 242, 0.96) 52% 78%,
      rgba(238, 226, 219, 0.98) 100%
    );
  border-left: 1px solid rgba(168, 134, 124, 0.34);
  border-bottom: 1px solid rgba(168, 134, 124, 0.34);
  box-shadow:
    -1px 1px 0 rgba(255,255,255,0.35) inset,
    -3px 3px 6px rgba(70, 42, 34, 0.08);
}

/* 折痕线 */
.corner-fold::after {
  content: '';
  position: absolute;
  width: 30px;
  height: 1px;
  right: 4px;
  top: 18px;
  transform: rotate(-45deg);
  transform-origin: right center;
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.0),
    rgba(255,255,255,0.55) 30%,
    rgba(126, 88, 76, 0.28) 70%,
    rgba(126, 88, 76, 0.08)
  );
  opacity: 0.95;
}

/* ========= 头部 ========= */
.ticket-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  /* 给更大的折角让位（修复遮挡） */
  padding-right: 30px;
  position: relative;
  z-index: 2;
}

/* 槽位印刷签 */
.slot-chip {
  display: inline-flex;
  align-items: center;
  padding: 1px 0 2px;
  border-bottom: 1px solid color-mix(in srgb, var(--mz-seal-red) 30%, var(--mz-border));
  transform: rotate(-2.4deg);
  transform-origin: left center;
}

.slot-time {
  font-family: 'Caveat', 'Segoe Script', 'Bradley Hand', 'Comic Sans MS', cursive;
  font-variant-numeric: tabular-nums;
  font-size: 13px;
  font-weight: 700;
  color: color-mix(in srgb, var(--mz-seal-red) 80%, #5c2d22);
  letter-spacing: 0.04em;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
}
.type-stamp {
  --stamp-rot: -2deg;

  flex-shrink: 0;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  /* 方章尺寸 */
  width: 44px;
  height: 28px;
  padding: 0 4px;
  border-radius: 2px;

  /* 字 */
  font-size: 13px;
  line-height: 1;
  font-weight: 950;
  letter-spacing: 0.12em;
  font-family: var(--mz-font-serif);
  color: rgba(255, 255, 255, 0.96);
  text-shadow:
    0 0 0.5px rgba(255,255,255,0.82),
    0 0 1px rgba(110, 22, 17, 0.2),
    0 1px 0 rgba(90, 16, 12, 0.28);

  /* “印章盖上去”的底色（不要金属高光） */
  background:
    linear-gradient(180deg, rgba(185, 40, 33, 0.90), rgba(162, 30, 25, 0.92));

  /* 不要按钮边框，改成淡淡印边 */
  border: 1px solid rgba(120, 20, 16, 0.22);

  /* 关键：像盖在纸上，不是浮起来的按钮 */
  box-shadow:
    0 0 0 0.5px rgba(170, 32, 26, 0.22),
    0 0 2px rgba(160, 30, 24, 0.20),
    0 0.5px 0 rgba(255,255,255,0.08) inset;

  /* 轻微模糊与倾斜 */
  transform: rotate(var(--stamp-rot)) translateY(0.5px);
  filter: saturate(0.95) blur(0.15px);

  /* 像印在纸上 */
  opacity: 0.95;
  overflow: hidden;
  isolation: isolate;
}

/* 印章杂色 / 缺墨颗粒 / 油墨不均 */
.type-stamp::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: 1px;

  background:
    /* 缺墨白点 */
    radial-gradient(circle at 12% 30%, rgba(255,255,255,0.26) 0 0.8px, transparent 1.2px),
    radial-gradient(circle at 22% 72%, rgba(255,255,255,0.18) 0 0.6px, transparent 1.1px),
    radial-gradient(circle at 58% 24%, rgba(255,255,255,0.20) 0 0.7px, transparent 1.1px),
    radial-gradient(circle at 84% 62%, rgba(255,255,255,0.16) 0 0.7px, transparent 1.2px),
    radial-gradient(circle at 74% 18%, rgba(255,255,255,0.12) 0 0.5px, transparent 1px),

    /* 深色油墨团（轻微） */
    radial-gradient(circle at 18% 56%, rgba(102, 10, 8, 0.14) 0 1.5px, transparent 2.3px),
    radial-gradient(circle at 67% 42%, rgba(92, 8, 7, 0.10) 0 1.4px, transparent 2.2px),
    radial-gradient(circle at 88% 22%, rgba(98, 10, 8, 0.10) 0 1.2px, transparent 2px),

    /* 纤维/刷痕 */
    repeating-linear-gradient(
      12deg,
      rgba(255,255,255,0.06) 0 1px,
      rgba(255,255,255,0.00) 1px 3px
    ),
    repeating-linear-gradient(
      101deg,
      rgba(90, 8, 7, 0.04) 0 1px,
      rgba(90, 8, 7, 0.00) 1px 4px
    );

  opacity: 0.8;
  mix-blend-mode: screen;
}

/* 边缘渗色 + 盖章压痕感（模糊、不规则） */
.type-stamp::after {
  content: '';
  position: absolute;
  inset: -1px;
  pointer-events: none;
  border-radius: 2px;

  /* 用多层 inset 模拟渗边/压印 */
  box-shadow:
    0 0 0 0.5px rgba(255,255,255,0.05) inset,
    0 0 3px rgba(255,255,255,0.08) inset,
    0 0 5px rgba(90, 6, 6, 0.18) inset,
    0 0 2px rgba(150, 24, 20, 0.22);

  opacity: 0.9;

  /* 再叠一点不规则透明遮罩，让边缘不那么“完美” */
  background:
    radial-gradient(circle at 0% 0%, rgba(255,255,255,0.06), transparent 38%),
    radial-gradient(circle at 100% 100%, rgba(80,8,7,0.08), transparent 36%),
    radial-gradient(circle at 100% 0%, rgba(255,255,255,0.03), transparent 32%),
    radial-gradient(circle at 0% 100%, rgba(80,8,7,0.06), transparent 34%);
}

/* 悬浮时不要变“按钮感”，只轻微明显一点 */
.work-ticket:hover .type-stamp {
  opacity: 0.98;
  filter: saturate(1) blur(0.1px);
}
/* ========= 预览窗 ========= */
.preview-window {
  position: relative;
  border-radius: 7px;
  border: 1px solid color-mix(in srgb, var(--mz-border) 85%, rgba(100, 70, 60, 0.16));
  background: rgba(255, 250, 246, 0.90);
  overflow: hidden;
  cursor: pointer;
  aspect-ratio: 16 / 9;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.35) inset,
    0 2px 6px rgba(40, 22, 16, 0.05);
}

.preview-window::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.18), transparent 30%),
    linear-gradient(90deg, transparent 0 82%, rgba(130,90,75,0.05) 100%);
  z-index: 2;
}

.preview-window::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 28%;
  pointer-events: none;
  background: linear-gradient(180deg, transparent, rgba(24, 14, 11, 0.20));
  z-index: 2;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transform: scale(1.001);
  transition: transform 0.25s ease, filter 0.25s ease;
}

/* ========= 主信息 ========= */
.ticket-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.author-line {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-width: 0;
  padding: 2px 0 1px;
  border-bottom: 1px solid rgba(120, 90, 75, 0.10);
}

.author-line :deep(.creator-main) {
  padding-left: 0;
  margin-left: -1px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tag-chip {
  position: relative;
  height: 20px;
  display: inline-flex;
  align-items: center;
  padding: 0 8px 0 10px;
  border-radius: 4px;
  border: 1px solid color-mix(in srgb, var(--mz-border) 84%, rgba(98, 72, 61, 0.18));
  background: linear-gradient(180deg, rgba(255, 253, 250, 0.92), rgba(248, 241, 236, 0.90));
  color: var(--mz-text-2);
  font-size: 10px;
  box-shadow: 0 1px 0 rgba(255,255,255,0.55) inset;
}

.tag-chip::before {
  content: '';
  position: absolute;
  left: 4px;
  top: 50%;
  width: 3px;
  height: 3px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--mz-seal-red) 45%, var(--mz-border));
  transform: translateY(-50%);
  opacity: 0.65;
}

.tag-chip.muted {
  opacity: 0.72;
}

/* ========= 撕线 ========= */
.tear-line {
  margin-top: auto;
  height: 1px;
  position: relative;
  opacity: 0.95;
  background:
    repeating-linear-gradient(
      to right,
      color-mix(in srgb, var(--mz-border) 84%, rgba(110, 80, 70, 0.15)) 0 5px,
      transparent 5px 9px
    );
}

.tear-line::before,
.tear-line::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 9px;
  height: 9px;
  background: var(--mz-bg);
  border: 1px solid color-mix(in srgb, var(--mz-border) 84%, rgba(110, 80, 70, 0.15));
  border-radius: 999px;
  transform: translateY(-50%);
  box-shadow: 0 1px 0 rgba(255,255,255,0.35) inset;
}

.tear-line::before {
  left: -15px;
}

.tear-line::after {
  right: -4px;
}

/* ========= 底部按钮区 ========= */
.ticket-actions {
  display: flex;
  gap: 6px;
  padding-top: 2px;
}

.ticket-actions :deep(.n-button) {
  --n-height: 26px !important;
  --n-border-radius: 999px !important;
  font-weight: 700;
  letter-spacing: 0.02em;
  box-shadow: 0 1px 0 rgba(255,255,255,0.28) inset;
}

.ticket-actions :deep(.n-button--primary-type) {
  --n-color: color-mix(in srgb, var(--mz-seal-red) 82%, #6d3026) !important;
  --n-color-hover: color-mix(in srgb, var(--mz-seal-red) 90%, #5c261d) !important;
  --n-color-pressed: color-mix(in srgb, var(--mz-seal-red) 94%, #4f1f18) !important;
  --n-border: 1px solid color-mix(in srgb, var(--mz-seal-red) 62%, #5f2a22) !important;
}

.ticket-actions :deep(.n-button--ghost) {
  --n-border: 1px solid color-mix(in srgb, var(--mz-border) 78%, rgba(100, 70, 60, 0.18)) !important;
  --n-text-color: var(--mz-text-2) !important;
  --n-text-color-hover: var(--mz-text) !important;
}

/* ========= Hover ========= */
.work-ticket:hover {
  transform: translateY(-3px) rotate(-0.35deg);
  border-color: color-mix(in srgb, var(--mz-seal-red) 30%, var(--mz-border));
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.78) inset,
    0 0 0 1px rgba(255, 255, 255, 0.24) inset,
    0 14px 28px rgba(38, 22, 16, 0.14);
  filter: saturate(1.02);
}

.work-ticket:hover .ticket-spine {
  background: linear-gradient(180deg, rgba(229, 214, 207, 0.66), rgba(229, 214, 207, 0.24));
}

.work-ticket:hover .spine-hole {
  background:
    radial-gradient(circle at 35% 30%, rgba(255,255,255,0.5), transparent 55%),
    color-mix(in srgb, var(--mz-seal-red) 44%, var(--mz-border));
}

.work-ticket:hover .preview-window {
  border-color: color-mix(in srgb, var(--mz-seal-red) 26%, var(--mz-border));
}

.work-ticket:hover .preview-image {
  transform: scale(1.02);
  filter: contrast(1.02) saturate(1.02);
}

/* ========= 类型微调 ========= */
.type-video .slot-chip {
  border-color: color-mix(in srgb, var(--mz-seal-red) 34%, var(--mz-border));
}
.type-visual .preview-window {
  background: rgba(252, 249, 246, 0.92);
}


/* ========= 移动端 ========= */
@media (max-width: 640px) {
  .work-ticket {
    min-height: 252px;
  }

  .ticket-body {
    gap: 8px;
    padding: 9px 10px 8px 10px;
  }

  .ticket-head {
    padding-right: 24px;
  }

  .corner-fold {
    width: 34px;
    height: 34px;
  }

}

@media (prefers-reduced-motion: reduce) {
  .work-ticket,
  .preview-image {
    transition: none;
  }
}
</style>