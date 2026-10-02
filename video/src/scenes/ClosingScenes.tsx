import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'
import { useSceneLength } from '../components/scene-length'
import { LogoLockup } from '../components/LogoLockup'
import { Callout, KineticTitle } from '../components/Overlays'
import { Stage } from '../components/Stage'
import { chromeFill, color, SCREEN } from '../theme'

const TILE = { width: 833, height: 383 }
/** The part of each workspace shot below the shared Colab header. */
const CROP = { x: 332, y: 478, width: 1075, height: 494 }

/** "When you need more, there's a real terminal, a file manager, notebooks with typed parameters, and jobs that clean up after themselves." */
export const More: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const d = useSceneLength()
  const tiles = [
    { shot: 'terminal', label: 'A real terminal', at: 0.12 },
    { shot: 'files', label: 'A file manager', at: 0.3 },
    { shot: 'notebooks', label: 'Notebooks with typed parameters', at: 0.45 },
    { shot: 'console', label: 'Packages, Drive and jobs', at: 0.66 },
  ]
  const drift = interpolate(frame, [0, d], [0, -24])
  return (
    <Stage>
      <AbsoluteFill style={{ padding: '70px 110px 0' }}>
        <KineticTitle text="Everything else Colab does." at={2} size={70} align="left" />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          top: 210,
          padding: '0 110px',
          display: 'grid',
          gridTemplateColumns: `${TILE.width}px ${TILE.width}px`,
          gridTemplateRows: `${TILE.height}px ${TILE.height}px`,
          gap: 34,
          paddingBottom: 70,
          translate: `0 ${drift}px`,
        }}
      >
        {tiles.map((tile) => {
          const enter = spring({
            frame: frame - Math.round(d * tile.at),
            fps,
            config: { damping: 18, stiffness: 120 },
          })
          return (
            <div
              key={tile.shot}
              style={{
                position: 'relative',
                borderRadius: 18,
                overflow: 'hidden',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.1), 0 40px 90px -30px rgba(0,0,0,0.95)',
                opacity: enter,
                scale: interpolate(enter, [0, 1], [0.9, 1]),
                translate: `0 ${(1 - enter) * 40}px`,
              }}
            >
              {/* The panel that matters, not the shared header above it. */}
              <Img
                src={staticFile(`screens/${tile.shot}.png`)}
                style={{
                  position: 'absolute',
                  width: SCREEN.width * (TILE.width / CROP.width),
                  left: -CROP.x * (TILE.width / CROP.width),
                  top: -CROP.y * (TILE.width / CROP.width),
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, transparent 30%, rgba(5,5,6,0.97) 88%)',
                }}
              />
              <p
                style={{
                  position: 'absolute',
                  left: 26,
                  bottom: 20,
                  margin: 0,
                  fontSize: 34,
                  fontWeight: 500,
                }}
              >
                {tile.label}
              </p>
            </div>
          )
        })}
      </AbsoluteFill>
    </Stage>
  )
}

const APP_JSON = `{
  "format": "nzap-app/1",
  "category": "audio",
  "runtime": { "accelerator": "T4" },
  "estimates": { "setup": 50, "run": 2 },
  "inputs": [
    { "param": "text",  "widget": "textarea" },
    { "param": "voice", "widget": "select" },
    { "param": "speed", "widget": "slider" }
  ],
  "outputs": [{ "id": "speech", "kind": "audio" }]
}`

/** "Every app is just a notebook and a small JSON file, so anyone can publish one to the community catalog." */
export const Build: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const d = useSceneLength()
  const typed = Math.round(
    interpolate(frame, [8, d * 0.62], [0, APP_JSON.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  )
  const cards = [
    { title: 'Kokoro Text to Speech', meta: 'T4 · setup ~50s · run ~2s' },
    { title: 'Breeze TTS 2', meta: 'T4 · voice design & cloning' },
    { title: 'Your app', meta: 'notebook.py + app.json' },
  ]
  return (
    <Stage>
      <AbsoluteFill style={{ padding: '80px 110px', flexDirection: 'row', gap: 70 }}>
        <div style={{ flex: 1.1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 24, color: color.graphite, marginBottom: 18, fontFamily: 'monospace' }}>
            notebooks/kokoro-tts/app.json
          </div>
          <pre
            style={{
              flex: 1,
              margin: 0,
              padding: '34px 38px',
              borderRadius: 22,
              backgroundColor: '#09090b',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.09), 0 50px 120px -40px rgba(0,0,0,0.95)',
              fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
              fontSize: 27,
              lineHeight: 1.55,
              color: '#d9dadf',
              whiteSpace: 'pre-wrap',
            }}
          >
            {APP_JSON.slice(0, typed)}
            <span style={{ opacity: Math.floor(frame / 8) % 2 ? 0 : 1 }}>▍</span>
          </pre>
        </div>
        <div style={{ flex: 0.9, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22 }}>
          <KineticTitle text="A notebook + app.json = an app." at={4} size={58} align="left" />
          <div style={{ height: 18 }} />
          {cards.map((card, index) => {
            const enter = spring({
              frame: frame - Math.round(d * (0.3 + index * 0.13)),
              fps,
              config: { damping: 17, stiffness: 140 },
            })
            const mine = index === cards.length - 1
            return (
              <div
                key={card.title}
                style={{
                  padding: '24px 28px',
                  borderRadius: 22,
                  backgroundColor: mine ? 'transparent' : '#0e0e10',
                  border: mine ? '2px dashed rgba(255,255,255,0.25)' : undefined,
                  boxShadow: mine ? undefined : '0 0 0 1px rgba(255,255,255,0.09)',
                  opacity: enter,
                  translate: `${(1 - enter) * 80}px 0`,
                }}
              >
                <div style={{ fontSize: 32, fontWeight: 500 }}>{card.title}</div>
                <div style={{ marginTop: 6, fontSize: 24, color: color.graphite }}>{card.meta}</div>
              </div>
            )
          })}
        </div>
      </AbsoluteFill>
      <AbsoluteFill>
        <Callout at={Math.round(d * 0.72)} x={1068} y={930} tone="light">
          Publish it to the community catalog
        </Callout>
      </AbsoluteFill>
    </Stage>
  )
}

/** "NZAP Engine. Free, open source, and yours. Download it today." */
export const Outro: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const d = useSceneLength()
  const cta = spring({ frame: frame - Math.round(d * 0.42), fps, config: { damping: 18 } })
  const fadeOut = interpolate(frame, [d - 18, d], [1, 0], { extrapolateLeft: 'clamp' })
  return (
    <Stage light={1.5}>
      <AbsoluteFill
        style={{ alignItems: 'center', justifyContent: 'center', gap: 60, opacity: fadeOut }}
      >
        <LogoLockup at={0} size={230} />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 26,
            opacity: cta,
            translate: `0 ${(1 - cta) * 24}px`,
          }}
        >
          <div style={{ ...chromeFill, padding: '20px 46px', borderRadius: 999, fontSize: 38, fontWeight: 500 }}>
            Download free · Windows · macOS · Linux
          </div>
          <div style={{ fontSize: 30, color: color.graphite, letterSpacing: '0.04em' }}>
            github.com/nzap-labs
          </div>
        </div>
      </AbsoluteFill>
    </Stage>
  )
}

