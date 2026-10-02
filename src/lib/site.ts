/** Links and facts the whole site shares. */

export const ORG = 'nzap-labs'
/** Flip when nzap-labs/nzap-engine goes public: copy and links follow. */
export const ENGINE_PUBLIC = false
export const SOURCE_NOTE = ENGINE_PUBLIC
  ? 'Open source · Apache-2.0'
  : 'Apache-2.0 · source opening soon'
export const ENGINE_REPO = 'nzap-labs/nzap-engine'
export const RELEASES_REPO = 'nzap-labs/nzap-engine-releases'
export const NOTEBOOKS_REPO = 'nzap-labs/nzap-notebooks'

export const links = {
  github: `https://github.com/${ORG}`,
  engine: `https://github.com/${ENGINE_REPO}`,
  releases: `https://github.com/${RELEASES_REPO}/releases/latest`,
  notebooks: `https://github.com/${NOTEBOOKS_REPO}`,
  appsGuide: `https://github.com/${NOTEBOOKS_REPO}/blob/main/APPS.md`,
  contributing: `https://github.com/${NOTEBOOKS_REPO}/blob/main/CONTRIBUTING.md`,
  issues: `https://github.com/${NOTEBOOKS_REPO}/issues`,
  catalog: `https://raw.githubusercontent.com/${NOTEBOOKS_REPO}/main/index.json`,
}

/** A path under the site's base (GitHub Pages serves it under /<repo>/). */
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return `${base}/${path.replace(/^\//, '')}`
}

export interface CatalogApp {
  slug: string
  title: string
  description: string
  tags: string[]
  author: string | null
  app?: {
    category: string
    icon?: string
    tagline?: string
    runtime: { accelerator: string; supported?: string[]; minVramGb?: number }
    estimates: { setup: number; run: number; measuredOn?: string; runNote?: string }
    license?: string
    links?: { label: string; url: string }[]
  }
}

/** The live collection, read at build time (the page refreshes it in the browser). */
export async function loadCatalog(): Promise<CatalogApp[]> {
  try {
    const response = await fetch(links.catalog)
    if (!response.ok) return []
    const index = (await response.json()) as { notebooks: CatalogApp[] }
    return index.notebooks
  } catch {
    return []
  }
}

export function about(seconds: number): string {
  if (seconds < 10) return `~${Math.max(1, Math.round(seconds))}s`
  if (seconds < 60) return `~${Math.round(seconds / 5) * 5}s`
  const minutes = Math.floor(seconds / 60)
  const rest = Math.round((seconds % 60) / 15) * 15
  return rest ? `~${minutes}m ${rest}s` : `~${minutes}m`
}
