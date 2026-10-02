# NZAP Engine — videos

Remotion project for the website's media:

| Composition | Size / length       | Use                                         |
| ----------- | ------------------- | ------------------------------------------- |
| `HeroClip`  | 1920×1200, 5 s loop | homepage hero (`public/media/hero.*`)        |
| `IntroFilm` | 1920×1080, ~70 s    | the intro film (`public/media/intro.mp4`)    |
| `Poster`    | still               | the film's poster frame                     |
| `Scenes/*`  | per scene           | for previewing and editing one scene        |

```bash
npm ci
npm run dev      # Remotion Studio
```

CI renders everything (`.github/workflows/site.yml`); nothing needs rendering locally.

## How it is made

- **Screens** (`public/screens`) are 2× captures of the real NZAP Engine UI
  running against its simulated engine, with `src/data/boxes.json` holding the
  rectangle of every element the camera zooms into or the cursor clicks. They
  come from `e2e/capture/video.spec.ts` in the engine repository.
- **Camera and cursor** (`src/components`) give the Screen Studio / Recordly
  feel: eased auto-zooms onto those rectangles, an arcing cursor with a press,
  a ripple and a short trail, and cross-fades between UI states.
- **Narration** (`public/audio/narration-breeze.wav`) was generated with the
  Breeze TTS 2 app on a Colab T4 through NZAP Engine. `src/data/narration.json`
  holds each paragraph's timing; the film gives every paragraph its own scene,
  and `scripts/captions.mjs` writes matching WebVTT captions.

Breeze TTS 2 weights are licensed for research and non-commercial use. A
Kokoro (Apache-2.0) narration can replace the file if that matters for how the
film is used. Remotion is free for teams of up to three; larger companies need
a [company license](https://www.remotion.pro/license).
