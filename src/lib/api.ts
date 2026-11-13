import "server-only";

/**
 * Cliente HTTP para a API Spring Boot (educare-api).
 * Roda apenas no servidor Next.js — o navegador nunca fala direto com a API,
 * então não é preciso configurar CORS no Spring.
 */

const API_URL = process.env.API_URL ?? "http://localhost:8080";

/** Corpo de erro no formato ProblemDetail (RFC 9457) retornado pelo Spring. */
export type ProblemDetail = {
  type?: string;
  title?: string;
  status: number;
  detail?: string;
  instance?: string;
  /** Erros de validação por campo (GlobalExceptionHandler da API). */
  erros?: Record<string, string>;
};

export class ApiError extends Error {
  constructor(public readonly problem: ProblemDetail) {
    super(problem.detail ?? problem.title ?? `Erro ${problem.status} na API`);
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
    throw new Error(`Não foi possível conectar à API em ${API_URL}`, { cause });
  }

  if (!response.ok) {
    let problem: ProblemDetail = { status: response.status };
    try {
      problem = { ...problem, ...(await response.json()) };
    } catch {
      // corpo vazio ou não-JSON
    }
    throw new ApiError(problem);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

/** Página no formato do Spring Data (`Page<T>`), normalizada. */
export type Page<T> = {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

type SpringPage<T> =
  // Serialização via DTO (PagedModel): { content, page: { ... } }
  | { content: T[]; page: Omit<Page<T>, "content"> }
  // Serialização direta de PageImpl
  | Page<T>;

export function normalizePage<T>(raw: SpringPage<T>): Page<T> {
  return "page" in raw ? { content: raw.content, ...raw.page } : raw;
}
