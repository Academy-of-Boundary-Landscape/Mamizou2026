// src/styles/unoShortcuts.ts
export const unoShortcuts: Record<string, string> = {
  // ===== 页面容器 =====
  'app-page': 'min-h-screen text-[var(--mz-text)]',
  'app-container': 'mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8',

  // ===== 标题/正文 =====
  'h1-title': 'text-2xl sm:text-3xl font-800 tracking-wide font-[var(--mz-font-serif)]',
  'h2-title': 'text-xl sm:text-2xl font-800 font-[var(--mz-font-serif)]',
  'h3-title': 'text-lg sm:text-xl font-700 font-[var(--mz-font-serif)]',
  'p-muted': 'text-[var(--mz-text-2)] leading-relaxed',
  'p-desc': 'text-[var(--mz-text-2)] leading-relaxed text-sm',

  // ===== 分区/卡片 =====
  'panel': 'bg-[var(--mz-bg-soft)] rounded-[var(--mz-radius)] border border-[var(--mz-border)] shadow-[var(--mz-shadow-sm)]',
  'card-paper': 'bg-[var(--mz-card)] rounded-[var(--mz-radius)] border border-[var(--mz-border)] shadow-[var(--mz-shadow)] transition-all duration-200',
  'card-paper-hover': 'hover:shadow-[var(--mz-shadow-hover)] hover:-translate-y-0.5 hover:border-[var(--mz-primary-soft)]',

  // ===== 印章式徽章（朱印红点睛） =====
  'stamp': 'inline-flex items-center justify-center px-3 py-1 text-xs font-800 tracking-wider uppercase rounded-[var(--mz-radius-sm)] bg-[var(--mz-seal-red)] text-white border-2 border-[var(--mz-seal-red)] shadow-sm',
  'stamp-outline': 'inline-flex items-center justify-center px-3 py-1 text-xs font-800 tracking-wider uppercase rounded-[var(--mz-radius-sm)] bg-transparent text-[var(--mz-seal-red)] border-2 border-[var(--mz-seal-red)]',
  'stamp-primary': 'inline-flex items-center justify-center px-3 py-1 text-xs font-800 tracking-wider uppercase rounded-[var(--mz-radius-sm)] bg-[var(--mz-primary)] text-white border-2 border-[var(--mz-primary)] shadow-sm',

  // ===== 票据式标签（slot 时间等） =====
  'ticket': 'inline-flex items-center gap-2 px-3 py-1.5 text-sm font-600 rounded-[var(--mz-radius-sm)] bg-[var(--mz-bg-soft)] border border-[var(--mz-border)] border-dashed font-mono tracking-tight',
  'ticket-accent': 'inline-flex items-center gap-2 px-3 py-1.5 text-sm font-600 rounded-[var(--mz-radius-sm)] bg-[var(--mz-card)] border-2 border-[var(--mz-primary)] font-mono tracking-tight text-[var(--mz-primary)]',

  // ===== 小胶囊标签 =====
  'pill': 'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm border border-[var(--mz-border)] bg-[var(--mz-bg-soft)] transition-colors duration-150',
  'pill-primary': 'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm bg-[var(--mz-primary)] text-white',
  'pill-sm': 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs border border-[var(--mz-border)] bg-[var(--mz-bg-soft)]',

  // ===== 展牌标题（带装饰线） =====
  'section-title': 'flex items-center gap-3 text-lg font-800 font-[var(--mz-font-serif)]',
  'section-title::before': 'content-[""] w-1.5 h-1.5 rounded-full bg-[var(--mz-primary)]',
  'section-title-line': 'flex items-center gap-3 text-lg font-800 font-[var(--mz-font-serif)] before:content-[""] before:w-8 before:h-0.5 before:bg-[var(--mz-primary-soft)] before:rounded-full',

  // ===== 行为按钮区（工具条） =====
  'toolbar': 'flex flex-wrap items-center gap-2',
  'toolbar-sm': 'flex flex-wrap items-center gap-1.5',

  // ===== 封面容器 =====
  'cover-16-9': 'w-full aspect-[16/9] rounded-[var(--mz-radius-sm)] overflow-hidden bg-[var(--mz-bg-soft)] border border-[var(--mz-border)]',
  'cover-square': 'w-full aspect-square rounded-[var(--mz-radius-sm)] overflow-hidden bg-[var(--mz-bg-soft)] border border-[var(--mz-border)]',

  // ===== 名牌式作者卡片 =====
  'nameplate': 'flex items-center gap-3 p-3 rounded-[var(--mz-radius-sm)] bg-[var(--mz-card)] border border-[var(--mz-border)] shadow-[var(--mz-shadow-sm)]',

  // ===== 导航按钮 =====
  'nav-pill': 'inline-flex items-center gap-1.5 px-4 py-2 text-sm font-500 rounded-full transition-all duration-200 hover:bg-[var(--mz-bg-soft)] hover:text-[var(--mz-primary)]',
  'nav-pill-active': 'inline-flex items-center gap-1.5 px-4 py-2 text-sm font-600 rounded-full bg-[var(--mz-primary)] text-white',

  // ===== Hero 区域 =====
  'hero-section': 'relative overflow-hidden rounded-[var(--mz-radius-lg)] bg-[var(--mz-bg-soft)] border border-[var(--mz-border)] shadow-[var(--mz-shadow)]',
  'hero-stamp': 'absolute top-4 right-4 z-10',

  // ===== 接力导航按钮 =====
  'relay-nav-btn': 'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-500 border border-[var(--mz-border)] bg-[var(--mz-card)] hover:border-[var(--mz-primary)] hover:text-[var(--mz-primary)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed',
  'relay-nav-btn-primary': 'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-500 bg-[var(--mz-primary)] text-white hover:bg-[var(--mz-primary-hover)] transition-all duration-200',

  // ===== 文字效果 =====
  'text-hover-shift': 'hover:text-shadow-[1px_1px_0_var(--mz-primary),2px_2px_0_var(--mz-seal-red)] transition-all duration-300',
}
