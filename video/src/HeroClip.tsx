import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion'
import { AppWindow } from './components/AppWindow'
import { box, layoutFor } from './components/camera'
import { Stage } from './components/Stage'

const center = (b: { x: number; y: number; width: number; height: number }) => ({
  x: b.x + b.width / 2,
  y: b.y + b.height / 2,
})

/**
 * The homepage loop (5 s, silent, seamless): pick Kokoro, hear the result,
 * glide back to the gallery. Frame 149 flows straight into frame 0.
 */
export const HeroClip: React.FC = () => {
  const frame = useCurrentFrame()
  const { width, height } = useVideoConfig()
  const layout = layoutFor(width, height, 0.9)
  const card = center(box('apps', 'kokoro'))
  const play = center(box('result', 'play'))
  const wave = box('result', 'waveform')
  const rest = { x: 1180, y: 820 }
  const progress = interpolate(frame, [84, 116], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  return (
    <Stage>
      <AbsoluteFill>
        <AppWindow
          layout={layout}
          screens={[
            { at: 0, shot: 'apps' },
            { at: 52, shot: 'result' },
            { at: 126, shot: 'apps' },
          ]}
          camera={[
            { at: 14, focus: box('apps', 'kokoro'), fill: 0.55, duration: 24 },
            { at: 56, focus: box('result', 'player'), fill: 0.62, duration: 22 },
            { at: 112, focus: null, duration: 28 },
          ]}
          cursor={[
            { at: 0, x: rest.x, y: rest.y },
            { at: 10, x: card.x, y: card.y, duration: 24, click: true },
            { at: 60, x: play.x, y: play.y, duration: 16, click: true },
            { at: 112, x: rest.x, y: rest.y, duration: 30 },
          ]}
          overlay={
            frame > 80 && frame < 124 ? (
              <div
                style={{
                  position: 'absolute',
                  left: wave.x,
                  top: wave.y,
                  width: wave.width * progress,
                  height: wave.height,
                  background:
                    'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 100%)',
                  mixBlendMode: 'screen',
                  borderRadius: 6,
                  borderRight: '2px solid #fff',
                }}
              />
            ) : null
          }
        />
      </AbsoluteFill>
    </Stage>
  )
}
