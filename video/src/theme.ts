import { loadFont } from '@remotion/google-fonts/DMSans'

export const { fontFamily } = loadFont('normal', {
  weights: ['400', '500', '600'],
  subsets: ['latin'],
})

export const FPS = 30

export const color = {
  stage: '#050506',
  panel: '#0e0e10',
  ink: '#f1f1ef',
  graphite: '#9b9ca3',
  line: 'rgba(255,255,255,0.08)',
  mint: '#3fae78',
}

export const chromeText = {
  backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #d2d4da 48%, #8e9099 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
} as const

export const chromeFill = {
  backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #d9dade 52%, #a9abb3 100%)',
  boxShadow:
    'inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.18), 0 18px 40px -16px rgba(255,255,255,0.35)',
  color: '#050506',
} as const

/** The app screenshots are 1440×900 CSS pixels captured at 2×. */
export const SCREEN = { width: 1440, height: 900 }
