type TokenGetter = () => Promise<string | null>;

const LOCALIZED_STATUS_MESSAGES: Record<string, Record<number, string>> = {
  en: {
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
  },
  am: {
    400: "ጥያቄው ልክ ያልሆነ ነው። እባክዎ ግቤትዎን ያረጋግጡና እንደገና ይሞክሩ።",
    401: "የእርስዎ ክፍለ-ጊዜ አልቋል። እባክዎ እንደገና ይግቡ።",
    403: "ይህን ተግባር ለመፈጸም ፈቃድ የለዎትም።",
    404: "የተጠየቀው ግብዓት አልተገኘም።",
    409: "ይህ ተግባር ካለው መረጃ ጋር ይጋጫል። እባክዎ ገጹን አድሰው እንደገና ይሞክሩ።",
    422: "የቀረበው መረጃ ሊሰናዳ አልቻለም። እባክዎ ግቤትዎን ያረጋግጡ።",
    429: "በጣም ብዙ ሙከራዎች ተደርገዋል። እባክዎ ጥቂት ቆይተው እንደገና ይሞክሩ።",
    500: "በእኛ በኩል የሆነ ችግር ተከስቷል። እባክዎ እንደገና ይሞክሩ።",
    502: "አገልግሎቱ ለጊዜው አልተገኘም። እባክዎ ከጥቂት ቆይታ በኋላ እንደገና ይሞክሩ።",
    503: "አገልግሎቱ በአሁኑ ጊዜ ለጥገና ተዘግቷል። እባክዎ ቆይተው እንደገና ይሞክሩ።",
    504: "አገልጋዩ ምላሽ ለመስጠት በጣም ረጅም ጊዜ ወስዷል። እባክዎ እንደገና ይሞክሩ።",
  }
};

const NETWORK_ERRORS: Record<string, string> = {
  en: "Unable to reach the server. Check your connection and try again.",
  am: "ከአገልጋዩ ጋር መገናኘት አልተቻለም። ግንኙነትዎን ያረጋግጡና እንደገና ይሞክሩ።",
};

const UNEXPECTED_ERRORS: Record<string, string> = {
  en: "An unexpected error occurred. Please try again.",
  am: "ያልተጠበቀ ችግር ተከስቷል። እባክዎ እንደገና ይሞክሩ።",
};

export function friendlyError(err: unknown): string {
  let locale = "en";
  if (typeof window !== "undefined") {
    locale = localStorage.getItem("dispatch_locale") || "en";
    if (locale !== "en" && locale !== "am") {
      locale = "en";
    }
  }

  const messages = LOCALIZED_STATUS_MESSAGES[locale] || LOCALIZED_STATUS_MESSAGES.en;

  if (err instanceof ApiError) {
    return messages[err.status] ?? UNEXPECTED_ERRORS[locale];
  }
  if (err instanceof Error) {
    if (err.message.toLowerCase().includes("network") || err.message.toLowerCase().includes("fetch")) {
      return NETWORK_ERRORS[locale];
    }
  }
  return UNEXPECTED_ERRORS[locale];
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
