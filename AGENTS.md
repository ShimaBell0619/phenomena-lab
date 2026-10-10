# PHENOMENA — AI development rules

Source: [Web App Foundation AGENTS.md](https://github.com/ShimaBell0619/web-app-foundation/blob/b97a0d93cb9f7cedf2c534f1478de95729d6090f/AGENTS.md), adopted for this app. Preserve Foundation's security and quality boundaries; consult its pinned full document for details.

## Authority and scope

- `PRODUCT.md` is the approved product behavior/constraints/acceptance contract; `DESIGN.md` is the approved UI/UX contract. Do not change either silently when implementing a feature.
- The user request and approved Issue acceptance criteria define scope. Do not introduce WAVES, MOTION, authentication, backend, analytics or paid services until specifically requested.
- Use `README.md` for setup and `docs/VERIFICATION.md` for application acceptance. Issues/PRs are evidence, not a second copy of the current product contract.

## Chat and Work

- **Chat-first:** research, design, code, tests, PR, CI, and live verification are executed from Chat where tools and authorization allow.
- **Work only on explicit user request.** Never silently switch to Work or treat a failed tool as permission to use a new service.
- Never confuse source changes, CI success, Vercel READY, HTTP success and actual browser rendering.

## Git and approvals

- Start nontrivial changes from a pinned `main` SHA on a short-lived branch; use PR + required successful CI; do not push routine work straight to `main` or force-push.
- Keep feature/fix PRs limited; use Conventional Commit titles and explicit acceptance evidence. Follow GitHub protected-main rules when configured.
- Require explicit authorization before changing authentication, permissions, secrets, paid services, external destinations, public URLs, product contract, data retention, irreversible behavior or deployment trust boundaries.
- Record final commit SHA, exact CI run, deployment URL and browser QA evidence. Never claim unrun tests have passed.
- High-risk changes to privileged workflows, publication, concurrency, authorization, or data integrity require independent review before merge/activation where available; `@codex review` requires separate approval **each time**. Automatic Codex PR review stays OFF.

## Implementation

- React + TypeScript + Vite + npm. Keep the Newtonian solver pure and independently testable; rendering and camera controls must not change simulated state.
- Prefer simple code and real acceptance-driven tests. Avoid speculative frameworks/abstractions or additional services.
- Maintain genuine `npm ci`, `check`, `typecheck`, `test`, `build`; don't add no-op scripts. Run them again after substantive changes.
- Use keyboard-accessible semantic controls for every essential Canvas operation; test at desktop and narrow/mobile viewport sizes.
- No secrets or user-private datasets in the public repository, Issues, PRs, Actions logs or browser bundles.