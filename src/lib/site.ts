/** Links and facts the whole site shares. */

export const ORG = 'nzap-labs'
/** nzap-labs/nzap-engine is now public and officially released! */
export const ENGINE_PUBLIC = true
export const RELEASE_VERSION = 'v0.1.0'
export const SOURCE_NOTE = ENGINE_PUBLIC
  ? 'Open source · Apache-2.0'
  : 'Apache-2.0 · source opening soon'
export const ENGINE_REPO = 'nzap-labs/nzap-engine'
export const RELEASES_REPO = 'nzap-labs/nzap-engine-releases'
export const NOTEBOOKS_REPO = 'nzap-labs/nzap-notebooks'
export const WEBSITE_REPO = 'nzap-labs/nzap-website'

const RELEASE_DL = `https://github.com/${RELEASES_REPO}/releases/latest/download`

export const links = {
  site: 'https://nzap.in',
  github: `https://github.com/${ORG}`,
  engine: `https://github.com/${ENGINE_REPO}`,
  releases: `https://github.com/${RELEASES_REPO}/releases/latest`,
  releasesAll: `https://github.com/${RELEASES_REPO}/releases`,
  notebooks: `https://github.com/${NOTEBOOKS_REPO}`,
  appsGuide: `https://github.com/${NOTEBOOKS_REPO}/blob/main/APPS.md`,
  contributing: `https://github.com/${NOTEBOOKS_REPO}/blob/main/CONTRIBUTING.md`,
  mcpGuide: `https://github.com/${ENGINE_REPO}/blob/main/docs/MCP.md`,
  installGuide: `https://github.com/${ENGINE_REPO}/blob/main/docs/INSTALL.md`,
  issues: `https://github.com/${ENGINE_REPO}/issues`,
  notebookIssues: `https://github.com/${NOTEBOOKS_REPO}/issues`,
  catalog: `https://raw.githubusercontent.com/${NOTEBOOKS_REPO}/main/index.json`,
  installSh: 'https://nzap.in/install.sh',
  installPs1: 'https://nzap.in/install.ps1',
  installCmd: 'https://nzap.in/install.cmd',
  llmsTxt: 'https://nzap.in/llms.txt',
  installers: {
    windowsExe: `${RELEASE_DL}/NZAP.Engine_0.1.0_x64-setup.exe`,
    windowsMsi: `${RELEASE_DL}/NZAP.Engine_0.1.0_x64_en-US.msi`,
    macDmg: `${RELEASE_DL}/NZAP.Engine_0.1.0_universal.dmg`,
    linuxAppImage: `${RELEASE_DL}/NZAP.Engine_0.1.0_amd64.AppImage`,
    linuxDeb: `${RELEASE_DL}/NZAP.Engine_0.1.0_amd64.deb`,
    linuxRpm: `${RELEASE_DL}/NZAP.Engine-0.1.0-1.x86_64.rpm`,
  },
}

/** A relative path under the site so the same build works on both https://nzap.in/ and /nzap-website/. */
export function asset(path: string): string {
  const clean = path.replace(/^\//, '')
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return base ? `${base}/${clean}` : `./${clean}`
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

export interface OrgStats {
  totalStars: number
  repoStars: Record<string, number>
  contributorsCount: number
}

/** Fetch initial GitHub stars and contributors at build time as a static fallback. */
export async function loadOrgStats(): Promise<OrgStats> {
  const repos = [ENGINE_REPO, NOTEBOOKS_REPO, RELEASES_REPO, WEBSITE_REPO]
  const repoStars: Record<string, number> = {}
  let totalStars = 0
  try {
    const results = await Promise.all(
      repos.map(async (r) => {
        const res = await fetch(`https://api.github.com/repos/${r}`, {
          headers: { Accept: 'application/vnd.github+json' },
        })
        if (!res.ok) return { r, stars: 0 }
        const data = (await res.json()) as { stargazers_count?: number }
        return { r, stars: data.stargazers_count ?? 0 }
      }),
    )
    for (const item of results) {
      repoStars[item.r] = item.stars
      totalStars += item.stars
    }
  } catch {
    // Fallback to 0 if offline during build
  }
  return { totalStars, repoStars, contributorsCount: 1 }
}

export function about(seconds: number): string {
  if (seconds < 10) return `~${Math.max(1, Math.round(seconds))}s`
  if (seconds < 60) return `~${Math.round(seconds / 5) * 5}s`
  const minutes = Math.floor(seconds / 60)
  const rest = Math.round((seconds % 60) / 15) * 15
  return rest ? `~${minutes}m ${rest}s` : `~${minutes}m`
}
