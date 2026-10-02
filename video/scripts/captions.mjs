// Write the intro film's WebVTT captions (same timing as src/timeline.ts).
// node scripts/captions.mjs > ../public/media/intro.vtt
import { readFileSync } from 'node:fs'

const narration = JSON.parse(readFileSync(new URL('../src/data/narration.json', import.meta.url)))
const timing = JSON.parse(readFileSync(new URL('../src/data/timing.json', import.meta.url)))

const stamp = (seconds) => {
  const ms = Math.round(seconds * 1000)
  const h = String(Math.floor(ms / 3_600_000)).padStart(2, '0')
  const m = String(Math.floor((ms % 3_600_000) / 60_000)).padStart(2, '0')
  const s = String(Math.floor((ms % 60_000) / 1000)).padStart(2, '0')
  return `${h}:${m}:${s}.${String(ms % 1000).padStart(3, '0')}`
}

let frame = 0
const cues = narration.segments.map((segment, index, all) => {
  const spoken = (segment.end - segment.start) / timing.audioRate
  const lead = index === 0 ? timing.leadIn : 0
  const tail = index === all.length - 1 ? timing.tail : timing.gap
  const start = frame + Math.round(lead * timing.fps)
  frame += Math.round((lead + spoken + tail) * timing.fps)
  return `${index + 1}\n${stamp(start / timing.fps)} --> ${stamp(start / timing.fps + spoken)}\n${segment.text}\n`
})
process.stdout.write(`WEBVTT\n\n${cues.join('\n')}`)
