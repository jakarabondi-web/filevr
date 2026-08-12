# Filevr

Document productivity platform — convert, compress, sign, merge, OCR, and edit files from one workspace. Implementation of `Filevr — Implementation-Ready Product & Design Specification v1.0`.

## Stack

Next.js 16 (App Router), TypeScript, Tailwind CSS v4, lucide-react. See `.env.example` for adapter environment variables.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run typecheck` — TypeScript, no emit
- `npm run lint` — ESLint
- `npm run test` — unit tests (Vitest)

## Status

This is a Phase 1 vertical slice per spec section 21:

- Homepage (editorial workbench) matching the reference mockup, responsive at 1440/1024/768/375.
- Upload queue as a reducer/state machine (`lib/upload/queue-reducer.ts`) with file validation, retry, and unit tests.
- Mocked job/upload APIs (`app/api/**`) backed by an in-memory store and a fake progress adapter, behind a `DocumentProcessor` interface (`lib/jobs/processor.ts`) so real workers can be swapped in later.
- Compress PDF wired end-to-end: upload → job → polling task shell → result/download.
- `/tools` directory and `/tools/[tool-slug]` SEO pages, data-driven from `config/tools.ts`.
- `/workspace` routes (files, signatures, billing, settings) with mocked data.

Auth, storage, billing, and analytics are adapter seams (`lib/auth`, `lib/storage`, `lib/analytics`) with safe local mocks — see `.env.example` for the environment variables a real integration needs, and inline `TODO`s for unresolved vendor choices.

## Not yet implemented

Direct-to-storage signed uploads, real queue/workers, authentication, Stripe billing, Sign/Edit editors, and the remaining five launch tools' full configuration flows are stubbed or out of scope for this slice — see spec section 19 (delivery phases) for the intended order.
