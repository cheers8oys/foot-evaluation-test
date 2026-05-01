# AGENTS.md

## Snapshot

- This repository is still a minimal Next.js App Router boilerplate.
- Do not assume product implementation has started just because product docs exist.
- Current app surface is intentionally small: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`.

## Non-Negotiables

- State assumptions explicitly before implementing when they materially affect the result.
- If something is unclear or there are multiple valid interpretations, surface them. Do not pick silently.
- Prefer the simplest solution that fully solves the request. No speculative abstractions, no extra features, no future-proofing by default.
- Make surgical changes only. Every changed line should trace directly to the request.
- Match existing style and structure unless the user asked for a change.
- Do not overwrite user changes. Check `git status --short` before editing.

## Execution

- Turn the request into a verifiable goal before writing code.
- Use TDD for product code when practical: fail a test first, implement the minimum fix, then verify.
- Before commit: `npm run format`, `npm run lint`, `npm run typecheck`, `npm run test:run`, `npm run build`
- Before push: `npm run verify`
- Never use `git add .`. Stage only intentional paths.

## Lazy Context

Load only the file needed for the task:

- Engineering guardrails: `docs/engineering-guardrails.md`
- Implementation plan: `docs/plan.md`
- Product requirements: `docs/siztank-foot-type-test-prd-v1.2-implementation.md`
- Screen specification: `docs/siztank-foot-type-test-screen-spec-v1.0.md`
- Munjaon integration: `docs/munjaon-alimtalk-integration-guide.md`
