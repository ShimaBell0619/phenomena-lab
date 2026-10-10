# PHENOMENA

An interactive physics laboratory in the browser. The initial lab, **GRAVITY**, is planned as a deterministic 2D Newtonian N-body simulation; later labs are WAVES and MOTION.

**State:** Foundation adoption starter, **not yet the GRAVITY MVP**. Physics simulation, interaction, persistence, browser QA and live deployment are Phase 4 work. This scaffold shows an honest setup screen rather than pretending to simulate orbits.

## Product contract

- [`PRODUCT.md`](PRODUCT.md): user outcomes, physics model, user interaction, constraints and acceptance criteria.
- [`DESIGN.md`](DESIGN.md): scientific instrument visual style and accessible responsive layouts.
- [`AGENTS.md`](AGENTS.md): local AI development/approval rules adopted from Foundation.
- [`docs/VERIFICATION.md`](docs/VERIFICATION.md): acceptance and delivery checklist.

## Setup

Prerequisite: Node.js **24.20.0** (`.node-version`) and npm. After obtaining the repository:

```bash
npm install
npm ci
npm run check
npm run typecheck
npm test
npm run build
npm run dev
```

`npm install` creates the real `package-lock.json`. **Commit that generated lockfile before opening a PR or enabling CI**; do not hand-author or fake a lockfile. The scaffold was assembled offline and dependencies have **not** been installed or checked in CI.

## Foundation adoption

- Foundation source: `ShimaBell0619/web-app-foundation` main commit `b97a0d93cb9f7cedf2c534f1478de95729d6090f` (v0.12.1 + repository-creation kit fix).
- Reusable CI workflow is pinned to that full commit SHA in `.github/workflows/ci.yml`.
- Hosted-review Vercel kit is **not installed/activated**. Privileged hosted-review code is awaiting independent review and PR #118 decision; do not enable it until main protection is enforced and reviewed kit SHA is selected.
- `vercel.json` restricts allowed Vercel Git refs once integrated, but *no Vercel project or domain is configured by this scaffold*.

GitHub repository visibility: **public**, with non-sensitive content only. No open-source license is granted until one is deliberately selected.