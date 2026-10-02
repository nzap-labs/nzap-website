import { Easing, interpolate, useCurrentFrame } from 'remotion'

/** Move the cursor to (x, y) in screenshot CSS pixels; optionally click there. */
export interface CursorKey {
  at: number
  x: number
  y: number
  duration?: number
  click?: boolean
}

const ease = Easing.bezier(0.45, 0, 0.15, 1)
const CLICK_DELAY = 4

/**
 * A macOS-style pointer with eased, slightly arcing moves, a press on click
 * and a soft ripple, plus a short trail while it travels (a cheap stand-in
 * for motion blur that stays fast to render).
 */
export const Cursor: React.FC<{ keys: CursorKey[] }> = ({ keys }) => {
  const frame = useCurrentFrame()
  if (keys.length === 0 || frame < keys[0].at) return null

  const positionAt = (time: number) => {
    let x = keys[0].x
    let y = keys[0].y
    for (const [index, key] of keys.entries()) {
      if (time < key.at) break
      if (index === 0) continue
      const duration = key.duration ?? 22
      const p = ease(Math.min(1, (time - key.at) / duration))
      // A gentle arc instead of a ruler-straight line.
      const arc = Math.sin(p * Math.PI) * Math.min(40, Math.hypot(key.x - x, key.y - y) * 0.08)
      x = interpolate(p, [0, 1], [x, key.x]) + arc * 0.4
      y = interpolate(p, [0, 1], [y, key.y]) - arc
    }
    return { x, y }
  }

  const { x, y } = positionAt(frame)
  const clicks = keys.filter((key) => key.click).map((key) => key.at + (key.duration ?? 22) + CLICK_DELAY)
  const lastClick = clicks.filter((at) => frame >= at).at(-1)
  const sinceClick = lastClick === undefined ? Infinity : frame - lastClick
  const press = sinceClick < 8 ? interpolate(sinceClick, [0, 3, 8], [1, 0.82, 1]) : 1
  // A cursor that is there from frame 0 (a loop) must not fade in.
  const appear =
    keys[0].at === 0
      ? 1
      : interpolate(frame, [keys[0].at, keys[0].at + 8], [0, 1], { extrapolateRight: 'clamp' })

  const trail = [1, 2, 3].map((step) => ({ ...positionAt(frame - step), step }))
  const speed = Math.hypot(x - trail[0].x, y - trail[0].y)

  return (
    <>
      {sinceClick < 18 && (
        <div
          style={{
            position: 'absolute',
            left: x - 30,
            top: y - 30,
            width: 60,
            height: 60,
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.75)',
            scale: interpolate(sinceClick, [0, 18], [0.3, 1.6]),
            opacity: interpolate(sinceClick, [0, 18], [0.9, 0]),
          }}
        />
      )}
      {speed > 6 &&
        trail.map((point) => (
          <Arrow key={point.step} x={point.x} y={point.y} opacity={0.18 / point.step} press={1} />
        ))}
      <Arrow x={x} y={y} opacity={appear} press={press} />
    </>
  )
}

const Arrow: React.FC<{ x: number; y: number; opacity: number; press: number }> = ({
  x,
  y,
  opacity,
  press,
}) => (
  <svg
    viewBox="0 0 28 28"
    width={34}
    height={34}
    style={{
      position: 'absolute',
      left: x - 6,
      top: y - 4,
      opacity,
      scale: press,
      transformOrigin: '6px 4px',
      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.55))',
    }}
  >
    <path
      d="M6 3.5v19.2l4.6-4.4 3.2 7.2 3.3-1.4-3.2-7.1h6.4z"
      fill="#ffffff"
      stroke="#000000"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
)
