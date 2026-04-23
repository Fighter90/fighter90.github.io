# Changelog

All notable user-facing and architectural changes are tracked here.
Format is loosely based on Keep a Changelog; the project does not cut
semantic-version releases — `main` is always the deployed state.

## [Unreleased] — 2026-04-23

### Security (P0)

- `npm audit fix`: closed 7 advisories (2 moderate, 5 high).
  - `GHSA-4w7w-66w2-5vf9` — Vite path traversal in optimized-deps `.map` handler.
  - `GHSA-v2wj-q39q-566r` — Vite `server.fs.deny` bypass via query strings.
  - `GHSA-p9ff-h696-f583` — Vite dev-server WebSocket arbitrary file read.
  - `GHSA-mw96-cpmx-2vgc` — Rollup path-traversal arbitrary file write.
  - `GHSA-25h7-pfq9-p65f` — `flatted` unbounded recursion DoS.
  - `GHSA-f886-m6hf-6m8v` — `brace-expansion` ReDoS.
  - `GHSA-2g4f-4pwh-qvx6` — `ajv` ReDoS via `$data`.
  All seven are dev-only / transitive — never shipped to clients, but bandwagon
  exposure during local dev and CI is now gone.

### Added (P1)

- **Content-Security-Policy** and strict `Referrer-Policy` meta tags on
  `index.html`. `frame-src` restricted to `www.linkedin.com`; `connect-src`
  to `'self'`, the chat proxy, and `openrouter.ai`.
- **`LinkedInEmbed` component** (`src/components/LinkedInEmbed.tsx`):
  lazy mount via `IntersectionObserver` (`rootMargin: 200px`), 6-second
  load timeout with fallback card (LinkedIn icon + title + date + "Open
  on LinkedIn" CTA), skeleton placeholder matched to final iframe height
  (CLS = 0). Loaded via `React.lazy` so it ships in its own chunk.
- Language-aware SEO meta: `<title>`, `<meta name="description">`,
  `og:title`, `og:description`, `og:locale` now update on RU/EN switch
  from a new `meta` block in `src/i18n.ts`.

### Changed (P1)

- `src/i18n.ts` publications are now the single source of truth for
  `{ embedUrl, postUrl, title, date, height }` — 4 hardcoded `<iframe>`
  tags in `App.tsx` were replaced by `t.publications.map(LinkedInEmbed)`.
- ICAIMT 2026 iframe URN aligned with `publications[0]` in `i18n.ts`
  (`urn:li:activity:7438922298000269312`) so both references resolve to
  the same post.
- `FloatingChat` local fallback no longer mentions "Webguru.pro
  (2017–2020)" (the company is not in the Experience section) and its
  LinkedIn line uses the full URL so `ChatMarkdown` auto-linkifies it.
- `LangContext` uses lazy-init `useState` and a focused effect — fixes
  a pre-existing `react-hooks/set-state-in-effect` lint error.

### Removed (P1)

- Dead i18n fields: `translations[*].hero.role`, `hero.askMe`,
  `contact.title` (not consumed by any component; `useTypewriter`
  supplies the role list and `t.sections.letsChat` replaces
  `contact.title`).

### Polish (P2)

- `<lastmod>2026-04-23</lastmod>` added to `public/sitemap.xml`.
- Two **Rambler&Co** experience cards now disambiguated by team
  ("Rambler&Co · Портал" vs "Rambler&Co · Рекламная платформа" / their
  English equivalents).
- `useMouseParallax` bails out early on coarse-pointer devices via
  `window.matchMedia('(pointer: fine)')` — no more idle `mousemove`
  listener on touch devices.
- Docs sync: `README.md` gained a "Публикации LinkedIn" architecture
  subsection and CSP bullet in Security; `public/llms.txt` and
  `index.html` JSON-LD `knowsAbout` aligned with `skills.ai.items`
  (Claude API, OpenAI API, Prompt Engineering).

### Fixed (post-deploy Playwright smoke)

- Dropped `frame-ancestors 'self'` from the `<meta>` CSP in
  `index.html`: the directive is only valid as an HTTP header, and the
  browser logs a console error on every iframe mount/unmount when it's
  present via meta. GitHub Pages already sends `X-Frame-Options: deny`
  upstream, so clickjacking protection is preserved without the noise.

### Verified

- `npm run lint` — 0 errors, 0 warnings.
- `npm run build` — green; `LinkedInEmbed` lands in its own ~3 kB chunk.
- CSP meta present in `dist/index.html`.
