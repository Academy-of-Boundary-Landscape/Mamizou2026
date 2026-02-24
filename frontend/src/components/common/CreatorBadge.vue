<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { NAvatar, NButton, NIcon } from 'naive-ui'
import { ExternalLink } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  name: string
  url: string
  avatar?: string
  size?: 'sm' | 'md'
  showButton?: boolean
}>(), {
  size: 'md',
  showButton: false
})

const avatarSize = computed(() => (props.size === 'sm' ? 28 : 34))
const avatarSrc = computed(() => {
  const raw = String(props.avatar || '').trim()
  if (!raw) return undefined
  if (/^(https?:)?\/\//.test(raw) || raw.startsWith('data:')) return raw

  const base = import.meta.env.BASE_URL || '/'
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  const normalizedPath = raw.startsWith('/') ? raw.slice(1) : raw
  return `${normalizedBase}${normalizedPath}`
})

const isDev = import.meta.env.DEV

function debugAvatarState(phase: 'mounted' | 'changed') {
  if (!isDev) return

  const raw = String(props.avatar || '').trim()
  const resolved = avatarSrc.value || ''
  console.debug('[CreatorBadge]', {
    phase,
    name: props.name,
    rawAvatar: raw,
    resolvedAvatar: resolved,
    baseUrl: import.meta.env.BASE_URL,
  })

  if (!resolved) return
  const img = new Image()
  img.onload = () => {
    console.debug('[CreatorBadge:image-ok]', {
      name: props.name,
      resolvedAvatar: resolved,
      width: img.naturalWidth,
      height: img.naturalHeight,
    })
  }
  img.onerror = () => {
    console.warn('[CreatorBadge:image-error]', {
      name: props.name,
      resolvedAvatar: resolved,
    })
  }
  img.src = resolved
}

onMounted(() => {
  debugAvatarState('mounted')
})

watch(avatarSrc, () => {
  debugAvatarState('changed')
})

function onAvatarImgLoad() {
  if (!isDev) return
  console.debug('[CreatorBadge:n-avatar-load]', {
    name: props.name,
    resolvedAvatar: avatarSrc.value || '',
  })
}

function onAvatarImgError() {
  if (!isDev) return
  console.warn('[CreatorBadge:n-avatar-error]', {
    name: props.name,
    resolvedAvatar: avatarSrc.value || '',
  })
}

function open() {
  window.open(props.url, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <div class="creator-badge">
    <button class="creator-main" @click="open" type="button">
      <NAvatar
        round
        :size="avatarSize"
        :src="avatarSrc"
        :img-props="{ onLoad: onAvatarImgLoad, onError: onAvatarImgError }"
        class="creator-avatar"
      >
        <!-- 没头像时用首字 -->
        <span v-if="!avatarSrc" class="creator-fallback">{{ name.slice(0, 1) }}</span>
      </NAvatar>

      <span class="creator-name">
        {{ name }}
      </span>
    </button>

    <NButton
      v-if="showButton"
      size="small"
      quaternary
      class="creator-action"
      @click="open"
    >
      <template #icon>
        <NIcon><ExternalLink /></NIcon>
      </template>
      B站主页
    </NButton>
  </div>
</template>

<style scoped>
.creator-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.creator-main {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  padding: 4px 8px 4px 4px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  transition: background-color 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
}

.creator-main:hover {
  background: var(--mz-bg-soft);
  border-color: var(--mz-border);
}

.creator-main:active {
  transform: translateY(1px);
}

.creator-main:focus-visible {
  outline: 2px solid var(--mz-primary-soft);
  outline-offset: 2px;
}

.creator-avatar {
  border: 1px solid var(--mz-border);
  background: var(--mz-card);
  box-shadow: var(--mz-shadow-sm);
  flex: 0 0 auto;
}

.creator-fallback {
  font-size: 11px;
  font-weight: 800;
  color: var(--mz-text-2);
}

.creator-name {
  min-width: 0;
  max-width: 14ch;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 750;
  color: var(--mz-text);
  transition: color 0.18s ease;
}

.creator-main:hover .creator-name {
  color: var(--mz-primary);
}

.creator-action {
  border-radius: 999px;
}
</style>
