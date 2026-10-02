import type { ReactNode } from 'react'
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion'
import { color, fontFamily } from '../theme'

/**
 * The dark stage every scene sits on: a soft studio light (like behind the
 * NZAP logo), a slow light sweep, a fine grid and a vignette.
 */
export const Stage: React.FC<{ children?: ReactNode; light?: number }> = ({
  children,
  light = 1,
}) => {
  const frame = useCurrentFrame()
  const { width, height, durationInFrames } = useVideoConfig()
  const drift = interpolate(frame, [0, Math.max(1, durationInFrames)], [-8, 8])
  return (
    <AbsoluteFill style={{ backgroundColor: color.stage, fontFamily, color: color.ink }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(55% 60% at ${50 + drift}% 38%, rgba(150,152,165,${0.3 * light}), transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: `${width / 30}px ${width / 30}px`,
          maskImage: 'radial-gradient(ellipse at 50% 30%, black 15%, transparent 65%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 30%, black 15%, transparent 65%)',
        }}
      />
      <AbsoluteFill>{children}</AbsoluteFill>
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background: `radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(0,0,0,0.65) 100%)`,
          width,
          height,
        }}
      />
    </AbsoluteFill>
  )
}
