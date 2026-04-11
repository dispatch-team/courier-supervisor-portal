type TokenGetter = () => Promise<string | null>;

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
