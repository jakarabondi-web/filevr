# Conversion worker. Deploy to a container platform (Fly.io, Railway, ECS,
# GKE) — not to a serverless function: the engines are large native binaries,
# the work is CPU-bound, and jobs routinely outlast function timeouts.
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

FROM node:22-slim AS runtime

# Conversion engines. Ghostscript and qpdf carry known CVE history, so keep the
# base image patched and rebuild on a schedule, not only on code changes.
#
# OCR (ocrmypdf + tesseract + poppler) adds roughly 180 MB to the image. Each
# additional language pack adds 2-15 MB more, so add them deliberately and keep
# lib/engines/ocr-pdf.ts OCR_LANGUAGES in step — the engine rejects any language
# the image does not ship.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ghostscript \
        qpdf \
        ocrmypdf \
        tesseract-ocr-eng \
        poppler-utils \
        tini \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json tsconfig.json tsconfig.worker.json ./
COPY worker ./worker
COPY lib ./lib
COPY config ./config
COPY types ./types

# Everything the worker writes goes to a scratch directory it creates per job,
# so the application tree itself never needs to be writable.
RUN useradd --create-home --shell /usr/sbin/nologin filevr \
    && mkdir -p /scratch && chown filevr /scratch
ENV TMPDIR=/scratch
USER filevr

# tini reaps the processes Ghostscript spawns; without an init, killed
# conversions leave zombies that eventually exhaust the process table.
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["npx", "tsx", "worker/index.ts"]

# Runtime hardening belongs to the platform, not the image. Run with:
#
#   --read-only                      application tree is immutable
#   --tmpfs /scratch:rw,noexec,nosuid,size=2g
#   --cap-drop ALL                   no capabilities are needed
#   --security-opt no-new-privileges
#   --network none                   the worker reaches storage and Postgres
#                                    through the platform network only; if your
#                                    platform requires egress for those, restrict
#                                    it to those hosts rather than allowing all
#   --memory 2g --cpus 2             bound a pathological file's blast radius
#                                    OCR is the memory-hungry engine: budget
#                                    ~1 GB per concurrent job at 300 dpi
#   --pids-limit 128
#
# On Kubernetes, prefer gVisor or Kata for the same reasons: every uploaded file
# is adversarial input to a binary with a history of remote-code-execution bugs.
