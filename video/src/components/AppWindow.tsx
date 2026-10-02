import type { ReactNode } from 'react'
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion'
import { color, SCREEN } from '../theme'
import { cameraAt, cameraTransform, type CameraKey, type WindowLayout } from './camera'
import { Cursor, type CursorKey } from './Cursor'

export interface ScreenKey {
  at: number
  /** File in public/screens, without extension. */
  shot: string
  /** Vertical offset of the content (CSS px), for scroll moves between shots. */
  scrollFrom?: number
}

const FADE = 9

/**
 * The NZAP Engine window: real screenshots that cross-fade from state to
 * state, a camera that eases onto whatever matters (like Screen Studio /
 * Recordly auto-zoom), and a cursor that moves and clicks in content space.
 */
export const AppWindow: React.FC<{
  layout: WindowLayout
  screens: ScreenKey[]
  camera?: CameraKey[]
  cursor?: CursorKey[]
  /** Drawn over the screenshot, in CSS pixels of the screenshot. */
  overlay?: ReactNode
  /** 0–1 entrance (rise and fade). */
  enter?: number
}> = ({ layout, screens, camera = [], cursor = [], overlay, enter = 1 }) => {
  const frame = useCurrentFrame()
  const view = cameraAt(frame, camera, layout)
  const width = SCREEN.width * layout.scale
  const height = SCREEN.height * layout.scale
  const radius = 14 * layout.scale

  return (
    <AbsoluteFill
      style={{
        transform: cameraTransform(view, layout),
        transformOrigin: '0 0',
        opacity: enter,
        translate: `0 ${(1 - enter) * 60}px`,
      }}
    >
      {/* glow behind the window */}
      <div
        style={{
          position: 'absolute',
          left: layout.x - 80,
          top: layout.y - layout.titleBar - 80,
          width: width + 160,
          height: height + layout.titleBar + 160,
          background:
            'radial-gradient(50% 50% at 50% 50%, rgba(170,172,185,0.25), transparent 75%)',
          filter: 'blur(30px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: layout.x,
          top: layout.y - layout.titleBar,
          width,
          height: height + layout.titleBar,
          borderRadius: radius,
          overflow: 'hidden',
          backgroundColor: color.panel,
          boxShadow:
            '0 0 0 1px rgba(255,255,255,0.09), 0 50px 120px -30px rgba(0,0,0,0.95), 0 20px 50px -20px rgba(0,0,0,0.8)',
        }}
      >
        <div
          style={{
            height: layout.titleBar,
            display: 'flex',
            alignItems: 'center',
            gap: layout.titleBar * 0.22,
            paddingLeft: layout.titleBar * 0.45,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            backgroundColor: '#0b0b0d',
          }}
        >
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              style={{
                width: layout.titleBar * 0.3,
                height: layout.titleBar * 0.3,
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.16)',
              }}
            />
          ))}
          <span
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              textAlign: 'center',
              fontSize: layout.titleBar * 0.38,
              color: color.graphite,
            }}
          >
            NZAP Engine
          </span>
        </div>
        <div style={{ position: 'relative', width, height, overflow: 'hidden' }}>
          {screens.map((screen, index) => {
            const next = screens[index + 1]
            const fadeIn =
              index === 0
                ? 1
                : interpolate(frame, [screen.at, screen.at + FADE], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  })
            const fadeOut = next
              ? interpolate(frame, [next.at + FADE - 1, next.at + FADE], [1, 0], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                })
              : 1
            const visible = frame >= screen.at - 1 && (!next || frame < next.at + FADE)
            if (!visible) return null
            const scroll =
              screen.scrollFrom === undefined
                ? 0
                : interpolate(frame, [screen.at, screen.at + 22], [screen.scrollFrom, 0], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  })
            return (
              <Img
                key={`${screen.shot}-${screen.at}`}
                src={staticFile(`screens/${screen.shot}.png`)}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width,
                  height,
                  opacity: Math.min(fadeIn, fadeOut),
                  translate: `0 ${scroll * layout.scale}px`,
                }}
              />
            )
          })}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              width: SCREEN.width,
              height: SCREEN.height,
              transform: `scale(${layout.scale})`,
              transformOrigin: '0 0',
            }}
          >
            {overlay}
            <Cursor keys={cursor} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}
