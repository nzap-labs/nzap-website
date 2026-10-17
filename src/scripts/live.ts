/**
 * Live data from GitHub, filled into the static page: stars across all
 * nzap-labs repositories, contributors, OS-aware download links, and
 * interactive UI controls (CLI tabs, copy buttons, custom audio players,
 * mobile navigation, and video chapter scrubbing).
 */

const API = 'https://api.github.com'
const ORG = 'nzap-labs'
const REPOS = [
  'nzap-labs/nzap-engine',
  'nzap-labs/nzap-notebooks',
  'nzap-labs/nzap-engine-releases',
  'nzap-labs/nzap-website',
]
const RELEASES = 'nzap-labs/nzap-engine-releases'
const CACHE_MS = 15 * 60 * 1000

async function cached<T>(url: string): Promise<T | null> {
  const key = `nzap:v2:${url}`
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

interface RepoInfo {
  full_name: string
  stargazers_count: number
}

async function stars() {
  // Fetch org repos in one call first, with per-repo fallback
  const orgRepos = await cached<RepoInfo[]>(`${API}/orgs/${ORG}/repos?per_page=30`)
  const starMap = new Map<string, number>()

  if (orgRepos && Array.isArray(orgRepos)) {
    for (const r of orgRepos) {
      starMap.set(r.full_name, r.stargazers_count ?? 0)
    }
  } else {
    const individual = await Promise.all(
      REPOS.map((repo) => cached<RepoInfo>(`${API}/repos/${repo}`)),
    )
    individual.forEach((repo, index) => {
      if (repo) starMap.set(REPOS[index], repo.stargazers_count ?? 0)
    })
  }

  if (starMap.size === 0) return

  let total = 0
  for (const count of starMap.values()) {
    total += count
  }

  for (const [repoName, count] of starMap.entries()) {
    document.querySelectorAll(`[data-stars="${repoName}"]`).forEach((element) => {
      element.textContent = `★ ${format(count)}`
    })
  }

  document.querySelectorAll('[data-stars-total]').forEach((element) => {
    if (element.closest('dl')) {
      element.textContent = format(total)
    } else if (element.hasAttribute('data-nav-stars')) {
      element.textContent = `★ ${format(total)}`
    } else {
      element.textContent = `★ ${format(total)}`
    }
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
  if (people.size > 0) {
    document
      .querySelectorAll('[data-contributors-count]')
      .forEach((element) => (element.textContent = String(people.size)))
  }
  const holder = document.querySelector('[data-contributors]')
  if (!holder || people.size === 0) return
  holder.innerHTML = ''
  for (const person of [...people.values()].slice(0, 14)) {
    const link = document.createElement('a')
    link.href = person.html_url
    link.title = person.login
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.className =
      'block size-10 overflow-hidden rounded-full ring-2 ring-panel transition-transform hover:scale-105'
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

type Platform = 'windows' | 'mac' | 'linux' | 'ios'

function detectPlatform(): Platform | null {
  const agent = navigator.userAgent.toLowerCase()
  if (/iphone|ipad|ipod/.test(agent) || (agent.includes('mac') && navigator.maxTouchPoints > 1)) {
    return 'ios'
  }
  if (agent.includes('windows')) return 'windows'
  if (agent.includes('mac os') || agent.includes('macintosh')) return 'mac'
  if (agent.includes('linux') && !agent.includes('android')) return 'linux'
  return null
}

const NAMES: Record<'windows' | 'mac' | 'linux', string> = {
  windows: 'Windows',
  mac: 'macOS',
  linux: 'Linux',
}

function pick(assets: { name: string; browser_download_url: string }[], target: string) {
  const find = (test: (name: string) => boolean) =>
    assets.find((asset) => test(asset.name.toLowerCase()))?.browser_download_url
  if (target === 'windows')
    return find((n) => n.endsWith('-setup.exe')) ?? find((n) => n.endsWith('.msi'))
  if (target === 'windows-msi') return find((n) => n.endsWith('.msi'))
  if (target === 'mac') return find((n) => n.endsWith('.dmg'))
  if (target === 'linux-deb') return find((n) => n.endsWith('.deb'))
  if (target === 'linux-rpm') return find((n) => n.endsWith('.rpm'))
  return find((n) => n.endsWith('.appimage')) ?? find((n) => n.endsWith('.deb'))
}

interface ReleasePayload {
  tag_name: string
  html_url: string
  published_at?: string
  assets: { name: string; browser_download_url: string }[]
}

async function downloads() {
  let release = await cached<ReleasePayload>(`${API}/repos/${RELEASES}/releases/latest`)
  if (!release) {
    const all = await cached<ReleasePayload[]>(`${API}/repos/${RELEASES}/releases?per_page=5`)
    release = all?.[0] ?? null
  }
  const note = document.querySelector('[data-release-version]')
  const mine = detectPlatform()

  if (release && release.assets?.length > 0) {
    if (note) {
      note.textContent = `Official Release ${release.tag_name} · Signed builds for Windows, macOS & Linux`
    }
    document.querySelectorAll<HTMLAnchorElement>('[data-asset]').forEach((link) => {
      const target = link.dataset.asset ?? ''
      const url = pick(release!.assets, target)
      if (url) link.href = url
    })
    if (mine && mine !== 'ios') {
      const url = pick(release.assets, mine)
      if (url) {
        document
          .querySelectorAll<HTMLAnchorElement>('[data-download]')
          .forEach((link) => (link.href = url))
      }
      document
        .querySelectorAll('[data-download-text]')
        .forEach((element) => (element.textContent = `Download for ${NAMES[mine]}`))
    }
  } else if (mine && mine !== 'ios') {
    document
      .querySelectorAll('[data-download-text]')
      .forEach((element) => (element.textContent = `Download for ${NAMES[mine]}`))
  }

  // Update Hero quick-install CLI command & select matching tab in #install
  const heroCmd = document.querySelector<HTMLElement>('[data-hero-cli-cmd]')
  const heroCopyBtn = document.querySelector<HTMLButtonElement>('[data-hero-cli-copy]')
  if (mine === 'windows') {
    const psCmd = 'irm https://nzap.in/install.ps1 | iex'
    if (heroCmd) heroCmd.textContent = psCmd
    if (heroCopyBtn) heroCopyBtn.dataset.copy = psCmd
    activateCliTab('powershell')
  } else if (mine === 'ios') {
    activateCliTab('ios')
  }
}

function activateCliTab(tabId: string) {
  const tabs = document.querySelectorAll<HTMLButtonElement>('[data-cli-tab]')
  const panels = document.querySelectorAll<HTMLElement>('[data-cli-panel]')
  if (!tabs.length) return
  tabs.forEach((btn) => {
    const active = btn.dataset.cliTab === tabId
    btn.setAttribute('aria-selected', active ? 'true' : 'false')
    btn.classList.toggle('bg-panel', active)
    btn.classList.toggle('dark:bg-white/12', active)
    btn.classList.toggle('text-ink', active)
    btn.classList.toggle('shadow-sm', active)
    btn.classList.toggle('text-graphite', !active)
  })
  panels.forEach((panel) => {
    panel.classList.toggle('hidden', panel.dataset.cliPanel !== tabId)
  })
}

function setupInteractiveUI() {
  // 0. Theme toggle (Light / Dark mode matching nzap-engine)
  const updateThemeToggleLabels = () => {
    const isDark = document.documentElement.classList.contains('dark')
    document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((btn) => {
      btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode')
    })
  }
  updateThemeToggleLabels()

  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const root = document.documentElement
      const next = root.classList.contains('dark') ? 'light' : 'dark'
      try {
        localStorage.setItem('nzap.theme', next)
      } catch {
        // Ignore private-mode storage restrictions
      }
      root.classList.add('theming')
      window.setTimeout(() => root.classList.remove('theming'), 400)
      root.classList.toggle('dark', next === 'dark')
      root.style.colorScheme = next
      const meta = document.querySelector('[data-theme-meta]')
      if (meta) meta.setAttribute('content', next === 'dark' ? '#060607' : '#f6f6f3')
      const fav = document.querySelector('[data-theme-favicon]')
      if (fav) {
        const href = fav.getAttribute(next === 'dark' ? 'data-favicon-dark' : 'data-favicon-light')
        if (href) fav.setAttribute('href', href)
      }
      updateThemeToggleLabels()
    })
  })

  // 1. CLI Tabs
  document.querySelectorAll<HTMLButtonElement>('[data-cli-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.cliTab) activateCliTab(btn.dataset.cliTab)
    })
  })

  // 2. Copy to clipboard buttons
  document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy
      if (!text) return
      try {
        await navigator.clipboard.writeText(text)
        const label = btn.querySelector('[data-copy-label]')
        const original = label?.textContent ?? 'Copy'
        if (label) label.textContent = 'Copied!'
        btn.classList.add('ring-1', 'ring-mint/60')
        setTimeout(() => {
          if (label) label.textContent = original
          btn.classList.remove('ring-1', 'ring-mint/60')
        }, 1800)
      } catch {
        // Fallback
      }
    })
  })

  // 3. Mobile navigation drawer
  const menuBtn = document.querySelector<HTMLButtonElement>('[data-mobile-menu-btn]')
  const menuPanel = document.querySelector<HTMLElement>('[data-mobile-menu]')
  if (menuBtn && menuPanel) {
    menuBtn.addEventListener('click', () => {
      const expanded = menuBtn.getAttribute('aria-expanded') === 'true'
      menuBtn.setAttribute('aria-expanded', expanded ? 'false' : 'true')
      menuPanel.classList.toggle('hidden', expanded)
    })
    menuPanel.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menuBtn.setAttribute('aria-expanded', 'false')
        menuPanel.classList.add('hidden')
      })
    })
  }

  // 4. Custom dark-mode audio sample players
  document.querySelectorAll<HTMLElement>('[data-audio-player]').forEach((container) => {
    const audio = container.querySelector<HTMLAudioElement>('audio')
    const playBtn = container.querySelector<HTMLButtonElement>('[data-audio-toggle]')
    const playIcon = container.querySelector<HTMLElement>('[data-icon-play]')
    const pauseIcon = container.querySelector<HTMLElement>('[data-icon-pause]')
    const progress = container.querySelector<HTMLElement>('[data-audio-progress]')
    const seek = container.querySelector<HTMLElement>('[data-audio-seek]')
    const timeLabel = container.querySelector<HTMLElement>('[data-audio-time]')
    if (!audio || !playBtn) return

    const fmtTime = (sec: number) => {
      if (!Number.isFinite(sec) || sec < 0) return '0:00'
      const m = Math.floor(sec / 60)
      const s = String(Math.floor(sec % 60)).padStart(2, '0')
      return `${m}:${s}`
    }

    const syncUI = () => {
      const playing = !audio.paused && !audio.ended
      playIcon?.classList.toggle('hidden', playing)
      pauseIcon?.classList.toggle('hidden', !playing)
      const dur = audio.duration || 0
      const cur = audio.currentTime || 0
      const pct = dur > 0 ? Math.min(100, (cur / dur) * 100) : 0
      if (progress) progress.style.width = `${pct}%`
      if (timeLabel) {
        timeLabel.textContent = dur > 0 ? `${fmtTime(cur)} / ${fmtTime(dur)}` : '0:00'
      }
    }

    playBtn.addEventListener('click', () => {
      // Pause any other playing sample
      document.querySelectorAll<HTMLAudioElement>('audio').forEach((other) => {
        if (other !== audio && !other.paused) other.pause()
      })
      if (audio.paused) {
        void audio.play()
      } else {
        audio.pause()
      }
    })

    audio.addEventListener('play', syncUI)
    audio.addEventListener('pause', syncUI)
    audio.addEventListener('ended', () => {
      audio.currentTime = 0
      syncUI()
    })
    audio.addEventListener('timeupdate', syncUI)
    audio.addEventListener('loadedmetadata', syncUI)

    seek?.addEventListener('click', (e) => {
      const rect = seek.getBoundingClientRect()
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      if (audio.duration) {
        audio.currentTime = ratio * audio.duration
        syncUI()
      }
    })
  })

  // 5. Film chapter scrubbing buttons
  const filmVideo = document.querySelector<HTMLVideoElement>('#intro-film-video')
  if (filmVideo) {
    document.querySelectorAll<HTMLButtonElement>('[data-film-seek]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sec = parseFloat(btn.dataset.filmSeek ?? '0')
        filmVideo.currentTime = sec
        void filmVideo.play()
      })
    })
  }
}

setupInteractiveUI()
void stars()
void contributors()
void downloads()
