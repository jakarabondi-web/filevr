# Real conversion: backend scope

Filevr still converts nothing — `MockDocumentProcessor` advances a counter on a
timer rather than transforming anything — but as of Phase 0 the infrastructure
around that gap is real: files are persisted in Postgres, bytes go to object
storage, uploads are verified server-side, and downloads work.

`.env.example` commits to the target stack: PostgreSQL, S3-compatible storage, a
Redis-backed queue, Stripe, and Auth.js/Clerk. This document scopes the work to
make conversion itself real against that stack.

*When this was first written, none of the above existed: storage returned URLs
to routes that were never implemented, the Download button was `href="#"`, and
no code path read an uploaded byte. The "What had to change" table below records
that starting point; the Phase 0 note under the plan records what has since
landed.*

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

## What had to change

The state Phase 0 started from, and what each piece became.

| Area | Before Phase 0 | Now |
|---|---|---|
| Job store | `lib/jobs/store.ts`, in-memory `Map` | ✅ Postgres via Drizzle |
| Processing | `MockDocumentProcessor` timer | ⬜ BullMQ producer; worker consumes (Phase 1) |
| Storage | Stub URLs to nonexistent routes | ✅ S3/R2 presigned PUT and GET, plus a local dev driver |
| Client upload | `simulateUpload` timer, bytes never leave the browser | ✅ Real PUT to storage with real progress |
| File IDs | Client queue IDs (`qf_1_…`) sent to `/api/jobs` | ✅ Server file IDs from `/api/uploads` |
| Upload complete | TODO comment | ✅ Size, sha256, magic-byte MIME (AV scan still to come) |
| Download | No route; button is `href="#"` | ✅ Presigned and expiring |
| Page count | Typed but never set | ✅ Counted for PDFs at verification |

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

> **Status: Phase 0 is done.** Postgres, real object storage, real uploads with
> verification, and working downloads are all in place. See "Running it locally"
> below. Phase 1 (queue + worker + first real engine) is the next step.

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

## Running it locally

Development needs Postgres. Object storage does not need cloud credentials: the
`local` driver writes bytes to disk behind HMAC-signed, expiring URLs, so the
browser still performs a direct PUT exactly as it would against S3.

```bash
# 1. Postgres (any instance; this is one way)
initdb -D .pgdata -U filevr --auth=trust
pg_ctl -D .pgdata -o "-p 5433" start
createdb -h 127.0.0.1 -p 5433 -U filevr filevr

# 2. Environment
cp .env.example .env.local
#    DATABASE_URL=postgres://filevr@127.0.0.1:5433/filevr
#    STORAGE_DRIVER=local
#    STORAGE_SIGNING_SECRET=<any dev string>

# 3. Schema
npx drizzle-kit migrate

# 4. Run
npm run dev
```

Switching to real object storage is a matter of setting `STORAGE_DRIVER=s3` plus
the bucket variables; no application code changes.

### What Phase 0 delivered

- **Postgres schema** (`lib/db/schema.ts`) for files, jobs, job inputs, and
  idempotency keys, with indexes for owner lookups and the retention sweep.
- **Two storage drivers** behind one interface. S3 sets `ServerSideEncryption`
  and a download `Content-Disposition`; local signs URLs with HMAC-SHA256 and
  rejects keys that escape the storage root.
- **Real uploads.** The browser reserves a row, PUTs bytes directly to storage
  with genuine progress (XHR, since `fetch` cannot report upload progress), then
  calls the completion endpoint.
- **Server-side verification.** Size must match the reservation, sha256 is
  recorded, and the type is sniffed from magic bytes rather than trusted. PDFs
  get a page count for future quota metering. Unverified bytes are deleted, and
  a file that never completes verification can never become a job input.
- **Durable idempotency.** Previously a module-scoped `Map`, so a retry on
  another instance created a duplicate job.
- **Working downloads.** Signed and expiring, replacing `href="#"`.

### Known gaps heading into Phase 1

- Conversion is still mocked: the processor copies input bytes to the output
  key so the plumbing is exercised with real files, but nothing is transformed.
- Verification buffers the whole file to hash it. Fine at the 100 MB free
  ceiling; Phase 5 should stream once Pro limits raise it.
- No virus scanning yet — the hook belongs in the completion endpoint.
- The retention sweeper is queryable (`findExpiredFiles`) but not scheduled.
