# PHENOMENA — Interactive Physics Laboratory

**Live GRAVITY:** https://phenomena-lab.vercel.app

A hands-on physics laboratory in the browser. The first working experiment, **GRAVITY**, is a deterministic 2D Newtonian N-body simulation. WAVES and MOTION are future labs and are not falsely shown as implemented.

## What you can do

- Observe **Single Orbit**, **Binary Dance**, or **Three-Body** simulations driven by the same physics engine
- Pause, step a fixed 1/120 second, choose playback speed, reset a preset or fit the view
- Drag empty space to launch a body with an initial velocity, or use the accessible numeric form
- Select, edit and reposition bodies while paused; pan with Shift+drag, zoom with the wheel
- Toggle trails and velocity vectors; observe mass, velocity, position and simulated time
- Save and restore one experiment in your browser (versioned and validated localStorage; no cloud sync)

This is a **simplified laboratory-unit model**, not an astronomical prediction. Close approaches are softened; touching disks merge conserving mass and linear momentum, not energy.

## Product and design contract

- [PRODUCT.md](PRODUCT.md) — required behavior, physics constants, limits, product non-goals and acceptance boundaries
- [DESIGN.md](DESIGN.md) — visual identity, interaction, accessibility and responsive behavior
- [AGENTS.md](AGENTS.md) — Chat-first implementation, change/review practices and approval boundaries
- [docs/VERIFICATION.md](docs/VERIFICATION.md) — completed test evidence and the explicit deferred items

## Development

Node.js **24.20.0** (see `.node-version`) and npm.

```bash
npm ci
npm run check
npm run typecheck
npm test
npm run build
npm run dev
```

The actual npm-generated `package-lock.json` is committed. `npm test` runs deterministic physics and application checks. The [reusable Foundation CI](.github/workflows/ci.yml) runs the build/test contract, while [Chromium acceptance](.github/workflows/browser-smoke.yml) performs real browser interaction tests at **1440px, 390px, and 320px**, saving screenshots as Actions artifacts. On main, the browser test also visits the **public Production URL**.

## Deployment and safety

- Source is the **public** [phenomena-lab GitHub repository](https://github.com/ShimaBell0619/phenomena-lab). No license is granted until separately selected.
- Hosted on Vercel Hobby, with Production bound to **main** and preview auto-deployments disabled.
- The Owner expressly chose **not** to require branch protection or rulesets for this non-critical app. PRs and CI remain normal development practice, not enforced provider restrictions.
- The privileged Foundation `/preview` / `/staging` Workflow is **not installed** because its current design requires protected main. Those acceptance tests remain deferred; do not treat simple production Git integration as equivalent.
- No backend, authentication, analytics, cloud data storage, project secrets or paid physics APIs.

## Verified delivery

- GRAVITY feature: [PR #4](https://github.com/ShimaBell0619/phenomena-lab/pull/4), real [build/unit CI](https://github.com/ShimaBell0619/phenomena-lab/actions/runs/38039425007)
- Browser interaction acceptance: [PR #6](https://github.com/ShimaBell0619/phenomena-lab/pull/6), [Chromium run](https://github.com/ShimaBell0619/phenomena-lab/actions/runs/38039807198)
- Screenshot-based mobile/numeric polish: [PR #8](https://github.com/ShimaBell0619/phenomena-lab/pull/8), [Chromium run](https://github.com/ShimaBell0619/phenomena-lab/actions/runs/38040040620)
- Public Production real-browser check: [PR #10](https://github.com/ShimaBell0619/phenomena-lab/pull/10), [main Chromium run](https://github.com/ShimaBell0619/phenomena-lab/actions/runs/38040311778) (HTTP 200 and interactive UI verified)

A passing static check, Vercel READY, HTTP 200 and actual browser execution are distinct kinds of evidence.
