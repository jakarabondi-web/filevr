/**
 * Client-side upload: reserve, PUT the bytes straight to storage, confirm.
 * The bytes never travel through the Next.js API.
 */

export interface UploadHandle {
  /** Server-side file id — this is what /api/jobs expects. */
  fileId: string;
}

export class UploadError extends Error {
  constructor(
    message: string,
    readonly code: string
  ) {
    super(message);
    this.name = "UploadError";
  }
}

async function readError(res: Response, fallback: string): Promise<UploadError> {
  try {
    const body = (await res.json()) as { errorCode?: string; errorMessage?: string };
    return new UploadError(body.errorMessage ?? fallback, body.errorCode ?? "UPLOAD_FAILED");
  } catch {
    return new UploadError(fallback, "UPLOAD_FAILED");
  }
}

/** PUT with progress. fetch() cannot report upload progress, so this uses XHR. */
function putWithProgress(
  url: string,
  method: string,
  headers: Record<string, string>,
  file: File,
  onProgress: (percent: number) => void,
  signal?: AbortSignal
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    for (const [k, v] of Object.entries(headers)) xhr.setRequestHeader(k, v);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        // Cap at 99: the upload isn't done until the server confirms it.
        onProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
      }
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new UploadError(`Storage rejected the upload (${xhr.status})`, "STORAGE_REJECTED"));
    xhr.onerror = () => reject(new UploadError("Network error during upload.", "NETWORK_ERROR"));
    xhr.onabort = () => reject(new UploadError("Upload cancelled.", "ABORTED"));

    signal?.addEventListener("abort", () => xhr.abort(), { once: true });
    xhr.send(file);
  });
}

export async function uploadFile(
  file: File,
  { onProgress, signal }: { onProgress?: (percent: number) => void; signal?: AbortSignal } = {}
): Promise<UploadHandle> {
  const reserveRes = await fetch("/api/uploads", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
    }),
    signal,
  });
  if (!reserveRes.ok) throw await readError(reserveRes, "We couldn't start the upload.");

  const { fileId, uploadUrl, method, requiredHeaders } = (await reserveRes.json()) as {
    fileId: string;
    uploadUrl: string;
    method: string;
    requiredHeaders: Record<string, string>;
  };

  await putWithProgress(uploadUrl, method ?? "PUT", requiredHeaders ?? {}, file, onProgress ?? (() => {}), signal);

  const completeRes = await fetch(`/api/uploads/${fileId}/complete`, { method: "POST", signal });
  if (!completeRes.ok) throw await readError(completeRes, "We couldn't verify the upload.");

  onProgress?.(100);
  return { fileId };
}
