const MAX_RETRIES = 3;
const TIMEOUT_MS = 10000;
const BACKOFF_BASE_MS = 1000;

export async function fetchApi(url) {
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

      const data = await response.json();
      return data;
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;
      console.error(`Attempt ${attempt + 1}/${MAX_RETRIES} failed: ${err.message}`);
    }
  }

  return {
    error: true,
    message: lastError?.message || "Unknown error",
    timestamp: new Date().toISOString(),
  };
}
