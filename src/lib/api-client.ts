type TokenGetter = () => Promise<string | null>;

const STATUS_MESSAGES: Record<number, string> = {
  400: "The request was invalid. Please check your input and try again.",
  401: "Your session has expired. Please sign in again.",
  403: "You don't have permission to perform this action.",
  404: "The requested resource was not found.",
  409: "This action conflicts with existing data. Please refresh and try again.",
  422: "The submitted data could not be processed. Please check your input.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "Something went wrong on our end. Please try again.",
  502: "Service temporarily unavailable. Please try again in a moment.",
  503: "Service is currently down for maintenance. Please try again later.",
  504: "The server took too long to respond. Please try again.",
};

export function friendlyError(err: unknown): string {
  if (err instanceof ApiError) {
    return STATUS_MESSAGES[err.status] ?? "An unexpected error occurred. Please try again.";
  }
  if (err instanceof Error) {
    if (err.message.toLowerCase().includes("network") || err.message.toLowerCase().includes("fetch")) {
      return "Unable to reach the server. Check your connection and try again.";
    }
  }
  return "An unexpected error occurred. Please try again.";
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    const msg =
      typeof body === "object" && body !== null
        ? (body as Record<string, unknown>).message ??
          (body as Record<string, unknown>).error ??
          "Request failed"
        : "Request failed";
    super(String(msg));
    this.name = "ApiError";
  }
}

async function request<T>(
  method: string,
  path: string,
  getToken: TokenGetter,
  body?: unknown,
): Promise<T> {
  const token = await getToken();

  const headers: HeadersInit = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(`/api/v1/${path.replace(/^\//, "")}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new ApiError(res.status, data);

  return data as T;
}

export function createApiClient(getToken: TokenGetter) {
  return {
    get: <T>(path: string) => request<T>("GET", path, getToken),
    post: <T>(path: string, body?: unknown) => request<T>("POST", path, getToken, body),
    patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, getToken, body),
    put: <T>(path: string, body?: unknown) => request<T>("PUT", path, getToken, body),
    del: <T>(path: string) => request<T>("DELETE", path, getToken),
  };
}
