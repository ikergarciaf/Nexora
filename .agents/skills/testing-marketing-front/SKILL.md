# Testing the Nexora marketing front

Use this skill when testing the public marketing pages (landing + `/soluciones/:slug`) of Nexora. It does NOT apply to the dashboard, login, patient portal or public booking pages.

## What to expect in the codebase

- The marketing pages are React + Vite + Tailwind. Source files:
  - `src/pages/LandingPage.tsx` — the home page.
  - `src/pages/SpecialtyLanding.tsx` — `/soluciones/:slug` (dental, fisioterapia, psicologos, nutricion, estetica, general, app-clientes).
  - `src/components/FrontendNavbar.tsx` — navbar with the `Especialidades` dropdown.
- Brand color is `#008477` (teal) on a mostly white/slate background. Headings use `font-semibold`, not `font-black`.
- Specialty cards on the landing and the hero on each specialty page render an Unsplash image (one per specialty). The dental Unsplash photo id is `1606811841689` and the fisioterapia one is `1571019613454` — handy if you need to assert that two specialty pages got different images without relying only on visual diffing.
- The floating contact widget is a `FloatingContact` component at the bottom of `LandingPage.tsx` with `useState(false)` for open/closed and three actions: WhatsApp (`href` starts with `https://wa.me/`), Email (`mailto:hola@nexora.co...`) and Reservar demo (`mailto:hola@nexora.co?subject=Demo...`).

## How to bring the app up locally

```bash
cd /home/ubuntu/repos/Nexora
npm install
npx vite build
npx vite preview --port 4173 --host 127.0.0.1
```

Then verify with `curl -sf http://127.0.0.1:4173/`. The marketing pages do not need the backend running — they are pure client routes.

## What to test on every change

1. **Landing structure (top to bottom):** Hero (`Gestiona tu clínica sin papeleo.` + `Empezar gratis`), trust bar (`CONSTRUIDO JUNTO A CLÍNICAS REALES EN ESPAÑA`), 7 specialty cards with images, `¿Por qué Nexora?` comparison table (Nexora / Excel / Software genérico), 4-feature grid, integrations grid (Stripe, WhatsApp, Google Calendar, Verifactu, Zoom, Outlook), pricing, 3-testimonial grid with specialty badges, FAQ, `¿Prefieres que te lo enseñemos?` demo banner, final CTA, footer.
2. **Specialty navigation:** click `Especialidades` in the navbar — a dropdown with 7 items must appear; clicking each must navigate to `/soluciones/<slug>` and render a hero with that specialty's image plus a testimonial card below the features.
3. **Floating widget:** the bottom-right round button must toggle a panel labeled `¿Hablamos?` with WhatsApp / Email / Reservar demo rows whose `href`s respect the patterns above.
4. **Mobile sanity:** at viewport 375 width the floating button and the demo banner should not overlap the page content; specialty cards stack to one column.

## Known placeholders — do NOT report as bugs

- Clinic logos in the trust bar are plain text placeholders (`Clínica Aurora`, `Centro Médico Vital`, etc).
- Testimonial names (`Dra. Marta Rivas`, `Iván López`, `Carla Domínguez`, ...) are placeholders.
- Phone is `wa.me/34000000000` and email is `hola@nexora.co` — both placeholders.
- All `Empezar gratis` buttons currently navigate to `/dashboard?...`; the Stripe / signup flow is not wired yet.
- `npm run lint` (= `tsc --noEmit`) reports 4 preexisting errors in `server/routes/staff.ts` and `src/pages/LoginPage.tsx`. They are NOT introduced by marketing changes; do not try to fix them in a marketing PR.

## Recording tips

- Maximize Chrome before recording: `wmctrl -r :ACTIVE: -b add,maximized_vert,maximized_horz`.
- A useful end-to-end script for a recording: home → scroll through every section → open `Especialidades` dropdown → click `Clínicas dentales` → scroll to its testimonial → open the dropdown again from the specialty page → click `Fisioterapia` → confirm a different image and a different testimonial → go back home → click the floating button and confirm the panel.
- The browser console is only available when Chrome is the foreground window. If `computer.console` returns `Chrome is not in the foreground`, just rely on the visual/DOM evidence in the screenshots — do not get stuck trying to refocus repeatedly.

## Devin Secrets Needed

None. The marketing pages do not require any auth, secret or backend service.
