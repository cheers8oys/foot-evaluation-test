# AGENTS.md

## Project Snapshot

This repository is currently an empty boilerplate for a Next.js App Router project. Do not assume product implementation has started.

Tech stack:

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- ESLint

Current app code is intentionally minimal:

- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`
- empty placeholder directories under `src/components`, `src/lib`, `src/styles`, `src/types`

## Working Rules

- Before implementing product features, read only the specific document needed for the task.
- Keep the codebase generic until a feature request explicitly starts product implementation.
- Do not add product-specific routes, constants, components, copy, API handlers, or integrations unless requested.
- Prefer small, scoped changes that match the existing Next.js + TypeScript + Tailwind setup.
- Do not overwrite user changes. Check `git status --short` before making edits.

## Security Rules

These rules are mandatory for every task.

- Never commit secrets or credential material: `.env`, `.env*.local`, API keys, access keys, sender keys, service account JSON, private keys, session token secrets, Vercel secrets, Google credentials, or Munjaon credentials.
- Never expose server-only secrets through `NEXT_PUBLIC_` variables.
- Never commit real personal data: names, phone numbers, Google Sheets CRM exports, message request/response payloads, screenshots with personal data, or logs that contain personal data.
- Never log full external API request/response bodies when they may include names, phone numbers, message content, result URLs, or provider credentials.
- Log only safe operational fields such as internal error code, provider result code, and message group ID.
- Never commit generated or local artifacts: `node_modules`, `.next`, `out`, `build`, `.vercel`, coverage output, cache directories, or local debug logs.
- Keep `.gitignore` aligned with these rules whenever new tools create local artifacts.
- Do not run `npm audit fix --force` without explicit approval. It may introduce breaking dependency changes.

## TDD and Verification Rules

- Use TDD for product code: write or update a failing test first, implement the smallest code needed, then refactor with tests passing.
- Domain logic, validation, API handlers, state utilities, and integration adapters must have automated tests.
- UI work must include a render/interaction test when practical. If not practical, document the manual verification steps in the task summary.
- Do not consider code complete until formatter, linter, typecheck, tests, and build all pass.
- If a test cannot be added for a change, state the reason and residual risk in the final summary.

## Git Safety Rules

- Before editing, run `git status --short` and account for existing user changes.
- Do not use `git add .`. Stage only intentional paths, for example `git add AGENTS.md package.json`.
- Before every commit, run:

```bash
npm run format
npm run lint
npm run typecheck
npm run test:run
npm run build
```

- Before every push, run:

```bash
npm run verify
```

- Inspect staged changes before committing:

```bash
git diff --cached --stat
git diff --cached
```

- Do not commit or push when any verification command fails.

## Lazy Context Map

Read these only when the task requires that context:

- Implementation plan: `docs/plan.md`
- Product requirements: `docs/siztank-foot-type-test-prd-v1.2-implementation.md`
- Screen specification: `docs/siztank-foot-type-test-screen-spec-v1.0.md`
- Munjaon Alimtalk/SMS integration: `docs/munjaon-alimtalk-integration-guide.md`

## Useful Commands

```bash
npm run dev
npm run build
npm run format
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run test:run
npm run verify
```

Dependencies may not be installed yet. If `node_modules` is missing, install dependencies before running the scripts.

## Git Notes

- Remote: `https://github.com/cheers8oys/foot-evaluation-test.git`
- Main branch: `main`
- Initial boilerplate was committed as `Init Setting`.
