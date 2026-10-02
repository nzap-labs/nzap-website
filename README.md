# nzap-website

The website for [NZAP Engine](https://github.com/nzap-labs/nzap-engine): one-click
AI apps on your own Google Colab runtimes.

```
src/            Astro site (static): pages, sections, styles, live GitHub data
public/         brand assets, product screenshots, audio samples
public/media/   videos rendered by CI from video/ (not committed)
video/          Remotion project: the 5-second homepage clip and the intro film
```

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static site in dist/
```

The app gallery, star counts, contributors and download links come from GitHub:
the catalog (`nzap-labs/nzap-notebooks/index.json`) at build time, the rest in the
browser, with static fallbacks.
