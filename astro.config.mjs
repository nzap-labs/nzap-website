// @ts-check
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'

// Custom domain nzap.in serves at root /; override via SITE_URL / BASE_PATH if needed.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://nzap.in',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'ignore',
  vite: { plugins: [tailwindcss()] },
})
