// @ts-check
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serves the site under /<repo>/ until a custom domain is set;
// the deploy workflow passes the right base path.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://nzap-labs.github.io',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'ignore',
  vite: { plugins: [tailwindcss()] },
})
