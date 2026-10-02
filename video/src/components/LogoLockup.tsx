import { Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { color } from '../theme'

/**
 * The NZAP mark with a light sweep across its chrome, and the logo's own
 * NZΛP lettering spacing in beneath it.
 */
export const LogoLockup: React.FC<{ at?: number; size?: number; label?: string }> = ({
  at = 0,
  size = 300,
  label = 'Engine',
}) => {
  const frame = useCurrentFrame() - at
  const { fps } = useVideoConfig()
  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 90 } })
  const sweep = interpolate(frame, [8, 42], [-0.6, 1.6], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.45, 0, 0.2, 1),
  })
  const word = interpolate(frame, [14, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  })
  const mark = staticFile('brand/nzap-mark-dark.png')
  const wordMask = staticFile('brand/nzap-word-mask.png')
  const markWidth = size * 1.38

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        style={{
          position: 'relative',
          width: markWidth,
          height: size,
          opacity: enter,
          scale: interpolate(enter, [0, 1], [0.82, 1]),
          filter: `drop-shadow(0 0 ${size * 0.12}px rgba(255,255,255,0.22))`,
        }}
      >
        <Img src={mark} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        {/* the light sweep, clipped to the mark */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(105deg, transparent ${(sweep - 0.18) * 100}%, rgba(255,255,255,0.85) ${sweep * 100}%, transparent ${(sweep + 0.18) * 100}%)`,
            mixBlendMode: 'screen',
            maskImage: `url(${mark})`,
            WebkitMaskImage: `url(${mark})`,
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
          }}
        />
      </div>
      <div
        style={{
          marginTop: size * 0.16,
          width: size * 1.25,
          aspectRatio: '627 / 87',
          backgroundColor: color.ink,
          maskImage: `url(${wordMask})`,
          WebkitMaskImage: `url(${wordMask})`,
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          opacity: word,
          scale: interpolate(word, [0, 1], [1.12, 1]),
        }}
      />
      <div
        style={{
          marginTop: size * 0.07,
          fontSize: size * 0.085,
          letterSpacing: `${interpolate(word, [0, 1], [0.9, 0.5])}em`,
          textTransform: 'uppercase',
          color: color.graphite,
          opacity: word,
        }}
      >
        {label}
      </div>
    </div>
  )
}
