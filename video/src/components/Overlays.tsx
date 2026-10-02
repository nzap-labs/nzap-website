import type { ReactNode } from 'react'
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { chromeText, color } from '../theme'

/** A label chip that springs in near something on screen. */
export const Callout: React.FC<{
  at: number
  until?: number
  x: number
  y: number
  children: ReactNode
  tone?: 'light' | 'dark'
  size?: number
}> = ({ at, until, x, y, children, tone = 'dark', size = 30 }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  if (frame < at) return null
  const enter = spring({ frame: frame - at, fps, config: { damping: 18, stiffness: 180 } })
  const exit =
    until === undefined
      ? 1
      : interpolate(frame, [until, until + 10], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
  const light = tone === 'light'
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity: Math.min(enter, exit),
        scale: interpolate(enter, [0, 1], [0.86, 1]),
        translate: `0 ${interpolate(enter, [0, 1], [16, 0])}px`,
        padding: `${size * 0.42}px ${size * 0.8}px`,
        borderRadius: 999,
        fontSize: size,
        fontWeight: 500,
        whiteSpace: 'nowrap',
        color: light ? '#050506' : color.ink,
        backgroundImage: light
          ? 'linear-gradient(180deg, #ffffff 0%, #d9dade 52%, #a9abb3 100%)'
          : undefined,
        backgroundColor: light ? undefined : 'rgba(18,18,21,0.82)',
        boxShadow: light
          ? '0 20px 50px -18px rgba(255,255,255,0.4), inset 0 1px 0 rgba(255,255,255,0.9)'
          : '0 0 0 1px rgba(255,255,255,0.12), 0 24px 60px -20px rgba(0,0,0,0.9)',
        backdropFilter: 'blur(14px)',
      }}
    >
      {children}
    </div>
  )
}

/** Big chrome headline words that rise in one after another. */
export const KineticTitle: React.FC<{
  text: string
  at?: number
  size?: number
  stagger?: number
  align?: 'center' | 'left'
  style?: React.CSSProperties
}> = ({ text, at = 0, size = 96, stagger = 3, align = 'center', style }) => {
  const frame = useCurrentFrame()
  const ease = Easing.bezier(0.16, 1, 0.3, 1)
  return (
    <div
      style={{
        fontSize: size,
        fontWeight: 500,
        letterSpacing: '-0.035em',
        lineHeight: 1.05,
        textAlign: align,
        ...style,
      }}
    >
      {text.split(' ').map((word, index) => {
        const p = ease(
          Math.max(0, Math.min(1, (frame - at - index * stagger) / 16)),
        )
        return (
          <span
            key={index}
            style={{
              display: 'inline-block',
              marginRight: '0.24em',
              opacity: p,
              translate: `0 ${(1 - p) * 0.5}em`,
              filter: `blur(${(1 - p) * 10}px)`,
              ...chromeText,
            }}
          >
            {word}
          </span>
        )
      })}
    </div>
  )
}

/** The narration as a quiet caption under the picture. */
export const Caption: React.FC<{ text: string; from: number; to: number }> = ({
  text,
  from,
  to,
}) => {
  const frame = useCurrentFrame()
  const opacity = interpolate(frame, [from, from + 8, to - 8, to], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 34,
        display: 'flex',
        justifyContent: 'center',
        opacity,
      }}
    >
      <p
        style={{
          margin: 0,
          maxWidth: 1240,
          padding: '12px 26px',
          borderRadius: 18,
          fontSize: 30,
          lineHeight: 1.35,
          textAlign: 'center',
          color: '#f5f5f3',
          backgroundColor: 'rgba(8,8,10,0.72)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {text}
      </p>
    </div>
  )
}
