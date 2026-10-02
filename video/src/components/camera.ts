import { Easing, interpolate } from 'remotion'
import boxes from '../data/boxes.json'
import { SCREEN } from '../theme'

export type Box = { x: number; y: number; width: number; height: number }
type Shot = keyof typeof boxes

/** A captured element rectangle (CSS pixels of the 1440×900 screenshot). */
export function box(shot: Shot, name: string): Box {
  const found = (boxes[shot] as Record<string, Box>)[name]
  if (!found) throw new Error(`No box ${shot}.${name}`)
  return found
}

/** Where the app's content sits in the frame. */
export interface WindowLayout {
  frameWidth: number
  frameHeight: number
  /** Content (screenshot) top-left in frame pixels. */
  x: number
  y: number
  /** Frame pixels per CSS pixel. */
  scale: number
  titleBar: number
}

export function layoutFor(frameWidth: number, frameHeight: number, fill = 0.78): WindowLayout {
  const titleBar = Math.round(frameHeight * 0.034)
  const scale = Math.min(
    (frameWidth * fill) / SCREEN.width,
    (frameHeight * fill - titleBar) / SCREEN.height,
  )
  const width = SCREEN.width * scale
  const height = SCREEN.height * scale + titleBar
  return {
    frameWidth,
    frameHeight,
    x: (frameWidth - width) / 2,
    y: (frameHeight - height) / 2 + titleBar,
    scale,
    titleBar,
  }
}

export interface Camera {
  cx: number
  cy: number
  z: number
}

/** Move the camera onto `focus` (or back to the whole window when null). */
export interface CameraKey {
  at: number
  focus: Box | null
  /** Zoom override; by default the focus fills about half the frame. */
  zoom?: number
  /** Frames the move takes. */
  duration?: number
  /** Fraction of the frame the focus box should fill. */
  fill?: number
}

const ease = Easing.bezier(0.65, 0, 0.35, 1)

function target(key: CameraKey, layout: WindowLayout): Camera {
  if (!key.focus) return { cx: layout.frameWidth / 2, cy: layout.frameHeight / 2, z: 1 }
  const { focus } = key
  const fill = key.fill ?? 0.5
  const zoom =
    key.zoom ??
    Math.min(
      2.4,
      Math.max(
        1.05,
        Math.min(
          (layout.frameWidth * fill) / (focus.width * layout.scale),
          (layout.frameHeight * fill) / (focus.height * layout.scale),
        ),
      ),
    )
  return {
    cx: layout.x + (focus.x + focus.width / 2) * layout.scale,
    cy: layout.y + (focus.y + focus.height / 2) * layout.scale,
    z: zoom,
  }
}

/** The camera at `frame`: each key eases from wherever the camera was. */
export function cameraAt(frame: number, keys: CameraKey[], layout: WindowLayout): Camera {
  let state: Camera = { cx: layout.frameWidth / 2, cy: layout.frameHeight / 2, z: 1 }
  for (const key of keys) {
    if (frame < key.at) break
    const duration = key.duration ?? 26
    const p = ease(Math.min(1, (frame - key.at) / duration))
    const goal = target(key, layout)
    state = {
      cx: interpolate(p, [0, 1], [state.cx, goal.cx]),
      cy: interpolate(p, [0, 1], [state.cy, goal.cy]),
      z: Math.exp(interpolate(p, [0, 1], [Math.log(state.z), Math.log(goal.z)])),
    }
  }
  return state
}

export function cameraTransform(camera: Camera, layout: WindowLayout): string {
  return `translate(${layout.frameWidth / 2}px, ${layout.frameHeight / 2}px) scale(${camera.z}) translate(${-camera.cx}px, ${-camera.cy}px)`
}
