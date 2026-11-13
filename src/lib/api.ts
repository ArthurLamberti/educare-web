import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getSessionToken } from "./session";
import { getTenantSlug } from "./tenant";

/**
 * HTTP client for the Spring Boot API (educare-api).
 * Runs only on the Next.js server — the browser never talks to the API directly,
 * so no CORS configuration is needed in Spring.
 *
 * Every call carries the school (`X-Tenant`) and, unless `auth: false`, the session token.
 * A rejected token (401) ends the session; a forbidden call (403) shows the not-allowed page, or
 * `/pending` when the space is not active (`code: ACCOUNT_INACTIVE`).
 */

const API_URL = process.env.API_URL ?? "http://localhost:8080";

/** Error body in ProblemDetail format (RFC 9457) returned by Spring. */
export type ProblemDetail = {
  type?: string;
  title?: string;
  status: number;
  detail?: string;
  instance?: string;
  /** Per-field validation errors (the API's GlobalExceptionHandler). */
  errors?: Record<string, string>;
  /** Machine-readable reason, e.g. `EMAIL_NOT_CONFIRMED` or `ACCOUNT_INACTIVE`. */
  code?: string;
};

export class ApiError extends Error {
  constructor(public readonly problem: ProblemDetail) {
    super(problem.detail ?? problem.title ?? `API error ${problem.status}`);
    this.name = "ApiError";
  }

  get status() {
    return this.problem.status;
  }

  /** The API answers 404 "School not found" when the subdomain's school does not exist. */
  get isUnknownSchool() {
    return this.status === 404 && this.problem.detail === "School not found";
  }
}

type ApiInit = RequestInit & {
  /** Send the session token (default true). Use false for login and public calls. */
  auth?: boolean;
  /**
   * Tell the API the browser's IP (`X-Forwarded-For`), for its rate limits on public endpoints.
   * Taken from the incoming request's last `X-Forwarded-For` hop (set by the reverse proxy in front
   * of Next.js, which must overwrite what clients send).
   */
  forwardClientIp?: boolean;
};

export async function apiFetch<T>(path: string, { auth = true, forwardClientIp = false, ...init }: ApiInit = {}): Promise<T> {
  const tenant = await getTenantSlug();
  const token = auth ? await getSessionToken() : undefined;
  const clientIp = forwardClientIp ? await incomingClientIp() : null;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(tenant ? { "X-Tenant": tenant } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(clientIp ? { "X-Forwarded-For": clientIp } : {}),
        ...init.headers,
      },
    });
  } catch (cause) {
    throw new Error(`Não foi possível conectar à API em ${API_URL}`, { cause });
  }

  if (!response.ok) {
    let problem: ProblemDetail = { status: response.status };
    try {
      problem = { ...problem, ...(await response.json()) };
    } catch {
      // empty or non-JSON body
    }
    if (auth && response.status === 401) redirect("/session/expired");
    if (auth && response.status === 403) redirect(problem.code === "ACCOUNT_INACTIVE" ? "/pending" : "/not-allowed");
    throw new ApiError(problem);
  }

  // 204, and 202/200 answers without a body (e.g. resend confirmation).
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

async function incomingClientIp() {
  const forwarded = (await headers()).get("x-forwarded-for");
  return forwarded?.split(",").at(-1)?.trim() || null;
}

/** Spring Data page (`Page<T>`), normalized. */
export type Page<T> = {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

type SpringPage<T> =
  // Serialized via DTO (PagedModel): { content, page: { ... } }
  | { content: T[]; page: Omit<Page<T>, "content"> }
  // Direct PageImpl serialization
  | Page<T>;

export function normalizePage<T>(raw: SpringPage<T>): Page<T> {
  return "page" in raw ? { content: raw.content, ...raw.page } : raw;
}
