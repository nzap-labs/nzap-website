import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { useSceneLength } from '../components/scene-length'
import { AppWindow } from '../components/AppWindow'
import { box, layoutFor } from '../components/camera'
import { Callout } from '../components/Overlays'
import { Stage } from '../components/Stage'

const center = (b: { x: number; y: number; width: number; height: number }) => ({
  x: b.x + b.width / 2,
  y: b.y + b.height / 2,
})

function useLayout() {
  const { width, height } = useVideoConfig()
  return layoutFor(width, height, 0.8)
}

function useEnter(delay = 0) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  return spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 110 } })
}

/** "Connect your Google account once. No servers, no sign-ups, and your token never leaves your keychain." */
export const Connect: React.FC = () => {
  const layout = useLayout()
  const d = useSceneLength()
  const button = center(box('connect', 'connect'))
  const clickAt = 40
  return (
    <Stage>
      <AppWindow
        layout={layout}
        enter={useEnter()}
        screens={[
          { at: 0, shot: 'connect' },
          { at: clickAt + 8, shot: 'connected' },
        ]}
        camera={[
          { at: 6, focus: box('connect', 'connect'), fill: 0.3, duration: 30 },
          { at: clickAt + 12, focus: box('connected', 'card'), fill: 0.82, duration: 30 },
        ]}
        cursor={[
          { at: 4, x: 980, y: 640 },
          { at: 12, x: button.x, y: button.y, duration: 24, click: true },
        ]}
      />
      <AbsoluteFill>
        <Callout at={Math.round(d * 0.4)} x={430} y={880} tone="light">No servers</Callout>
        <Callout at={Math.round(d * 0.5)} x={690} y={880}>No sign-ups</Callout>
        <Callout at={Math.round(d * 0.63)} x={970} y={880}>Token stays in your keychain</Callout>
      </AbsoluteFill>
    </Stage>
  )
}

/** "Pick an app, like Kokoro text to speech. NZAP shows you the GPU it needs, and how long it will take, before you press a thing." */
export const PickApp: React.FC = () => {
  const layout = useLayout()
  const d = useSceneLength()
  const card = box('apps', 'kokoro')
  const target = center(card)
  const clickAt = 58
  return (
    <Stage>
      <AppWindow
        layout={layout}
        screens={[
          { at: 0, shot: 'apps' },
          { at: clickAt + 6, shot: 'form' },
        ]}
        camera={[
          { at: 4, focus: box('apps', 'grid'), fill: 0.86, duration: 30 },
          { at: 36, focus: card, fill: 0.5, duration: 26 },
          { at: clickAt + 10, focus: box('form', 'chips'), fill: 0.9, duration: 32 },
          { at: Math.round(d * 0.72), focus: box('form', 'inputs'), fill: 0.78, duration: 40 },
        ]}
        cursor={[
          { at: 6, x: 1180, y: 820 },
          { at: 14, x: target.x, y: target.y, duration: 28, click: true },
        ]}
      />
      <AbsoluteFill>
        <Callout at={clickAt + 46} until={Math.round(d * 0.7)} x={560} y={900} tone="light" size={34}>
          Best on T4 · setup ~50s · each run ~2s
        </Callout>
      </AbsoluteFill>
    </Stage>
  )
}

/** "Hit generate. NZAP starts a T4, installs everything, and loads the model on Colab, not on your laptop." */
export const Generate: React.FC = () => {
  const layout = useLayout()
  const d = useSceneLength()
  const button = center(box('form-bottom', 'generate'))
  const clickAt = 26
  const step = Math.round((d - 70) / 3)
  return (
    <Stage>
      <AppWindow
        layout={layout}
        screens={[
          { at: 0, shot: 'form-bottom' },
          { at: clickAt + 30, shot: 'running' },
        ]}
        camera={[
          { at: 0, focus: box('form-bottom', 'generate'), fill: 0.32, duration: 28 },
          { at: clickAt + 34, focus: box('running', 'phases'), fill: 0.66, duration: 30 },
        ]}
        cursor={[
          { at: 2, x: 760, y: 600 },
          { at: 6, x: button.x, y: button.y, duration: 22, click: true },
        ]}
      />
      <AbsoluteFill>
        <Callout at={70} until={70 + step} x={560} y={900} tone="light">
          Starting a T4 on your Colab
        </Callout>
        <Callout at={70 + step + 8} until={70 + step * 2} x={560} y={900} tone="light">
          Installing Kokoro on the runtime
        </Callout>
        <Callout at={70 + step * 2 + 8} x={560} y={900} tone="light">
          Loading the model on Colab, not your laptop
        </Callout>
      </AbsoluteFill>
    </Stage>
  )
}

/** "Seconds later, you're listening to the result. And the next run is instant, because the model stays warm." */
export const Listen: React.FC = () => {
  const layout = useLayout()
  const frame = useCurrentFrame()
  const d = useSceneLength()
  const play = center(box('result', 'play'))
  const wave = box('result', 'waveform')
  const playAt = 34
  const warmAt = Math.round(d * 0.55)
  const progress = interpolate(frame, [playAt + 4, warmAt - 6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const showPlayhead = frame > playAt && frame < warmAt + 4
  return (
    <Stage>
      <AppWindow
        layout={layout}
        screens={[
          { at: 0, shot: 'result' },
          { at: warmAt, shot: 'warm' },
          { at: warmAt + 40, shot: 'warm-done' },
        ]}
        camera={[
          { at: 0, focus: box('result', 'player'), fill: 0.62, duration: 26 },
          { at: warmAt + 2, focus: box('warm', 'warm'), fill: 0.42, duration: 28 },
          { at: warmAt + 52, focus: box('warm-done', 'results'), fill: 0.85, duration: 30 },
        ]}
        cursor={[
          { at: 6, x: 1180, y: 760 },
          { at: 10, x: play.x, y: play.y, duration: 20, click: true },
        ]}
        overlay={
          showPlayhead ? (
            <>
              <div
                style={{
                  position: 'absolute',
                  left: wave.x,
                  top: wave.y,
                  width: wave.width * progress,
                  height: wave.height,
                  background:
                    'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.28) 100%)',
                  mixBlendMode: 'screen',
                  borderRadius: 6,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: wave.x + wave.width * progress,
                  top: wave.y - 4,
                  width: 2,
                  height: wave.height + 8,
                  backgroundColor: '#ffffff',
                  boxShadow: '0 0 12px rgba(255,255,255,0.9)',
                }}
              />
            </>
          ) : null
        }
      />
      <AbsoluteFill>
        <Callout at={warmAt + 18} x={560} y={900} tone="light" size={34}>
          Next run: instant. The model stays warm.
        </Callout>
      </AbsoluteFill>
    </Stage>
  )
}
