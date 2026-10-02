import type { ReactNode } from 'react'
import { Audio } from '@remotion/media'
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'
import { SceneLength } from './components/scene-length'
import { Build, More, Outro } from './scenes/ClosingScenes'
import { Hook } from './scenes/Hook'
import { Meet } from './scenes/Meet'
import { Connect, Generate, Listen, PickApp } from './scenes/ProductScenes'
import { AUDIO_RATE, scenes } from './timeline'
import { color } from './theme'

export const SCENE_COMPONENTS = [Hook, Meet, Connect, PickApp, Generate, Listen, More, Build, Outro]
export const SCENE_NAMES = [
  'Hook',
  'Meet',
  'Connect',
  'PickApp',
  'Generate',
  'Listen',
  'More',
  'Build',
  'Outro',
]

/** Frames each scene overlaps the one before it (a cross-fade). */
const OVERLAP = 9

const FadeIn: React.FC<{ children: ReactNode; enabled: boolean }> = ({ children, enabled }) => {
  const frame = useCurrentFrame()
  if (!enabled) return <>{children}</>
  const p = interpolate(frame, [0, OVERLAP], [0, 1], { extrapolateRight: 'clamp' })
  return (
    <AbsoluteFill style={{ opacity: p, scale: interpolate(p, [0, 1], [1.025, 1]) }}>
      {children}
    </AbsoluteFill>
  )
}

/**
 * The intro film: nine scenes, one per line of narration. The narration
 * was generated with Breeze TTS 2 on a Colab T4, through NZAP's own app.
 */
export const IntroFilm: React.FC = () => {
  const { fps } = useVideoConfig()
  return (
    <AbsoluteFill style={{ backgroundColor: color.stage }}>
      {scenes.map((timing, index) => {
        const Scene = SCENE_COMPONENTS[index]
        const lead = index === 0 ? 0 : OVERLAP
        const length = timing.durationInFrames + lead
        return (
          <Sequence
            key={SCENE_NAMES[index]}
            name={SCENE_NAMES[index]}
            from={timing.from - lead}
            durationInFrames={length}
            premountFor={fps}
          >
            <SceneLength.Provider value={length}>
              <FadeIn enabled={index > 0}>
                <Scene />
              </FadeIn>
            </SceneLength.Provider>
          </Sequence>
        )
      })}
      {scenes.map((timing, index) => (
        <Sequence
          key={`line-${index}`}
          name={`Line ${index + 1}`}
          from={timing.from + timing.audioOffset}
          durationInFrames={Math.ceil((timing.trimAfter - timing.trimBefore) / AUDIO_RATE) + 2}
          premountFor={fps}
        >
          <Audio
            src={staticFile('audio/narration-breeze.wav')}
            trimBefore={timing.trimBefore}
            trimAfter={timing.trimAfter}
            playbackRate={AUDIO_RATE}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  )
}
