/** Thin client for the Kesari API. Every response is { success, data, meta? }. */

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1").replace(
  /\/$/,
  "",
);

const TOKEN_KEY = "kesari.cms.token";

export type PageMeta = { page: number; limit: number; total: number; pages: number };
export type Paged<T> = { items: T[]; meta: PageMeta };

export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: { path: string; message: string }[],
  ) {
    super(message);
  }
}

export const tokenStore = {
  get(): string | null {
    try {
      return window.localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string) {
    try {
      window.localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* storage unavailable: the session lasts until reload */
    }
  },
  clear() {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  },
};

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  auth?: boolean;
};

async function send(path: string, { method = "GET", body, query, auth = true }: RequestOptions) {
  const url = new URL(API_URL + path);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }

  const token = auth ? tokenStore.get() : null;
  const isForm = body instanceof FormData;
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: {
        ...(body !== undefined && !isForm && { "content-type": "application/json" }),
        ...(token && { authorization: `Bearer ${token}` }),
      },
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    });
  } catch {
    throw new ApiRequestError(0, "Cannot reach the Kesari API. Check that the backend is running.");
  }

  if (res.status === 204) return { data: undefined, meta: undefined };
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    if (res.status === 401 && auth) tokenStore.clear();
    throw new ApiRequestError(
      res.status,
      json?.error?.message ?? `Request failed (${res.status})`,
      json?.error?.details,
    );
  }
  return { data: json.data, meta: json.meta as PageMeta | undefined };
}

export const api = {
  async get<T>(path: string, query?: RequestOptions["query"], auth = true): Promise<T> {
    return (await send(path, { query, auth })).data as T;
  },
  async list<T>(path: string, query?: RequestOptions["query"]): Promise<Paged<T>> {
    const { data, meta } = await send(path, { query });
    return { items: data as T[], meta: meta as PageMeta };
  },
  async post<T>(path: string, body?: unknown, auth = true): Promise<T> {
    return (await send(path, { method: "POST", body, auth })).data as T;
  },
  async patch<T>(path: string, body: unknown): Promise<T> {
    return (await send(path, { method: "PATCH", body })).data as T;
  },
  async put<T>(path: string, body: unknown): Promise<T> {
    return (await send(path, { method: "PUT", body })).data as T;
  },
  async delete(path: string): Promise<void> {
    await send(path, { method: "DELETE" });
  },
};
