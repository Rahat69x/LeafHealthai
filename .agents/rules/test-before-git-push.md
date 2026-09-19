# Test Before Every Git Push Rule

Before pushing any update to GitHub for this repository, follow this checklist every single time — no update goes live without passing through it:

## 1. Local Check

- Run the project locally (`npm run dev`) and test every page/route affected by the change.
- Confirm no console errors or warnings appear in the browser developer tools.

## 2. Functionality Check

- Click through every button, link, and interactive element touched by this update — confirm each performs as expected.
- If the update touches animations (glass effects, ripples, parallax, carousels), confirm they run smoothly with no flicker, lag, or layout shift.

## 3. Responsive Check

- Test across mobile viewports (375px, 390px), tablet viewports (768px), and desktop viewports (1280px+).
- Confirm nothing overflows, overlaps, or breaks across screen sizes.
- On touch devices, verify tap/press states work correctly (not just hover states).

## 4. Build Check

- Run `npx tsc --noEmit` to verify type safety.
- Run `npm run lint` to verify code quality.
- Run `npm run build` locally and confirm the production build completes with zero errors.
- Fix all build-time errors or warnings before proceeding — never push a broken build.

## 5. Regression Check

- Confirm existing features outside the update still work (navigation, scan workflows, previous pages, forms, links) — ensure no collateral breakage.

## 6. Only After All Checks Pass

- Commit with a clear, specific message describing what was changed.
- Push to GitHub.
- Confirm Vercel's deployment succeeds (check build logs / status) — if deployment fails, fix immediately.
- Open the live URL after deploy and do a final verification check that the update appears correctly in production.

**Golden Rule:** If any check in steps 1–5 fails, stop and fix it first. Never push an update that hasn't passed local testing just to "try it live."
