// src/styles/naiveTheme.ts
import type { GlobalThemeOverrides } from 'naive-ui'

export const naiveThemeOverrides: GlobalThemeOverrides = {
  common: {
    // 主题主色
    primaryColor: '#85615a',
    primaryColorHover: '#99706a',
    primaryColorPressed: '#6d483f',
    primaryColorSuppl: '#85615a',

    // 信息色（使用主棕）
    infoColor: '#85615a',
    infoColorHover: '#99706a',
    infoColorPressed: '#6d483f',

    // 成功色（使用偏绿棕）
    successColor: '#6b8e6b',
    successColorHover: '#7da07d',
    successColorPressed: '#5a7a5a',

    // 警告色（使用金色）
    warningColor: '#d2a85a',
    warningColorHover: '#dbb86a',
    warningColorPressed: '#c2984a',

    // 错误色（使用朱印红）
    errorColor: '#c2412d',
    errorColorHover: '#d4513d',
    errorColorPressed: '#a83525',

    // 背景/文字/边框
    bodyColor: '#efe3df',
    cardColor: '#fffaf8',
    modalColor: '#fffaf8',
    popoverColor: '#fffaf8',

    textColorBase: '#2a2222',
    textColor1: '#2a2222',
    textColor2: '#5a4b49',
    textColor3: '#8b7a77',

    borderColor: '#e7d7d2',
    dividerColor: '#e7d7d2',

    // 圆角（使用固定值，避免 var() 解析问题）
    borderRadius: '14px',
    borderRadiusSmall: '10px',

    // 字体
    fontFamily:
      '"Noto Sans SC", "Source Han Sans SC", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "PingFang SC", "Microsoft YaHei", sans-serif',
    fontFamilyMono:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',

    // 阴影
    boxShadow1: '0 4px 12px rgba(76, 45, 36, 0.08)',
    boxShadow2: '0 10px 30px rgba(76, 45, 36, 0.12)',
    boxShadow3: '0 14px 40px rgba(76, 45, 36, 0.18)',
  },

  Button: {
    borderRadiusMedium: '10px',
    borderRadiusSmall: '8px',
    borderRadiusLarge: '14px',
    textColor: '#2a2222',
    textColorHover: '#2a2222',
    textColorPressed: '#2a2222',
    // Primary 按钮
    colorPrimary: '#85615a',
    colorHoverPrimary: '#99706a',
    colorPressedPrimary: '#6d483f',
    textColorPrimary: '#fffaf8',
    textColorHoverPrimary: '#fffaf8',
    textColorPressedPrimary: '#fffaf8',
    // Default 按钮
    color: '#fffaf8',
    colorHover: '#fffaf8',
    colorPressed: '#f5ebe6',
    border: '1px solid #e7d7d2',
    borderHover: '1px solid #c7a8a0',
    borderPressed: '1px solid #85615a',
  },

  Card: {
    borderRadius: '14px',
    color: '#fffaf8',
    borderColor: '#e7d7d2',
    boxShadow: '0 10px 30px rgba(76, 45, 36, 0.12)',
  },

  Input: {
    borderRadius: '10px',
    color: '#fffaf8',
    colorFocus: '#fffaf8',
    borderColor: '#e7d7d2',
    borderColorHover: '#c7a8a0',
    borderColorFocus: '#85615a',
    boxShadowFocus: '0 0 0 2px rgba(133, 97, 90, 0.2)',
  },

  Tag: {
    borderRadius: '999px',
    color: '#e7d7d2',
    textColor: '#2a2222',
    // Primary tag
    colorPrimary: '#85615a',
    textColorPrimary: '#fffaf8',
    // Info tag
    colorInfo: '#c7a8a0',
    textColorInfo: '#2a2222',
  },

  Tabs: {
    tabBorderRadius: '999px',
    tabTextColorLine: '#5a4b49',
    tabTextColorActiveLine: '#85615a',
    tabTextColorHoverLine: '#85615a',
    barColor: '#85615a',
  },

  DataTable: {
    borderRadius: '14px',
    thColor: '#e7d7d2',
    tdColor: '#fffaf8',
    thTextColor: '#2a2222',
    tdTextColor: '#2a2222',
    borderColor: '#e7d7d2',
  },

  Select: {
    borderRadius: '10px',
    peers: {
      InternalSelection: {
        borderRadius: '10px',
        color: '#fffaf8',
        colorActive: '#fffaf8',
        border: '1px solid #e7d7d2',
        borderHover: '1px solid #c7a8a0',
        borderActive: '1px solid #85615a',
        borderFocus: '1px solid #85615a',
        boxShadowFocus: '0 0 0 2px rgba(133, 97, 90, 0.2)',
      },
    },
  },

  Divider: {
    color: '#e7d7d2',
  },

  Alert: {
    borderRadius: '14px',
    titleFontSize: '14px',
    contentFontSize: '14px',
  },

  Carousel: {
    borderRadius: '14px',
  },

  Avatar: {
    borderRadius: '999px',
  },

  Skeleton: {
    color: '#e7d7d2',
    colorEnd: '#efe3df',
  },
}
