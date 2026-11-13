import "server-only";

/**
 * HTTP client for the Spring Boot API (educare-api).
 * Runs only on the Next.js server — the browser never talks to the API directly,
 * so no CORS configuration is needed in Spring.
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
};

export class ApiError extends Error {
  constructor(public readonly problem: ProblemDetail) {
    super(problem.detail ?? problem.title ?? `API error ${problem.status}`);
    this.name = "ApiError";
  }

  get status() {
    return this.problem.status;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch (cause) {
    throw new Error(`Could not connect to the API at ${API_URL}`, { cause });
  }

  if (!response.ok) {
    let problem: ProblemDetail = { status: response.status };
    try {
      problem = { ...problem, ...(await response.json()) };
    } catch {
      // empty or non-JSON body
    }
    throw new ApiError(problem);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
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
