// src/lib/api.ts
// Single lightweight fetch wrapper that works in both profiles (`json-store` and `db`).

/** Base API URL (e.g., http://localhost:8080) */
export const API_BASE: string = (import.meta.env.VITE_API_URL ?? "http://localhost:8080").replace(/\/+$/, "");

/** Legacy alias for AuthContext compatibility */
export const BASE_URL: string = API_BASE;

/** Join API_BASE with a path like "/api/auth/login" or "api/auth/login" */
function url(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${p}`;
}

export type ApiOk<T> = { ok: true; data: T };
export type ApiFail = { ok: false; error: { message: string; status?: number } };
export type ApiResult<T> = ApiOk<T> | ApiFail;

async function toJson<T>(res: Response): Promise<ApiResult<T>> {
  const status = res.status;
  let body: any = null;
  try {
    body = await res.json();
  } catch {
    // ignore JSON parse error; body stays null
  }

  if (res.ok) {
    // For our backend, a successful login/register returns a plain object, not ApiResponse<T>
    return { ok: true, data: body as T };
  }

  // Try to extract a useful error message
  const message =
    (body?.message as string) ||
    (body?.error as string) ||
    (typeof body === "string" ? body : "Request failed");
  return { ok: false, error: { message, status } };
}

/** Optional auth header helper (token may be raw or already 'Bearer …') */
export function authHeader(token?: string): HeadersInit {
  if (!token) return {};
  return { Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}` };
}

/** Build absolute URL for files served by backend static handlers, e.g. /files/profile-pics/... */
export function makeAbsoluteFileUrl(pathOrUrl?: string | null): string {
  if (!pathOrUrl) return "";
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const withSlash = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${API_BASE}${withSlash}`;
}

/** Legacy alias for makeAbsoluteFileUrl - used by AdminPage */
export function toMediaUrl(pathOrUrl?: string | null): string {
  return makeAbsoluteFileUrl(pathOrUrl);
}

/* ===================== AUTH ===================== */

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Response: { user, token }
 */
export async function login(loginData: { email: string; password: string }): Promise<ApiResult<{ user: any; token: string }>>;
export async function login(email: string, password: string): Promise<ApiResult<{ user: any; token: string }>>;
export async function login(emailOrData: string | { email: string; password: string }, password?: string): Promise<ApiResult<{ user: any; token: string }>> {
  const body = typeof emailOrData === 'string' 
    ? { email: emailOrData, password: password! }
    : emailOrData;
    
  const res = await fetch(url("/api/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  return toJson(res);
}

/**
 * POST /api/auth/register
 * Body supports: { email, password, username?, firstName?, lastName?, phoneNumber?, university?, hall? }
 * Response: { user, token }
 */
export async function register(payload: {
  email: string;
  password: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  university?: string;
  hall?: string;
}): Promise<ApiResult<{ user: any; token: string }>> {
  const res = await fetch(url("/api/auth/register"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return toJson(res);
}

/* ===================== USERS ===================== */

/**
 * GET /api/users/me
 * Get current user profile (requires authentication)
 */
export async function getCurrentUser(token?: string): Promise<ApiResult<any>> {
  const res = await fetch(url("/api/users/me"), {
    method: "GET",
    headers: { ...authHeader(token) },
    credentials: "include",
  });
  return toJson(res);
}

/**
 * PUT /api/users/me
 * Update current user profile (requires authentication)
 */
export async function updateProfile(
  updates: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  },
  token?: string
): Promise<ApiResult<any>> {
  const res = await fetch(url("/api/users/me"), {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      ...authHeader(token) 
    },
    body: JSON.stringify(updates),
    credentials: "include",
  });
  return toJson(res);
}

/**
 * POST /api/users/me/profile-picture
 * multipart/form-data with field "file"
 * Response: { message, url, user }
 */
export async function uploadProfilePicture(
  file: File,
  token?: string
): Promise<ApiResult<{ message: string; url: string; user: any }>> {
  const form = new FormData();
  form.append("file", file); // field name MUST be "file"
  
  // Add token as form data as a fallback for CORS issues with Authorization header
  if (token) {
    form.append("token", token);
  }

  const res = await fetch(url("/api/users/me/profile-picture"), {
    method: "POST",
    headers: { ...authHeader(token) }, // do NOT set Content-Type manually
    body: form,
    credentials: "include",
  });
  return toJson(res);
}

/**
 * POST /api/users/:id/profile-picture
 * multipart/form-data with field "file"
 * Response: { message, url, user }
 * @deprecated Use uploadProfilePicture() without userId for current user
 */
export async function uploadProfilePictureById(
  userId: string,
  file: File,
  token?: string
): Promise<ApiResult<{ message: string; url: string; user: any }>> {
  const form = new FormData();
  form.append("file", file); // field name MUST be "file"

  const res = await fetch(url(`/api/users/${encodeURIComponent(userId)}/profile-picture`), {
    method: "POST",
    headers: { ...authHeader(token) }, // do NOT set Content-Type manually
    body: form,
    credentials: "include",
  });
  return toJson(res);
}

/* ===================== PRINTERS ===================== */

/**
 * GET /api/printers
 * List all public printers
 */
export async function listPrinters(): Promise<ApiResult<any[]>> {
  const res = await fetch(url("/api/printers"), { 
    method: "GET", 
    credentials: "include" 
  });
  return toJson(res);
}

/**
 * GET /api/printers (with auth for admin to see all including pending)
 * List all printers for admin management
 */
export async function listAllPrintersForAdmin(token?: string): Promise<ApiResult<any[]>> {
  const res = await fetch(url("/api/printers"), { 
    method: "GET", 
    headers: { ...authHeader(token) },
    credentials: "include" 
  });
  return toJson(res);
}

/**
 * GET /api/printers (legacy alias)
 */
export async function listPublicPrinters(): Promise<ApiResult<any[]>> {
  return listPrinters();
}

/**
 * GET /api/printers?ownerId={ownerId}
 * List printers owned by specific user
 */
export async function listOwnerPrinters(ownerId: string, token?: string): Promise<ApiResult<any[]>> {
  const res = await fetch(url(`/api/printers?ownerId=${encodeURIComponent(ownerId)}`), {
    method: "GET",
    headers: { ...authHeader(token) },
    credentials: "include",
  });
  return toJson(res);
}

/**
 * GET /api/printers/{id}
 * Get single printer by ID
 */
export async function getPrinter(id: string, token?: string): Promise<ApiResult<any>> {
  const res = await fetch(url(`/api/printers/${encodeURIComponent(id)}`), {
    method: "GET",
    headers: { ...authHeader(token) },
    credentials: "include",
  });
  return toJson(res);
}

/**
 * POST /api/printers
 * Create/apply for new printer
 */
export async function createPrinter(printer: any, token?: string): Promise<ApiResult<any>> {
  const res = await fetch(url("/api/printers"), {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      ...authHeader(token) 
    },
    body: JSON.stringify(printer),
    credentials: "include",
  });
  return toJson(res);
}

/**
 * PUT /api/printers/{id}
 * Update existing printer
 */
export async function updatePrinter(id: string, updates: any, token?: string): Promise<ApiResult<any>> {
  const res = await fetch(url(`/api/printers/${encodeURIComponent(id)}`), {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      ...authHeader(token) 
    },
    body: JSON.stringify(updates),
    credentials: "include",
  });
  return toJson(res);
}

/**
 * PUT /api/printers/{id}
 * Remove printer by setting status to declined
 */
export async function removePrinter(id: string, token?: string): Promise<ApiResult<any>> {
  const res = await fetch(url(`/api/printers/${encodeURIComponent(id)}`), {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      ...authHeader(token) 
    },
    body: JSON.stringify({ status: "declined" }),
    credentials: "include",
  });
  return toJson(res);
}

/**
 * POST /api/printers/{id}/approve
 * Admin approve printer
 */
/**
 * Admin approve printer by setting status to online
 */
export async function approvePrinter(id: string, token?: string): Promise<ApiResult<any>> {
  const res = await fetch(url(`/api/printers/${encodeURIComponent(id)}`), {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      ...authHeader(token) 
    },
    body: JSON.stringify({ status: "online" }),
    credentials: "include",
  });
  return toJson(res);
}

/**
 * Admin reject printer by setting status to declined
 */
export async function rejectPrinter(id: string, token?: string): Promise<ApiResult<any>> {
  const res = await fetch(url(`/api/printers/${encodeURIComponent(id)}`), {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      ...authHeader(token) 
    },
    body: JSON.stringify({ status: "declined" }),
    credentials: "include",
  });
  return toJson(res);
}

/* ===================== ORDERS/PRINT JOBS ===================== */

/**
 * GET /api/orders
 * List all orders
 */
export async function listOrders(token?: string): Promise<ApiResult<any[]>> {
  const res = await fetch(url("/api/orders"), {
    method: "GET",
    headers: { ...authHeader(token) },
    credentials: "include",
  });
  return toJson(res);
}

/**
 * GET /api/orders/by-user/{userId}
 * List orders for specific user
 */
export async function listOrdersByUser(userId: string, token?: string): Promise<ApiResult<any[]>> {
  const res = await fetch(url(`/api/orders/by-user/${encodeURIComponent(userId)}`), {
    method: "GET",
    headers: { ...authHeader(token) },
    credentials: "include",
  });
  return toJson(res);
}

/**
 * POST /api/orders
 * Create new print job/order with file upload
 */
export async function createPrintJob(order: any, token?: string): Promise<ApiResult<any>> {
  // Create FormData for file upload
  const formData = new FormData();
  
  // Add the file (assuming order.file is a File object)
  if (order.file) {
    formData.append('file', order.file);
  }
  
  // Add other parameters
  formData.append('printerId', order.printerId?.toString() || '');
  formData.append('pages', order.pages?.toString() || '1');
  formData.append('isColor', order.isColor?.toString() || 'false');
  formData.append('copies', order.copies?.toString() || '1');

  const res = await fetch(url("/api/orders"), {
    method: "POST",
    headers: { 
      // Don't set Content-Type for FormData - browser will set it with boundary
      ...authHeader(token) 
    },
    body: formData,
    credentials: "include",
  });
  return toJson(res);
}

/**
 * GET /api/orders/me
 * Get current user's print orders
 */
export async function getMyPrintJobs(token?: string): Promise<ApiResult<any[]>> {
  const res = await fetch(url("/api/orders/me"), {
    method: "GET",
    headers: { ...authHeader(token) },
    credentials: "include",
  });
  return toJson(res);
}

/**
 * GET /api/orders/printer/{printerId}
 * Get print orders for a specific printer (for printer owners)
 */
export async function getPrinterOrders(token?: string): Promise<ApiResult<any[]>> {
  const res = await fetch(url("/api/orders"), {
    method: "GET",
    headers: { ...authHeader(token) },
    credentials: "include",
  });
  return toJson(res);
}

/**
 * PUT /api/orders/{orderId}/status
 * Update print order status (for printer owners)
 */
export async function updatePrintOrderStatus(orderId: string, status: string, token?: string): Promise<ApiResult<any>> {
  const res = await fetch(url(`/api/orders/${orderId}/status`), {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      ...authHeader(token) 
    },
    body: JSON.stringify({ status }),
    credentials: "include",
  });
  return toJson(res);
}

/* ===================== DELIVERIES ===================== */

/**
 * GET /api/deliveries
 * List deliveries with optional scope filtering
 */
export async function listDeliveries(scope?: string, token?: string): Promise<ApiResult<any[]>> {
  const params = scope ? `?scope=${encodeURIComponent(scope)}` : '';
  const res = await fetch(url(`/api/deliveries${params}`), {
    method: "GET",
    headers: { ...authHeader(token) },
    credentials: "include",
  });
  return toJson(res);
}

/**
 * GET /api/deliveries/{id}
 * Get single delivery by ID
 */
export async function getDelivery(id: string, token?: string): Promise<ApiResult<any>> {
  const res = await fetch(url(`/api/deliveries/${encodeURIComponent(id)}`), {
    method: "GET",
    headers: { ...authHeader(token) },
    credentials: "include",
  });
  return toJson(res);
}

/**
 * POST /api/deliveries
 * Create new delivery request
 */
export async function createDeliveryRequest(delivery: any, token?: string): Promise<ApiResult<any>> {
  const res = await fetch(url("/api/deliveries"), {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      ...authHeader(token) 
    },
    body: JSON.stringify(delivery),
    credentials: "include",
  });
  return toJson(res);
}

/**
 * POST /api/deliveries/anonymous
 * Create anonymous delivery request (no auth required)
 */
export async function createAnonymousDeliveryRequest(delivery: {
  itemDescription: string;
  pickupLocation: string;
  dropLocation: string;
  imageUrl?: string;
}, token?: string): Promise<ApiResult<any>> {
  const res = await fetch(url("/api/deliveries/anonymous"), {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      ...authHeader(token)
    },
    body: JSON.stringify(delivery),
    credentials: "include",
  });
  return toJson(res);
}

/**
 * PATCH /api/deliveries/{id}/status
 * Update delivery request status
 */
export async function updateDeliveryStatus(deliveryId: string, status: string, token?: string): Promise<ApiResult<any>> {
  const res = await fetch(url(`/api/deliveries/${deliveryId}/status`), {
    method: "PATCH",
    headers: { 
      "Content-Type": "application/json",
      ...authHeader(token) 
    },
    body: JSON.stringify({ status }),
    credentials: "include",
  });
  return toJson(res);
}

/* ===================== ACTIVITIES ===================== */

/**
 * GET /api/activities/me
 * Get current user's activities
 */
export async function getMyActivities(limit: number = 20, token?: string): Promise<ApiResult<any[]>> {
  const res = await fetch(url(`/api/activities/me?limit=${limit}`), {
    method: "GET",
    headers: { ...authHeader(token) },
    credentials: "include",
  });
  return toJson(res);
}

/**
 * GET /api/activities/printer-owner
 * Get printer owner's activities
 */
export async function getPrinterOwnerActivities(limit: number = 20, token?: string): Promise<ApiResult<any[]>> {
  const res = await fetch(url(`/api/activities/printer-owner?limit=${limit}`), {
    method: "GET",
    headers: { ...authHeader(token) },
    credentials: "include",
  });
  return toJson(res);
}

/**
 * GET /api/activities/print-order/{printOrderId}
 * Get activities for a specific print order
 */
export async function getPrintOrderActivities(printOrderId: string, token?: string): Promise<ApiResult<any[]>> {
  const res = await fetch(url(`/api/activities/print-order/${encodeURIComponent(printOrderId)}`), {
    method: "GET",
    headers: { ...authHeader(token) },
    credentials: "include",
  });
  return toJson(res);
}

/* ===================== USERS ===================== */

/**
 * GET /api/users
 * List all users
 */
export async function listUsers(token?: string): Promise<ApiResult<any[]>> {
  const res = await fetch(url("/api/users"), {
    method: "GET",
    headers: { ...authHeader(token) },
    credentials: "include",
  });
  return toJson(res);
}

/** Convenience: normalize roles like 'printer_owner' / 'printer-owner' */
export function normalizeRoleName(role?: string | null): "admin" | "printer_owner" | "user" {
  const r = (role || "").toLowerCase();
  if (r === "admin") return "admin";
  if (r === "printer_owner" || r === "printer-owner") return "printer_owner";
  return "user";
}
