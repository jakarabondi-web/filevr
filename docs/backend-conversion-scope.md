# Real conversion: backend scope

Today Filevr converts nothing. `MockDocumentProcessor` advances a counter on a
500 ms timer and marks the job complete; `lib/storage` returns URLs pointing at
`/api/uploads/mock-put` and `/api/downloads/mock-get`, neither of which exists;
the result screen's Download button is `href="#"`. No code path reads an
uploaded byte.

The good news is that the seams are already in the right places, and
`.env.example` already commits to the target stack: PostgreSQL, S3-compatible
storage, a Redis-backed queue, Stripe, and Auth.js/Clerk. This document scopes
the work to make conversion real against that stack.

## Bottom line

A credible v1 across all six tools is roughly **10–13 engineer-weeks**, and that
assumes two scope decisions go the pragmatic way: buy PDF→Word rather than build
it, and ship Edit as page operations rather than true text editing. Building
everything in-house at full fidelity is a 6-month project.

The single biggest lever is **build vs buy**. A conversion API (CloudConvert,
Adobe PDF Services, Nutrient) could cover all six tools in 2–3 weeks of
integration, at a per-operation cost and with documents leaving your
infrastructure. Self-hosting costs more engineering time and carries real
security burden, but keeps files in your perimeter and makes marginal cost
mostly CPU.

## What has to change

| Area | Today | Needs to become |
|---|---|---|
| Job store | `lib/jobs/store.ts`, in-memory `Map` | Postgres, via Prisma or Drizzle |
| Processing | `MockDocumentProcessor` timer | BullMQ producer; worker consumes |
| Storage | Stub URLs to nonexistent routes | S3/R2 presigned PUT and GET |
| Client upload | `simulateUpload` timer, bytes never leave the browser | Real PUT to storage with progress |
| File IDs | Client queue IDs (`qf_1_…`) sent to `/api/jobs` | Server file IDs from `/api/uploads` |
| Upload complete | TODO comment | Verify bytes, sha256, sniff MIME, AV scan |
| Download | No route; button is `href="#"` | `/api/downloads/[fileId]`, presigned, expiring |
| Page count | Typed but never set | Set by the engine; drives quotas and billing |

The `DocumentProcessor` interface, the idempotency key on `POST /api/jobs`, the
`storageKey` field, and `expiresAt` on every file are all already correct. They
were designed for this and do not need rework.

## Architecture

Processing must not run in serverless functions. Ghostscript, LibreOffice, and
Tesseract are large native binaries, conversions routinely exceed function
timeouts, and the work is CPU-bound. Workers belong in long-running containers
(Fly.io, Railway, ECS, or GKE); the Next.js app stays on Vercel and only ever
issues presigned URLs, writes rows, and enqueues.

Flow: the browser uploads directly to object storage with a presigned PUT, then
calls the API to create a job. The API writes to Postgres and enqueues to Redis.
A worker leases the job, pulls the input from storage, runs the engine in a
sandbox, writes the output back to storage, and updates Postgres. The browser
polls job status and finally requests a presigned download.

## Engines, tool by tool

| Tool | Engine | Difficulty | Note |
|---|---|---|---|
| Compress | Ghostscript | Low | Well-solved; good first tool to prove the pipeline |
| Merge | qpdf or pdf-lib | Low | Pure page assembly |
| OCR | OCRmyPDF (Tesseract + Ghostscript) | Medium | CPU-heavy; language packs inflate the image |
| Edit — page ops | pdf-lib | Low | Rotate, delete, reorder, insert |
| Edit — text editing | — | Very high | Font subsetting and reflow; a product in itself |
| Sign — self-sign | pdf-lib | Low–medium | Stamp an image or drawn signature |
| Sign — request + audit | PAdES, RFC 3161 timestamps | High | Legal weight, audit trail, certificates |
| PDF → Word | LibreOffice, pdf2docx, or a vendor | High | The fidelity cliff |

PDF→Word is where in-house effort goes to die. PDF describes glyph positions,
not paragraphs, so producing an editable Word file means reconstructing
structure that was never recorded. LibreOffice's output is passable for simple
text and poor for anything with columns or tables. This is the strongest
candidate for buying.

Edit and Sign each hide a second, much larger product behind the same label.
Both need an explicit scope decision before estimating.

## Phased plan

**Phase 0 — Foundations (2–3 weeks).** Postgres schema and migrations replacing
the in-memory store; S3/R2 wired into `lib/storage` with presigned PUT; a real
`/api/uploads/[fileId]/complete` that HEADs the object, verifies size and
sha256, and sniffs the true MIME from magic bytes; rewire the client to actually
upload with real progress; add the download route. No conversion yet, but every
byte moves for real.

**Phase 1 — Queue, worker, first tool (2 weeks).** Redis and BullMQ; a worker
container with Ghostscript; job leasing, progress reporting, retries, and a
dead-letter queue; deploy the worker. Ship Compress end-to-end. This phase
proves the entire path and de-risks everything after it.

**Phase 2 — Merge and OCR (1.5–2 weeks).** Both slot into the Phase 1 harness.
OCR needs worker CPU sizing and a decision on which language packs to ship.

**Phase 3 — PDF → Word (3–5 days buying, 2–4 weeks building).** Gated on the
build-vs-buy decision.

**Phase 4 — Sign and Edit (2.5 weeks at the narrow scope).** Self-sign stamping
plus page operations. The full-fidelity versions are separate projects: add 4–6
weeks for signature requests with an audit trail, and 6–10 weeks for true text
editing.

**Phase 5 — Hardening (2–3 weeks).** Worker sandboxing, ClamAV, decompression
bomb limits, the retention sweeper that makes "auto-deleted" true, quota
enforcement tied to plans, observability, and a load test.

## Risks

**Untrusted input is the main one.** Ghostscript and LibreOffice both have long
histories of remote-code-execution CVEs, and every file a stranger uploads is
adversarial input to them. Workers need to run with no network egress, a
read-only filesystem, dropped capabilities, strict CPU and memory limits, hard
timeouts, and ideally gVisor or Firecracker isolation. Disable LibreOffice
macros explicitly. Treat a compromised worker as a question of when.

**Decompression bombs and pathological PDFs** can pin a worker indefinitely.
Cap page count, uncompressed size, and wall-clock per job, and fail loudly.

**The privacy rail makes three promises** — private by default, auto-deleted,
encrypted. Right now none of them is enforced by anything. Storage lifecycle
rules plus a sweeper job need to exist before that copy is honest.

**Cost is dominated by worker CPU**, and OCR dominates that. Bill by page rather
than by file: a 400-page scan and a one-page receipt are not the same unit of
work, and the current `filesPerTask` limit does not distinguish them.

## Decisions needed before estimating firmly

1. Build or buy conversion, especially PDF→Word.
2. Does Edit mean page operations, or true text editing?
3. Does Sign mean stamping your own signature, or requesting signatures from
   others with a legally defensible audit trail?
4. Where do workers run, and is a self-hosted control plane acceptable?
5. What retention actually applies per plan, since the UI already promises
   auto-deletion?
