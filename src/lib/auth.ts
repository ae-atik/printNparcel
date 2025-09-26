// src/lib/auth.ts
import { BASE_URL, TOKEN_KEY, USER_KEY, api, post, fileUrl, normalizeRoleName, hasRole } from "./api";

export type RoleName = "user" | "printer_owner" | "admin";

export interface UserDTO {
  id: string;                     // db: numeric string | json-store: "user-xxx"
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;        // "/files/profile-pics/user-<id>.webp" or absolute
  credits?: number;               // db maps to balance, json-store to credits
  roles?: string[] | string;      // tolerate both array and string
  university?: string;
  hall?: string;
  createdAt?: string;
}

export interface LoginResponse {
  user: UserDTO;
  token: string;
}

export interface RegisterBody {
  email: string;
  password: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  university?: string;
  hall?: string;
}

export function getCurrentUser(): UserDTO | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserDTO) : null;
  } catch {
    return null;
  }
}

export function saveAuth(user: UserDTO, token: string) {
  localStorage.setItem(TOKEN_KEY, token.startsWith("Bearer ") ? token : `Bearer ${token}`);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function login(email: string, password: string) {
  const res = await post<LoginResponse, { email: string; password: string }>("/api/auth/login", { email, password }, undefined, true);
  if (!res.ok) return res;

  // Persist token + user
  saveAuth(res.data.user, res.data.token);
  return res;
}

export async function register(body: RegisterBody) {
  const res = await post<LoginResponse, RegisterBody>("/api/auth/register", body, undefined, true);
  if (!res.ok) return res;

  saveAuth(res.data.user, res.data.token);
  return res;
}

/** Derived helpers for UI */

export function userDisplayName(u: UserDTO | null): string {
  if (!u) return "";
  const fn = (u.firstName || "").trim();
  const ln = (u.lastName || "").trim();
  const full = `${fn} ${ln}`.trim();
  return full || u.username || u.email || "User";
}

export function userAvatarUrl(u: UserDTO | null): string {
  if (!u || !u.profilePicture) return "";
  return fileUrl(u.profilePicture);
}

export function userHasRole(u: UserDTO | null, role: RoleName): boolean {
  if (!u) return false;
  return hasRole(u.roles as string[] | string | undefined, role);
}

export function userRolesNormalized(u: UserDTO | null): RoleName[] {
  if (!u || !u.roles) return ["user"];
  const arr = Array.isArray(u.roles) ? u.roles : [u.roles];
  const mapped = arr.map(normalizeRoleName);
  // Ensure uniqueness and valid ordering (admin > owner > user)
  const order: RoleName[] = ["admin", "printer_owner", "user"];
  const uniq = Array.from(new Set(mapped)) as RoleName[];
  return order.filter((r) => uniq.includes(r)) as RoleName[];
}

/** Profile picture upload (UI can call this directly) */
export async function uploadProfilePicture(userId: string, file: File) {
  // Backend expects: POST /api/users/{id}/profile-picture with multipart field "file"
  const path = `/api/users/${encodeURIComponent(userId)}/profile-picture`;
  const form = new FormData();
  form.append("file", file);
  return api<{ message: string; url: string; user: UserDTO }, FormData>({
    method: "POST",
    path,
    body: form,
  });
}

/** Authenticated fetch sample: e.g., load my printers (owner dashboard) */
export async function fetchOwnerPrinters(ownerId: string) {
  return api<any[]>({ method: "GET", path: `/api/printers?ownerId=${encodeURIComponent(ownerId)}` });
}

/** Public printers (DB profile returns ONLINE only; json-store returns everything) */
export async function fetchPublicPrinters() {
  return api<any[]>({ method: "GET", path: "/api/printers", skipAuth: true });
}
