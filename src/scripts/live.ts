/**
 * Live data from GitHub, filled into the static page: stars, contributors
 * and the latest release's installers for the visitor's OS. Everything
 * degrades to the static links when GitHub is unreachable or rate-limited.
 */

const API = 'https://api.github.com'
const REPOS = ['nzap-labs/nzap-notebooks', 'nzap-labs/nzap-engine']
const RELEASES = 'nzap-labs/nzap-engine-releases'
const CACHE_MS = 60 * 60 * 1000

async function cached<T>(url: string): Promise<T | null> {
  const key = `nzap:${url}`
  try {
    const hit = JSON.parse(sessionStorage.getItem(key) ?? 'null') as { at: number; data: T } | null
    if (hit && Date.now() - hit.at < CACHE_MS) return hit.data
  } catch {
    // Storage may be unavailable; fetch instead.
  }
  try {
    const response = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } })
    if (!response.ok) return null
    const data = (await response.json()) as T
    try {
      sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), data }))
    } catch {
      // Not fatal.
    }
    return data
  } catch {
    return null
  }
}

const format = (value: number) =>
  value >= 1000 ? `${(value / 1000).toFixed(value >= 10_000 ? 0 : 1)}k` : String(value)

async function stars() {
  const repos = await Promise.all(
    REPOS.map((repo) => cached<{ stargazers_count: number }>(`${API}/repos/${repo}`)),
  )
  let total = 0
  repos.forEach((repo, index) => {
    if (!repo) return
    total += repo.stargazers_count
    document.querySelectorAll(`[data-stars="${REPOS[index]}"]`).forEach((element) => {
      element.textContent = repo.stargazers_count > 0 ? `★ ${format(repo.stargazers_count)}` : '★'
    })
  })
  if (repos.some(Boolean))
    document.querySelectorAll('[data-stars-total]').forEach((element) => {
      if (element.closest('dl')) element.textContent = format(total)
      else element.textContent = total > 0 ? `★ ${format(total)}` : 'Star'
    })
}

interface Contributor {
  login: string
  avatar_url: string
  html_url: string
  type: string
}

async function contributors() {
  const lists = await Promise.all(
    REPOS.map((repo) => cached<Contributor[]>(`${API}/repos/${repo}/contributors?per_page=30`)),
  )
  const people = new Map<string, Contributor>()
  for (const list of lists)
    for (const person of list ?? []) if (person.type !== 'Bot') people.set(person.login, person)
  document
    .querySelectorAll('[data-contributors-count]')
    .forEach((element) => (element.textContent = people.size ? String(people.size) : '—'))
  const holder = document.querySelector('[data-contributors]')
  if (!holder) return
  for (const person of [...people.values()].slice(0, 14)) {
    const link = document.createElement('a')
    link.href = person.html_url
    link.title = person.login
    link.className = 'block size-10 overflow-hidden rounded-full ring-2 ring-[#0e0e10]'
    const image = document.createElement('img')
    image.src = `${person.avatar_url}&s=80`
    image.alt = person.login
    image.width = 40
    image.height = 40
    image.loading = 'lazy'
    link.append(image)
    holder.append(link)
  }
}

type Platform = 'windows' | 'mac' | 'linux'

function platform(): Platform | null {
  const agent = navigator.userAgent.toLowerCase()
  if (agent.includes('windows')) return 'windows'
  if (agent.includes('mac os') || agent.includes('macintosh')) return 'mac'
  if (agent.includes('linux') && !agent.includes('android')) return 'linux'
  return null
}

const NAMES: Record<Platform, string> = { windows: 'Windows', mac: 'macOS', linux: 'Linux' }

function pick(assets: { name: string; browser_download_url: string }[], target: Platform) {
  const find = (test: (name: string) => boolean) =>
    assets.find((asset) => test(asset.name.toLowerCase()))?.browser_download_url
  if (target === 'windows')
    return find((n) => n.endsWith('-setup.exe')) ?? find((n) => n.endsWith('.msi'))
  if (target === 'mac') return find((n) => n.endsWith('.dmg'))
  return find((n) => n.endsWith('.appimage')) ?? find((n) => n.endsWith('.deb'))
}

async function downloads() {
  const release = await cached<{
    tag_name: string
    html_url: string
    assets: { name: string; browser_download_url: string }[]
  }>(`${API}/repos/${RELEASES}/releases/latest`)
  const note = document.querySelector('[data-release-version]')
  if (!release) {
    if (note)
      note.textContent =
        'The first public build is on its way. Star the project to hear when it lands.'
    document.querySelectorAll<HTMLAnchorElement>('[data-asset]').forEach((link) => {
      link.href = 'https://github.com/nzap-labs/nzap-notebooks'
      const label = link.querySelector('[data-asset-label]')
      if (label) label.textContent = 'Coming soon · star on GitHub →'
    })
    return
  }
  if (note) note.textContent = `Latest: ${release.tag_name}`
  document.querySelectorAll<HTMLAnchorElement>('[data-asset]').forEach((link) => {
    const url = pick(release.assets, link.dataset.asset as Platform)
    link.href = url ?? release.html_url
  })
  const mine = platform()
  if (!mine) return
  const url = pick(release.assets, mine)
  if (!url) return
  document
    .querySelectorAll<HTMLAnchorElement>('[data-download]')
    .forEach((link) => (link.href = url))
  document
    .querySelectorAll('[data-download-text]')
    .forEach((element) => (element.textContent = `Download for ${NAMES[mine]}`))
}

void stars()
void contributors()
void downloads()
