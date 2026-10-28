import { api } from "../api/api";
import { ENDPOINTS } from "../api/endpoints";

/**
 * Initiates an asynchronous document generation job.
 * Sends the Idempotency-Key header to guarantee idempotency across network retries.
 *
 * Supports both signatures:
 * - startDocumentGeneration(payload, requestKey, signal)
 * - startDocumentGeneration(api, payload, requestKey, signal)
 *
 * @param {Object} apiOrPayload - API instance or document creation payload
 * @param {Object|string} payloadOrRequestKey - Document payload or request key UUID
 * @param {string|AbortSignal} [requestKeyOrSignal] - Request key UUID or AbortSignal
 * @param {AbortSignal} [maybeSignal] - Optional AbortSignal when api is passed first
 * @returns {Promise<Object>} Job response containing id, statusUrl, etc.
 */
export async function startDocumentGeneration(
  apiOrPayload,
  payloadOrRequestKey,
  requestKeyOrSignal,
  maybeSignal
) {
  let client = api;
  let payload = apiOrPayload;
  let requestKey = payloadOrRequestKey;
  let signal = requestKeyOrSignal;

  if (apiOrPayload && typeof apiOrPayload.post === "function") {
    client = apiOrPayload;
    payload = payloadOrRequestKey;
    requestKey = requestKeyOrSignal;
    signal = maybeSignal;
  }

  if (!requestKey) {
    throw new Error("Provide a stable request key for this generation.");
  }

  const normalized = { ...payload };
  if (typeof normalized.structuredInputs === "string") {
    try {
      normalized.structuredInputs = JSON.parse(normalized.structuredInputs);
    } catch {
      // keep as is
    }
  }

  const endpoint =
    ENDPOINTS.DOCUMENT_GENERATIONS || "/api/v1/document-generations";

  const response = await client.post(endpoint, normalized, {
    headers: { "Idempotency-Key": requestKey },
    signal,
  });

  return response.data; // Store id and statusUrl so a refresh can resume polling.
}

/**
 * Polls the backend until document generation finishes or fails.
 *
 * Supports signatures:
 * - waitForDocumentGeneration(job, { signal, onStatus })
 * - waitForDocumentGeneration(job, signal, onStatus)
 * - waitForDocumentGeneration(api, job, { signal, onStatus })
 * - waitForDocumentGeneration(api, job, signal, onStatus)
 *
 * @param {Object} apiOrJob - API instance or Job descriptor object { statusUrl, id }
 * @param {Object|AbortSignal} jobOrOptions - Job descriptor or options object
 * @param {Object|Function} [maybeOptionsOrOnStatus] - Options or onStatus callback
 * @param {Function} [maybeOnStatus] - onStatus callback if signal passed separately
 * @returns {Promise<Object>} The completed document (containing document.id)
 */
export async function waitForDocumentGeneration(
  apiOrJob,
  jobOrOptions,
  maybeOptionsOrOnStatus,
  maybeOnStatus
) {
  let client = api;
  let job = apiOrJob;
  let options = jobOrOptions;

  if (apiOrJob && typeof apiOrJob.get === "function") {
    client = apiOrJob;
    job = jobOrOptions;
    options = maybeOptionsOrOnStatus;
  }

  let signal;
  let onStatus;

  if (
    options &&
    typeof options === "object" &&
    ("signal" in options || "onStatus" in options)
  ) {
    signal = options.signal;
    onStatus = options.onStatus;
  } else {
    signal = options;
    onStatus = maybeOptionsOrOnStatus || maybeOnStatus;
  }

  if (!job) {
    throw new Error("Provide a valid job to wait for generation.");
  }

  const statusUrl =
    job.statusUrl ||
    (job.id ? `/api/v1/document-generations/${job.id}` : null);

  if (!statusUrl) {
    throw new Error("Job missing statusUrl or id to poll generation status.");
  }

  for (;;) {
    const { data: status } = await client.get(statusUrl, { signal });
    onStatus?.(status); // Queued, Generating, Completed or Failed; no invented percentage.

    const statusValue = status?.status;
    if (statusValue === "Completed") {
      const documentUrl =
        status.documentUrl ||
        (status.documentId
          ? `/api/v1/documents/${status.documentId}`
          : null) ||
        (status.id && status.id !== job.id
          ? `/api/v1/documents/${status.id}`
          : null);

      if (!documentUrl && status.document) {
        return status.document;
      }

      if (!documentUrl) {
        throw new Error(
          "Generation completed but no documentUrl was returned."
        );
      }

      const { data: document } = await client.get(documentUrl, { signal });
      return document; // Navigate with document.id, NEVER the job's id.
    }

    if (statusValue === "Failed") {
      const error = new Error(
        status.message ||
          "Generation could not finish. Your saved inputs are available."
      );
      error.code = status.errorCode;
      throw error;
    }

    await delay(Math.max(1, status.pollAfterSeconds || 2) * 1000, signal);
  }
}

/**
 * Delay with AbortSignal support to prevent memory leaks and handle aborts cleanly.
 * @param {number} milliseconds
 * @param {AbortSignal} [signal]
 * @returns {Promise<void>}
 */
export function delay(milliseconds, signal) {
  return new Promise((resolve, reject) => {
    let timer;
    const abort = () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      const abortError =
        typeof DOMException !== "undefined"
          ? new DOMException(
              "Polling stopped; server generation continues. Resume with the saved job.",
              "AbortError"
            )
          : Object.assign(
              new Error(
                "Polling stopped; server generation continues. Resume with the saved job."
              ),
              { name: "AbortError" }
            );
      reject(abortError);
    };

    if (signal?.aborted) return abort();

    timer = setTimeout(() => {
      signal?.removeEventListener("abort", abort);
      resolve();
    }, milliseconds);

    signal?.addEventListener("abort", abort, { once: true });
  });
}
