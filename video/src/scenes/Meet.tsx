import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { useSceneLength } from '../components/scene-length'
import { LogoLockup } from '../components/LogoLockup'
import { Stage } from '../components/Stage'
import { color } from '../theme'

/** "Meet NZAP Engine. Your own Google Colab runtimes, in a native app." */
export const Meet: React.FC = () => {
  const frame = useCurrentFrame()
  const durationInFrames = useSceneLength()
  const line = interpolate(frame, [durationInFrames * 0.38, durationInFrames * 0.38 + 16], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  return (
    <Stage light={1.4}>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: 56 }}>
        <LogoLockup at={2} size={250} />
        <p
          style={{
            margin: 0,
            fontSize: 44,
            color: color.graphite,
            opacity: line,
            translate: `0 ${(1 - line) * 16}px`,
          }}
        >
          Your own Google Colab runtimes, <span style={{ color: color.ink }}>in a native app.</span>
        </p>
      </AbsoluteFill>
    </Stage>
  )
}
