# PHENOMENA — rollout and acceptance plan

This is a verification plan, **not evidence that tests or deployment already passed**. Feature acceptance is defined in PRODUCT.md; layout/UX acceptance in DESIGN.md.

## Gate 1: GitHub repo & CI (Phase 3)

- [x] Create ShimaBell0619/phenomena-lab as a **Public** repository.
- [ ] Upload scaffold; confirm default main and exact source/CI SHA.
- [ ] Generate real package-lock.json with npm registry access, then run npm ci, check, typecheck, test and build.
- [ ] Commit lockfile, open a PR and confirm required CI passes.
- [x] User decision: no main Ruleset for this non-critical public app. Keep PR + CI as operational discipline, not a provider-enforced guarantee.

## Gate 2: Vercel safety (before enabling hosted-review)

- [ ] Independently review all privileged hosted-review kit logic, including Foundation PR #118.
- [ ] Do **not** adopt the Foundation privileged hosted-review kit while main is unprotected. Preview/Staging acceptance is deferred; any alternative must have an independently reviewed trust boundary.
- [ ] Configure Vercel Git Integration: Production=main and allowed refs main, preview/**, staging.
- [ ] Verify trusted callback, source identity, stable staging domain, account mapping, secrets and cost.

## Gate 3: GRAVITY MVP (Phase 4)

- [ ] Verify implemented softened Newtonian N-body physics and velocity Verlet at dt=1/120 by actual CI and browser runs.
- [ ] Momentum-preserving collision merge, safety/limits and preset reproducibility.
- [ ] Canvas and keyboard-equivalent forms, user edit controls, save/load and informative visualization.
- [ ] Unit tests, performance checks, browser keyboard/display QA at 1440px, 390px and 320px.
- [ ] PR branches do not auto-deploy; /preview and /staging deferred until a reviewed non-privileged option exists.
- [ ] Verify actual Vercel READY, HTTP, browser UI, then Production after protected main merge.

A passing build, Git ref movement and HTTP 200 do not by themselves prove correct rendered UI.
