---
version: alpha
name: PHENOMENA
description: Visual and interaction system for a browser-based interactive physics laboratory.
---

# PHENOMENA — Design System

## Overview

**Design direction:** *A dark, precise scientific instrument inside a contemporary museum — where the simulated phenomena, not dashboard chrome, are the hero.*

The app should feel like a thoughtfully constructed exhibit rather than a space shooter or generic analytics dashboard. The laboratory canvas dominates. Controls are explicit but quiet. Numerical readouts add credibility, and the relationship between an action and its physical result remains immediately legible.

Initial release: **GRAVITY**. WAVES and MOTION are future laboratories, not empty or misleading navigation destinations.

### First-glance hierarchy

1. **Phenomenon:** the animated orbital scene and its trails occupy most of the viewport.
2. **Manipulation:** a brief instruction and a clearly visible add/launch affordance.
3. **Control:** pause/play, stepping, time scale, and reset are always reachable.
4. **Inspection:** selected body's mass, position, velocity and exact values; secondary to the scene.
5. **Explanation:** clearly accessible notes on the numerical model and approximation.

Avoid a marketing hero above the simulation, four equal KPI cards, decorative neon gradients and a compulsory onboarding overlay. This is a usable tool on first load.

## Colors

Dark appearance only for the initial release; do not add an untested light-mode toggle.

| Token | Value | Purpose |
| --- | --- | --- |
| `--background` | `#080D16` | Deep ink lab background |
| `--surface` | `#111C2B` | Inspector, header, panels |
| `--surface-raised` | `#1B2A3B` | Hover/select overlays or raised controls |
| `--border` | `#354759` | Structural dividers and component outlines |
| `--text` | `#F0F5F7` | Essential text |
| `--text-muted` | `#B4C4CF` | Secondary labels/units |
| `--accent` | `#78E6D1` | Selected object, deliberate action, trajectory emphasis |
| `--accent-secondary` | `#AC9BFF` | Secondary bodies/paths |
| `--warm` | `#F2BB79` | Reference mass or orbital center |
| `--danger` | `#FF9AA2` | Invalid state and destructive action warnings |
| `--focus` | `#FFE2A3` | Keyboard focus ring |

These are visual baseline tokens, not a claim that every possible foreground/background combination meets contrast targets. Check the **actual implemented combinations** against WCAG AA: ordinary text ≥4.5:1 and non-text UI indicators ≥3:1 where applicable. All errors and selections must also have textual/shape indicators; no color-only status.

Canvas scene: almost-black navy, discreet reference grid (off by default on narrow screens), opt-in vectors in mint with arrowheads, orbit trails in restrained copper/mint/lilac. Use fading trail opacity and bounded history, not bright glows that obscure trajectories. Color is not a proxy for physical state; selected-body ID and properties remain available as text.

## Typography

- UI text: system sans with explicit CJK fallback: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans JP", sans-serif`.
- Numerical readouts: `ui-monospace, "SFMono-Regular", Consolas, monospace`; use tabular numerals and consistent signed-decimal formatting.
- Main app heading: 20–24px, weight 650; section heading: 15–17px, weight 600; body: 14–16px; labels/metadata: 12–13px where contrast remains sufficient. Essential controls must not rely on sub-12px text.
- Use comfortable Japanese labels and descriptive, unit-bearing readouts: `質量 800 [モデル単位]`, `速度 vx +24.50, vy −6.10 [単位/秒]`.
- Avoid gratuitous all-caps technical microcopy. Branding may use `PHENOMENA` in a compact masthead; ordinary interaction labels remain in Japanese.

## Layout

### Desktop (approx. 1024px and wider)

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ PHENOMENA  / GRAVITY                           Single Orbit  ▾  About │
├──────────────────────────────────────────────────┬──────────────────────┤
│                                                  │  BODY INSPECTOR      │
│                                                  │  Object 02           │
│                 ACTIVE CANVAS                    │  Mass / X / Y        │
│                  ORBIT + TRAILS                  │  Velocity vx / vy     │
│                                                  │  Add body form       │
│   drag to launch                                 │  Trails / vectors    │
│                                                  │  Save / Load         │
├──────────────────────────────────────────────────┴──────────────────────┤
│  ▶ / ❚❚   Step     0.5×  1×  2×   Time  12.43s   Reset    Fit view  │
└─────────────────────────────────────────────────────────────────────────┘
```

- Canvas is the dominant region (roughly 68–75% content width). Inspector is 300–360px, not a four-card KPI grid.
- A restrained top bar identifies the lab/preset. Playback controls belong in a single consistent transport bar, not scattered around the scene.
- Position, velocity, body count and simulation time update without causing panel width shifts. A subtle selection reticle is preferable to bouncing panel animations.

### Mobile (390px and 320px)

- Place a compact header, a large interactive Canvas (target roughly 42–52vh, at least 240px where the viewport allows), then the time controls and inspector as an ordinary scrolling panel.
- Preserve play/pause, reset, **Add body**, selected-object details and numeric editing; hide optional grid/readout decoration before removing functionality.
- Launch gesture should not conflict with page scrolling: pointer/touch handling is confined to the interactive Canvas and `touch-action` is set deliberately on that region only.
- Body-inspector groups can expand/collapse to reduce vertical scanning; do not trap the user in a full-screen overlay for basic operations.
- At 320px, controls may wrap into two rows. Do not use a single unbroken toolbar or horizontal scrolling as the primary control method.

## Elevation & Depth

- Scene is visually deepest; inspector has a simple border and subtly distinct fill.
- One transient tooltip, popover or confirmation dialog at a time. Use a real modal only for replacement of unsaved work or a genuinely destructive action.
- No all-over glassmorphism or heavy background blur; prevent reducing Canvas contrast and text legibility.

## Shapes

- Corners: 6px for inputs, 10px for panels and dialogs; use full-round only for physical body markers or meaningful toggles.
- Physics bodies are circles whose **visual radius follows a deterministic, capped mass mapping**, not purely decorative random sizes. Selection adds a ring/crosshair while keeping the object visible.
- Motion trails have rounded line joins and taper/alpha attenuation; numeric values stay sharp and stable.

## Components and interactions

### Canvas / Scene

- Pointer-down in empty space starts a projected new body; pointer drag extends a **velocity arrow**, and release launches. Before release, show mass and approximate speed without blocking the trajectory. A brief ghost body and dashed vector clarify the relationship.
- Select an existing body by click/tap; highlight and reflect the same selection in the inspector and textual body list.
- During a paused session, dragging a selected body repositions it; while running, the gesture selects without moving it. Make this distinction evident in hint text.
- Provide numeric form fields with proper labels and units for exact/keyboard editing; avoid slider-only control for values whose numerical precision matters.
- Zoom and pan act on the camera. **Fit view** is a stable recovery action. The camera may adapt its fit to bodies when presets change but should not continuously reframe and cause motion sickness.
- Provide a small visible legend for trail/vector controls when enabled and a way to hide trails. Body identities remain textually distinguishable.

### Controls / data presentation

- A play/pause **button** shows action and state text, not only an ambiguous icon. `Step` is disabled while playing. Speed choices visibly identify the selected multiplier.
- Inputs constrain their documented range and show inline validation errors. Invalid data never mutates the running model.
- Save action gives clear confirmation. Load/reset replacement warns about unsaved modifications. Persisted state has a human-readable label and does not pretend to be a synced cloud artifact.
- The model explanation is accessible from **About this simulation**, with plain descriptions of arbitrary units, numerical time-stepping, softened gravity and merge collisions.
- Error state stops simulated time and surfaces an actionable way to restore the current preset. No blank Canvas or silent restart.

### UI motion

- Physics motion is essential to the laboratory and intentionally user-controllable by pause, speed and step.
- UI animations (panel transitions, tooltip movement, reveals) are ≤150ms, subtle, and disabled/reduced when `prefers-reduced-motion` is active.
- Do not degrade physical model correctness to create decorative motion. Rendering can interpolate the display between completed fixed simulation steps but must not feed interpolation back into the solver.

### Accessibility

- Canvas has a meaningful accessible label and a brief keyboard-access explanation; it is not the only control surface.
- A structured body list supports selecting an object with keyboard and screen reader. Add/edit operations use labeled inputs and conventional form submission.
- All actionable controls have a visible focus ring, accessible names and unambiguous enabled/disabled semantics. Avoid live-announcing continuously changing positions every frame.
- When pausing, resetting, saving or encountering an error, announce the *discrete outcome* via a restrained status message when useful.
- Preserve meaningful contrast, large enough touch targets (aim approximately 44×44px), and standard zoom/text scaling without clipped inputs.

## MVP page anatomy

1. **Lab stage:** first-load orbital scene, trajectory trails, contextual drag hint.
2. **Transport:** play/pause, step, speed, elapsed simulated time, reset, fit.
3. **Inspector:** selected object and editable physics properties, body list, add-body form.
4. **Observability:** body count and non-intrusive display toggles.
5. **About model:** numerical assumptions, simplified collision behavior, units and reproducibility note.

No login screens, profile navigation, pricing CTA, fake inactive tab-bar, template hero section, or decorative dashboard KPI blocks.

## Rendered acceptance and design QA

- Check real Chromium/Playwright renderings at **1440px, 390px, 320px** and at a modest-height mobile viewport. Confirm readable labels, no horizontal overflow, no accidental gesture conflict and visible focus in each layout.
- Check initial orbit while playing; pause; numeric add; touch/pointer vector launch; selection; reset with unsaved state; local save/load; invalid input; 16-body limit; bad saved data.
- Check semantic keyboard order and focus (Tab, Shift+Tab, Enter, Escape), screen-reader names where possible, and accessible equivalent to Canvas manipulation.
- Record code commit SHA, URL, viewport and test run for each acceptance screenshot/trace. Treat a real rendered/interactive UI as distinct from a successful build, HTTP 200 or Vercel READY.
- Inspect long Japanese labels, CJK font fallback, number formatting, error wrapping, and zoom at 200%.
- Measure observed rendering performance with representative object/trail counts; reduce costly visual effects before adding background computation infrastructure.

## Do's and Don'ts

**Do:** prioritize the experiment scene; make cause/effect visually obvious; use repeatable presets; keep numerical inputs legible; test all critical interaction modes; show model limits without overburdening first-time users.

**Don't:** hardcode scripted orbits while claiming physics; add a 3D engine for spectacle; use gradients/cards everywhere; use color alone to signal correctness; create a shared multi-lab physics framework before a second lab exists; publish inactive placeholders as working features.