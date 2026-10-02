import narration from './data/narration.json'
import timing from './data/timing.json'
import { FPS } from './theme'

/**
 * The film's timing comes from the narration (Breeze TTS 2, generated on a
 * Colab T4 through NZAP's own app): one scene per paragraph, each as long
 * as its line plus a short breath.
 */
// Shared with scripts/captions.mjs, which writes the film's WebVTT captions.
export const AUDIO_RATE = timing.audioRate
const LEAD_IN = timing.leadIn
const GAP = timing.gap
const TAIL = timing.tail

export interface SceneTiming {
  index: number
  text: string
  /** First frame of the scene in the film. */
  from: number
  durationInFrames: number
  /** Where the line starts inside the scene. */
  audioOffset: number
  trimBefore: number
  trimAfter: number
}

export const segments = narration.segments

export const scenes: SceneTiming[] = (() => {
  let cursor = 0
  return segments.map((segment, index) => {
    const spoken = (segment.end - segment.start) / AUDIO_RATE
    const lead = index === 0 ? LEAD_IN : 0
    const tail = index === segments.length - 1 ? TAIL : GAP
    const durationInFrames = Math.round((lead + spoken + tail) * FPS)
    const scene = {
      index,
      text: segment.text,
      from: cursor,
      durationInFrames,
      audioOffset: Math.round(lead * FPS),
      trimBefore: Math.round(segment.start * FPS),
      trimAfter: Math.round(segment.end * FPS),
    }
    cursor += durationInFrames
    return scene
  })
})()

export const FILM_FRAMES = scenes.reduce((total, scene) => total + scene.durationInFrames, 0)
