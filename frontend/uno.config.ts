// uno.config.ts
import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss'
import { unoShortcuts } from './src/styles/unoShortcuts'
export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons(),
  ],
  shortcuts: unoShortcuts
})
