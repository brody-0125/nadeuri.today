const MAX_RETRIES = 3;
const TIMEOUT_MS = 10000;
const BACKOFF_BASE_MS = 1000;
const MAX_RESPONSE_BYTES = 50 * 1024 * 1024; // 50 MB
const ALLOWED_HOSTS = ["openapi.seoul.go.kr"];

function maskApiKey(msg, apiKey) {
  if (!apiKey || !msg) return msg || "Unknown error";
  return msg.replaceAll(apiKey, "***");
}

function validateUrl(url) {
  try {
    const parsed = new URL(url);
    if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
      return `Blocked request to disallowed host: ${parsed.hostname}`;
    }
    return null;
  } catch {
    return `Invalid URL`;
  }
}

export async function fetchApi(url, { apiKey } = {}) {
  const hostError = validateUrl(url);
  if (hostError) {
    return { error: true, message: hostError, timestamp: new Date().toISOString() };
  }

  let lastError;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = BACKOFF_BASE_MS * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentLength = Number(response.headers.get("content-length") || 0);
      if (contentLength > MAX_RESPONSE_BYTES) {
        throw new Error(`Response too large: ${contentLength} bytes (limit ${MAX_RESPONSE_BYTES})`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;
      console.error(`Attempt ${attempt + 1}/${MAX_RETRIES} failed: ${maskApiKey(err.message, apiKey)}`);
    }
  }

  return {
    error: true,
    message: maskApiKey(lastError?.message, apiKey),
    timestamp: new Date().toISOString(),
  };
}
