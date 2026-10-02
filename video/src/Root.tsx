import { AbsoluteFill, Composition, Folder } from 'remotion'
import { HeroClip } from './HeroClip'
import { IntroFilm, SCENE_COMPONENTS, SCENE_NAMES } from './IntroFilm'
import { LogoLockup } from './components/LogoLockup'
import { Stage } from './components/Stage'
import { FILM_FRAMES, scenes } from './timeline'
import { FPS, color } from './theme'

const Poster: React.FC = () => (
  <Stage light={1.5}>
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: 50 }}>
      <LogoLockup size={240} />
      <p style={{ margin: 0, fontSize: 40, color: color.graphite }}>
        One-click AI on your own Colab GPUs
      </p>
    </AbsoluteFill>
  </Stage>
)

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="IntroFilm"
      component={IntroFilm}
      durationInFrames={FILM_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition
      id="HeroClip"
      component={HeroClip}
      durationInFrames={150}
      fps={FPS}
      width={1920}
      height={1200}
    />
    <Composition
      id="Poster"
      component={Poster}
      durationInFrames={90}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Folder name="Scenes">
      {SCENE_COMPONENTS.map((Scene, index) => (
        <Composition
          key={SCENE_NAMES[index]}
          id={SCENE_NAMES[index]}
          component={Scene}
          durationInFrames={scenes[index].durationInFrames}
          fps={FPS}
          width={1920}
          height={1080}
        />
      ))}
    </Folder>
  </>
)
