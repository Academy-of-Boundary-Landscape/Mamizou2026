<script setup lang="ts">
/**
 * 和风纹样 + 纸纹 + 雾光 的全局背景
 * - pattern 使用用户提供的 Hero Patterns SVG data URI
 * - base 背景改成浅棕纸色（--mz-bg / --mz-bg-soft）
 * - 叠加纸纹噪声，让图案像印在纸上
 */
const props = withDefaults(
  defineProps<{
    /** 总体强度（0~2），越大越“花” */
    intensity?: number
    /** 纹样不透明度（0~1） */
    patternOpacity?: number
    /** 纹样缩放（1=原始大小；2=放大一倍；0.5=缩小一半） */
    patternScale?: number
  }>(),
  {
    intensity: 1.2,
    patternOpacity: 0.28,
    patternScale: 1,
  }
)

/**
 * 你的 Hero Patterns SVG（保持原样）
 * 注意：这里不要额外 encode，只要把整段 url(...) 放入 CSS 变量即可
 */
const heroPatternDataUri =
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 40' width='80' height='40'%3E%3Cpath fill='%236d483f' fill-opacity='0.33' d='M0 40a19.96 19.96 0 0 1 5.9-14.11 20.17 20.17 0 0 1 19.44-5.2A20 20 0 0 1 20.2 40H0zM65.32.75A20.02 20.02 0 0 1 40.8 25.26 20.02 20.02 0 0 1 65.32.76zM.07 0h20.1l-.08.07A20.02 20.02 0 0 1 .75 5.25 20.08 20.08 0 0 1 .07 0zm1.94 40h2.53l4.26-4.24v-9.78A17.96 17.96 0 0 0 2 40zm5.38 0h9.8a17.98 17.98 0 0 0 6.67-16.42L7.4 40zm3.43-15.42v9.17l11.62-11.59c-3.97-.5-8.08.3-11.62 2.42zm32.86-.78A18 18 0 0 0 63.85 3.63L43.68 23.8zm7.2-19.17v9.15L62.43 2.22c-3.96-.5-8.05.3-11.57 2.4zm-3.49 2.72c-4.1 4.1-5.81 9.69-5.13 15.03l6.61-6.6V6.02c-.51.41-1 .85-1.48 1.33zM17.18 0H7.42L3.64 3.78A18 18 0 0 0 17.18 0zM2.08 0c-.01.8.04 1.58.14 2.37L4.59 0H2.07z'%3E%3C/path%3E%3C/svg%3E")`
</script>

<template>
  <div
    class="site-bg"
    :style="{
      '--mz-bg-intensity': String(props.intensity),
      '--mz-pattern-opacity': String(props.patternOpacity),
      '--mz-pattern-scale': String(props.patternScale),
      '--mz-pattern-image': heroPatternDataUri,
    }"
    aria-hidden="true"
  />
</template>

<style scoped>
.site-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;

  /* 纸张底（浅棕，不是纯白） */
  background:
    radial-gradient(1100px 700px at 12% 8%, rgba(133, 97, 90, 0.22), transparent 60%),
    radial-gradient(900px 650px at 88% 12%, rgba(109, 72, 63, 0.14), transparent 58%),
    radial-gradient(1100px 900px at 55% 92%, rgba(199, 168, 160, 0.20), transparent 62%),
    linear-gradient(180deg, var(--mz-bg) 0%, var(--mz-bg-soft) 55%, var(--mz-bg) 100%);
}

/* 纹样层（Hero Patterns） */
.site-bg::before {
  content: '';
  position: absolute;
  inset: 0;

  background-image: var(--mz-pattern-image);
  background-repeat: repeat;

  /* scale 的实现：通过 background-size 乘系数 */
  /* Hero Patterns 原始是 80x40，这里用 calc 放大缩小 */
  background-size: calc(80px * var(--mz-pattern-scale)) calc(40px * var(--mz-pattern-scale));

  mix-blend-mode: multiply;
  opacity: calc(var(--mz-pattern-opacity) * (0.9 + 0.2 * var(--mz-bg-intensity)));
  filter: blur(0.15px);
}

/* 纸纹噪声层：让图案更像“印在纸上” */
.site-bg::after {
  content: '';
  position: absolute;
  inset: 0;

  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 40' width='80' height='40'%3E%3Cpath fill='%236d483f' fill-opacity='0.33' d='M0 40a19.96 19.96 0 0 1 5.9-14.11 20.17 20.17 0 0 1 19.44-5.2A20 20 0 0 1 20.2 40H0zM65.32.75A20.02 20.02 0 0 1 40.8 25.26 20.02 20.02 0 0 1 65.32.76zM.07 0h20.1l-.08.07A20.02 20.02 0 0 1 .75 5.25 20.08 20.08 0 0 1 .07 0zm1.94 40h2.53l4.26-4.24v-9.78A17.96 17.96 0 0 0 2 40zm5.38 0h9.8a17.98 17.98 0 0 0 6.67-16.42L7.4 40zm3.43-15.42v9.17l11.62-11.59c-3.97-.5-8.08.3-11.62 2.42zm32.86-.78A18 18 0 0 0 63.85 3.63L43.68 23.8zm7.2-19.17v9.15L62.43 2.22c-3.96-.5-8.05.3-11.57 2.4zm-3.49 2.72c-4.1 4.1-5.81 9.69-5.13 15.03l6.61-6.6V6.02c-.51.41-1 .85-1.48 1.33zM17.18 0H7.42L3.64 3.78A18 18 0 0 0 17.18 0zM2.08 0c-.01.8.04 1.58.14 2.37L4.59 0H2.07z'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: repeat;

  mix-blend-mode: multiply;
  opacity: calc(0.14 * var(--mz-bg-intensity));
}

/* 轻雾层：用 filter+动画给一点点“活感”，但不抢戏 */
.site-bg {
  animation: mz-bg-float 18s ease-in-out infinite;
  filter: saturate(1.03) contrast(1.02);
}

@keyframes mz-bg-float {
  0%   { transform: translate3d(0, 0, 0) scale(1); }
  50%  { transform: translate3d(0.9%, -0.7%, 0) scale(1.015); }
  100% { transform: translate3d(0, 0, 0) scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .site-bg { animation: none; }
}
</style>
