import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { useSceneLength } from '../components/scene-length'
import { KineticTitle } from '../components/Overlays'
import { Stage } from '../components/Stage'
import { color } from '../theme'

const ease = Easing.bezier(0.65, 0, 0.35, 1)

/** "You already have a powerful GPU in the cloud. It's just stuck inside a browser tab." */
export const Hook: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const durationInFrames = useSceneLength()
  const enter = spring({ frame, fps, config: { damping: 20, stiffness: 120 } })
  const squeezeAt = Math.round(durationInFrames * 0.5)
  const q = ease(Math.max(0, Math.min(1, (frame - squeezeAt) / 26)))

  return (
    <Stage>
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: 92 }}>
        <div style={{ position: 'relative', height: 120, width: '100%' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 1 - q }}>
            <KineticTitle text="A powerful GPU in the cloud." at={4} size={84} />
          </div>
          <div style={{ position: 'absolute', inset: 0, opacity: q }}>
            <KineticTitle text="…stuck inside a browser tab." at={squeezeAt + 4} size={84} />
          </div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 150 }}>
        <div
          style={{
            width: 1180,
            height: 640,
            borderRadius: 18,
            overflow: 'hidden',
            backgroundColor: '#0d0d10',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.1), 0 60px 140px -40px rgba(0,0,0,0.95)',
            opacity: enter,
            scale: interpolate(q, [0, 1], [interpolate(enter, [0, 1], [0.94, 1]), 0.26]),
            translate: `0 ${interpolate(q, [0, 1], [0, -40])}px`,
          }}
        >
          {/* tab strip */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 54, padding: '0 16px', backgroundColor: '#151518' }}>
            {['Untitled0.ipynb', 'Untitled1.ipynb', 'Untitled3.ipynb — Colab', 'Untitled2.ipynb'].map((tab, index) => (
              <div
                key={tab}
                style={{
                  height: 40,
                  padding: '0 18px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '12px 12px 0 0',
                  fontSize: 18,
                  color: index === 2 ? color.ink : color.graphite,
                  backgroundColor: index === 2 ? '#0d0d10' : 'transparent',
                }}
              >
                {tab}
              </div>
            ))}
          </div>
          {/* address bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, height: 52, padding: '0 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ flex: 1, height: 34, borderRadius: 17, backgroundColor: '#18181c', display: 'flex', alignItems: 'center', padding: '0 18px', fontSize: 18, color: color.graphite }}>
              colab.research.google.com/drive/1x…
            </div>
            <div style={{ padding: '6px 14px', borderRadius: 999, fontSize: 17, color: color.ink, boxShadow: '0 0 0 1px rgba(255,255,255,0.15)' }}>
              T4 · connected
            </div>
          </div>
          {/* notebook cells */}
          <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18, opacity: 1 - q }}>
            {[
              '!pip install -q kokoro soundfile',
              'from kokoro import KPipeline',
              "pipeline = KPipeline(lang_code='a')",
              "audio = pipeline('Hello…', voice='af_heart')",
            ].map((code, index) => {
              const p = Math.max(0, Math.min(1, (frame - 12 - index * 7) / 14))
              return (
                <div key={code} style={{ display: 'flex', gap: 16, opacity: p, translate: `0 ${(1 - p) * 12}px` }}>
                  <span style={{ width: 54, fontSize: 18, color: color.graphite, fontFamily: 'monospace' }}>[{index + 1}]</span>
                  <div style={{ flex: 1, padding: '16px 20px', borderRadius: 10, backgroundColor: '#141418', fontFamily: 'monospace', fontSize: 22, color: '#d6d7dc' }}>
                    {code}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </AbsoluteFill>
    </Stage>
  )
}
