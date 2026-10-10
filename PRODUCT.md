# PHENOMENA — Product Contract

Status: Phase 2 product definition / initial development baseline (2026-10-10)

## 1. Purpose

PHENOMENA is a hands-on physics laboratory in the browser. Its promise is to let people **change initial conditions and discover the resulting motion**, rather than choose from scripted outcomes. The physics is an explicitly simplified, reproducible model; it is not a scientific prediction service or a realistic model of the Solar System.

The first deliverable is **GRAVITY**, a complete, enjoyable two-dimensional gravitational sandbox. **WAVES** and **MOTION** are future laboratories, not features required for the first release. Do not show them as active, nonfunctional tabs.

## 2. Users and their primary jobs

- **Curious first-time visitor:** open the site and immediately see an orbit, then change a body and understand that the trajectory responds.
- **Exploratory user:** create and launch bodies with pointer or touch input, tune their initial conditions, pause time, and retry a scenario.
- **Learning-oriented user:** inspect positions, masses, velocities and trajectories; compare an outcome with the same repeatable initial state.
- **Keyboard-only user:** create, select, edit, run, and reset an experiment without depending on Canvas drag gestures.

The product should explain itself through interaction, not through a mandatory tutorial, account, or lengthy setup.

## 3. Initial release scope — GRAVITY

### 3.1 First-load experience

- Show a named **Single Orbit** preset immediately; its simulated motion is visible when the page opens.
- The user can select **Single Orbit**, **Binary Dance**, or **Three-Body** presets. Presets have fixed data and reproducible initial conditions; Three-Body is not promised to form a stable orbit.
- Show at least one clear instructional cue: **Drag on empty space to launch a body**. Do not cover the active simulation with a modal tutorial.
- The canonical **Single Orbit** initial condition uses masses `800` and `5`, a separation of `160` world units, and softening-aware circular relative speed `v = sqrt(G × (800 + 5) × 160² / (160² + epsilon²)^(3/2))`. Positions and opposing tangential velocities are allocated about a stationary center of mass. This is a reproducibility fixture, not a promise of an analytically perfect orbit.
- Binary Dance and Three-Body must likewise be checked-in, versioned preset datasets rather than randomized arrangements. A reset always reloads their original numeric conditions.
- The user can start/pause, step forward one physics step when paused, change playback speed to 0.5×/1×/2×, and reset to the selected preset.

### 3.2 Direct manipulation and editing

- On an empty portion of the laboratory, pointer-down establishes a spawn position; dragging displays an initial-velocity arrow; releasing creates and launches a new body. The mapping must be based on world coordinates rather than raw screen pixels, so zoom does not silently change physical initial velocity.
- Clicking/tapping an existing body selects it; its mass, position, velocity components and numeric values can be inspected and edited in a labeled inspector.
- While paused, a selected body can also be repositioned by dragging it. While running, dragging an existing body must not silently teleport it.
- Keyboard and touch users have a labeled **Add body** form with position (x, y), initial velocity (vx, vy) and mass; the same actions must not require pointer dragging.
- Support 1–16 bodies; attempts to exceed the limit produce an understandable message without partially changing state. Object selection must be possible despite closely spaced bodies, using a consistent picking rule.
- Resetting a modified experiment and loading a saved one both require a clear indication that the current unsaved state will be replaced. Do not silently destroy ongoing edits.

### 3.3 Physics contract

- A **2D Newtonian N-body model**: bodies mutually attract according to their masses and separation. Use a pairwise gravitational interaction with a small **softening length** to keep close approaches numerically bounded. The model uses **arbitrary laboratory units**, not kilograms, real astronomical distances or a calibrated Solar System.
- Establish a single documented and tested model baseline: gravitational coefficient `G = 1000` (lab units), softening length `epsilon = 4` (world units), fixed integration step `dt = 1/120` simulated seconds, and **velocity Verlet** integration. Changing these constants later changes the simulation contract and requires tests and a product decision.
- Distances, speeds and mass are shown as **laboratory units**; do not label them as real SI measurements. Use a fixed camera/world-coordinate transform independent of simulation integration.
- Collision behavior: when body disks overlap, merge them into one body. Preserve **total mass** and **linear momentum** at merge; set new position to the center of mass. For the MVP, collision radius is `min(30, 2 + 0.5 × sqrt(mass))` in world units. These stylized radii are modeling parameters, not physical planet sizes. Clearly describe merging as a modeling simplification.
- Motion is calculated, not keyframed. Identical serialized initial conditions, physical constants and step counts must produce identical state within the same implementation/runtime, with numerical tolerance used where appropriate in tests.
- Use fixed-step simulation decoupled from rendering. Browser-tab inactivity must **not** trigger a large catch-up burst; freeze elapsed simulation time during inactivity or large frame gaps. Cap simulation catch-up steps per rendered frame to avoid hanging the UI.
- If data becomes non-finite or otherwise invalid, stop the simulation with a visible recoverable error and never render bogus trajectories or persist corrupted state.

### 3.4 Observe and explore

- The viewport displays bodies and persistent-but-bounded trajectory trails. Toggling **Trails** and **Velocity vectors** affects the visualization only, not the simulated physics.
- Show simulation time, active body count and selected-body information as text. Show the meaning and units for velocity and mass.
- Camera pan and zoom are permitted but must not modify body positions or velocities. Provide **Fit view** to recover an off-screen experiment.
- A small model explainer states that the simulation is an approximation and that close approaches, collision merging and finite time steps can affect accuracy. Do not imply exact energy conservation across collisions.

### 3.5 Local persistence

- No account, cloud database, tracking identifier or external physics API is needed.
- **Save experiment** stores exactly one named current experiment snapshot in browser LocalStorage (physical state at a step boundary, settings, selected preset label, schema version). **Load saved experiment** restores that state; **Reset preset** instead restores the preset's original conditions.
- Validate the schema and numeric bounds when loading. Missing/corrupt/old unsupported data shows a concise recoverable error; a fresh preset remains usable.
- Save/load must not perform network requests. Browser storage deletion or use of another device loses the saved experiment; no cross-device sync promise.

## 4. Product constraints

- **Repository / hosting:** new application repository is **Public** as requested, with non-sensitive content only. GitHub-hosted source and issues must contain no passwords, tokens or private datasets. The hosted application uses Vercel.
- **Baseline stack:** React + TypeScript + Vite + npm, with a 2D Canvas renderer and accessible HTML controls. No backend, authentication, paid physics engine, WebGL requirement or Web Worker for the MVP.
- **Security / operations:** respect Web App Foundation's `AGENTS.md` and protected-main CI/publication boundary. PR creation must not auto-deploy. Preview and fixed Staging are opt-in through approved requests; Production publishes from `main` only.
- **Offline/network:** the core simulation uses bundled code/assets and requires no external network during a running session. Full offline/PWA installation is not an MVP promise.
- **Accessibility:** primary actions are keyboard reachable and screen-reader labeled; Canvas is supported by an equivalent textual body list and numeric editing path, not treated as the sole way to use the application. Respect reduced-motion preferences for nonessential UI transitions; intentional physics motion has an explicit pause control.
- **Responsive:** key tasks must be possible at 320px, 390px and 1440px widths. Do not hide indispensable controls at mobile widths.
- **Performance envelope:** optimize for up to 16 bodies and bounded trails (recommended limit: ~240 samples per body). Target fluid desktop interaction and usable mobile interaction; actual FPS and memory characteristics must be measured in real browsers. Do not claim a fixed FPS on every device.

## 5. Explicit non-goals for the MVP

- WAVES / MOTION implementation; user-defined mechanical joints or rigid-body stacking.
- Real-world orbital ephemerides, relativistic physics, precise scientific research results, realistic collision deformation, fluid simulation or 3D rendering.
- Multiplayer, account registration, sharing links, social/community features, cloud saves, import/export, telemetry or analytics.
- AI-generated explanations, paid APIs, application backend, database or platform-specific native applications.
- A large reusable physics framework or plugins for hypothetical future laboratories.

### Future laboratories — intent only

- **WAVES:** independently modeled 2D wave interference. At minimum: place two point sources, change frequency/wavelength/phase, and see constructive/destructive interference. Initially use an explicitly labeled analytical wave model; do not claim to solve a full PDE unless implemented and validated.
- **MOTION:** independently modeled pendulum or spring-mass experiments with damping, external impulse and time controls. Choose the first mechanism when that phase is scoped.
- Common controls (run/pause/reset) may be shared later, but do not abstract unrelated solvers merely because all are called physics.

## 6. MVP acceptance criteria

| ID | Area | Pass condition and evidence |
| --- | --- | --- |
| P-01 | First visit | Initial Single Orbit appears and animates in a real desktop and mobile browser; no blank/blocked initial viewport. |
| P-02 | Editing | Pointer/touch launch changes trajectory; the keyboard form creates the same state for the same world-coordinate values. |
| P-03 | Simulation | Unit tests validate pairwise forces, equal-and-opposite interactions, a reproducible no-collision orbit, fixed-step determinism and finite outputs. |
| P-04 | Collisions | A deliberate two-body merge preserves total mass and linear momentum within numerical tolerance; resetting reproduces the original bodies. |
| P-05 | Time | Pause freezes sim time; one-step advances exactly one `dt`; 0.5×/1×/2× changes simulated time rate but not per-step physics; hidden-tab resume has no catch-up jump. |
| P-06 | Limits | Maximum 16-body limit, invalid numbers, duplicate selection and near-zero separation are handled without app crash or NaN persistence. |
| P-07 | Persistence | Save, reload and restore round-trip state; bad storage recovers visibly; reset to preset and load snapshot are distinct operations. |
| P-08 | Accessibility | Keyboard can add/edit/select/reset/play; focused controls visible; labels and error messages accessible; motion can be paused. |
| P-09 | Responsive UI | Real browser verification at 320/390/1440px: no accidental horizontal scroll, clipped critical controls, or blocked interaction; touch targets usable. |
| P-10 | Development | GitHub PR from a working branch, immutable A SHA, real `npm ci`, `check`, `typecheck`, `test`, `build` and representative browser E2E all verified. |
| P-11 | Preview/Staging | After authorized setup, explicit `/preview` and `/staging` cause secure publish; Vercel READY, correct project/ref/SHA, stable Staging HTTP and actual browser rendering evidenced separately. |
| P-12 | Negative CI/CD | Unauthorized command, failed CI, stale PR SHA and superseded Staging do not publish; PR close clears only owned refs. |
| P-13 | Production | Approved PR merges through protected `main`, followed by actual Production deployment and real-browser verification. |

For P-11 through P-13, a CI success, HTTP 200, deployment READY and rendered/interactive browser proof are **separate evidence types**. Do not mark an external acceptance as passed based solely on repository unit tests.

## 7. Release and evolution rules

- `PRODUCT.md` is the approved product behavior source of truth; `DESIGN.md` owns visual/interaction design; Foundation's `AGENTS.md` owns development practice.
- MVP means GRAVITY + the acceptance checks above, not all three proposed laboratories.
- Future experiments must have their own explicit model/accuracy contract and acceptance criteria before development; no speculative extensibility layer now.
- A change to physics constants, merge semantics, persistence compatibility or externally visible behavior requires review and appropriate tests.
- Versioned application GitHub Releases are performed only when the release milestone explicitly requires them. A Production deployment alone is not evidence of a versioned release.