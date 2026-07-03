export interface ApiResponse<T> {
  response: Response;
  body: T;
  cookieHeader: string;
}

export interface ApiRequestOptions {
  method?: string;
  body?: unknown;
  cookieHeader?: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
}

export function getTestServerUrl() {
  return process.env.TEST_SERVER_URL || "http://127.0.0.1:3101";
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeout = options.timeoutMs ? setTimeout(() => controller.abort(), options.timeoutMs) : null;

  try {
    const response = await fetch(`${getTestServerUrl()}${path}`, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
        ...(options.cookieHeader ? { Cookie: options.cookieHeader } : {})
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal
    });

    const text = await response.text();
    const body = text ? JSON.parse(text) : null;

    return {
      response,
      body,
      cookieHeader: buildCookieHeaderFromResponse(response)
    };
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

export function buildCookieHeaderFromResponse(response: Response) {
  const headersWithCookies = response.headers as Headers & { getSetCookie?: () => string[] };
  const rawCookies = headersWithCookies.getSetCookie?.() || splitCombinedSetCookieHeader(response.headers.get("set-cookie"));

  return rawCookies
    .map((cookie) => cookie.split(";")[0])
    .filter((cookie) => cookie.includes("="))
    .join("; ");
}

function splitCombinedSetCookieHeader(header: string | null) {
  if (!header) {
    return [];
  }

  return header.split(/,(?=\s*[^;,]+=)/).map((cookie) => cookie.trim());
}
