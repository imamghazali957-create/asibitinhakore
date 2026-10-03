# AGENTS.md

## Architecture
- The entire app lives in `public/index.html`: markup, a `<style>` block, and one IIFE `<script>`.
- `netlify.toml` publishes `public/`; there is no package.json and no build step.
- Data layer: `getClinics/saveClinics`, `getAppointments/saveAppointments` etc. wrap `localStorage` (keys in the `STORAGE` constant). This layer is intentionally isolated so it can be swapped for API calls (Netlify Functions + Netlify Database) later.
- i18n: strings live in a translations object keyed by `en` / `ha`; `applyLanguage()` + `renderAll()` re-render.
- Admin: opened via `#admin` hash; passcode is checked client-side against a SHA-256 hash (`ADMIN_PASSCODE_SHA256`). This is NOT real security — see README roadmap.

## Conventions
- Vanilla JS, compact style, `$()` = `document.getElementById`. Always pass user content through `escapeHtml()` before injecting into `innerHTML`.
- CSS uses custom properties defined in `:root`.

## Notes
- The original upload is kept untouched under `.netlify/assets/`; edit `public/index.html`.
