// src/lib/api.ts
// Small, dependency-free API client for talking to the Spring Boot backend.

const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:8080";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiOptions<TBody = unknown> {
  method?: HttpMethod;
  path: string;             // e.g. "/api/auth/login"
  body?: TBody;             // will be JSON.stringified if provided
  token?: string | null;    // optional dummy token for later
  signal?: AbortSignal;
}

export interface ApiResponse<T> {
  ok: boolean;
  status: number;
  data?: T;
  error?: { message: string };
}

export async function api<TResp = unknown, TBody = unknown>(opts: ApiOptions<TBody>): Promise<ApiResponse<TResp>> {
  const url = `${BASE_URL}${opts.path.startsWith("/") ? "" : "/"}${opts.path}`;
  const headers: Record<string, string> = {
    "Accept": "application/json"
  };
  const init: RequestInit = {
    method: opts.method || "GET",
    headers,
    signal: opts.signal
  };

  if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(opts.body);
  }

  // Prefer explicit token, otherwise fall back to stored one
  const authToken =
    opts.token ?? (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null);
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }


  try {
    const res = await fetch(url, init);
    const isJson = res.headers.get("content-type")?.includes("application/json");
    const payload = isJson ? await res.json() : undefined;

    if (!res.ok) {
      const message = (payload?.message as string) || `HTTP ${res.status}`;
      return { ok: false, status: res.status, error: { message } };
    }
    return { ok: true, status: res.status, data: payload as TResp };
  } catch (e: any) {
    return { ok: false, status: 0, error: { message: e?.message || "Network error" } };
  }
}

// Convenience wrappers for our current backend:
// - POST /api/auth/login
// - POST /api/auth/register
// - GET  /api/users
// - GET  /api/printers

export type LoginReq = { email: string; password: string };
export type LoginResp = { user: any; token: string };

export async function login(body: LoginReq) {
  return api<LoginResp, LoginReq>({ method: "POST", path: "/api/auth/login", body });
}

export type RegisterReq = { email: string; password: string; username?: string; firstName?: string; lastName?: string };
export type RegisterResp = { user: any; token: string };

export async function register(body: RegisterReq) {
  return api<RegisterResp, RegisterReq>({ method: "POST", path: "/api/auth/register", body });
}

export async function listUsers() {
  return api<any[]>({ method: "GET", path: "/api/users" });
}

export async function listPrinters() {
  return api<any[]>({ method: "GET", path: "/api/printers" });
}
