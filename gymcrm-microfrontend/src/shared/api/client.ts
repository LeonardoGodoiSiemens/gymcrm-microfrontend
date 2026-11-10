export class ApiError extends Error {
  constructor(public readonly status: number, public readonly code: string, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const SERVICE_LABEL: Record<string, string> = {
  products: 'o serviço de estoque',
  enrollments: 'o serviço de matrículas',
  enrichment: 'a função de cálculo financeiro',
};

function messageFrom(status: number, body: unknown): { code: string; message: string } {
  const b = (body ?? {}) as { code?: string; message?: string | string[]; service?: string };
  if (b.code === 'UPSTREAM_UNAVAILABLE') {
    return { code: b.code, message: `Não foi possível falar com ${SERVICE_LABEL[b.service ?? ''] ?? 'um dos serviços'}. Tente de novo em instantes.` };
  }
  const message = Array.isArray(b.message) ? b.message.join('; ') : b.message;
  return { code: b.code ?? `HTTP_${status}`, message: message ?? `O servidor respondeu com erro ${status}.` };
}

export function createApiClient(baseUrl: string, fetchFn: typeof fetch = (...a) => fetch(...a)) {
  const base = baseUrl.replace(/\/+$/, '');

  async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
    let response: Response;
    try {
      response = await fetchFn(`${base}${path}`, {
        method,
        headers: body !== undefined ? { 'Content-Type': 'application/json', Accept: 'application/json' } : { Accept: 'application/json' },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch {
      throw new ApiError(0, 'NETWORK_ERROR', 'Não foi possível conectar à API. Verifique a conexão e o endereço configurado.');
    }
    if (response.status === 204) return undefined as T;
    const text = await response.text();
    let parsed: unknown = null;
    try { parsed = text ? JSON.parse(text) : null; } catch { /* corpo não-JSON */ }
    if (!response.ok) {
      const { code, message } = messageFrom(response.status, parsed);
      throw new ApiError(response.status, code, message);
    }
    return parsed as T;
  }

  return {
    baseUrl: base,
    get: <T>(path: string) => request<T>('GET', path),
    post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
    put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
    delete: (path: string) => request<void>('DELETE', path),
  };
}

/** Cliente padrão: o frontend conversa SOMENTE com o BFF (via API Gateway), nunca com os microsserviços. */
export const api = createApiClient(import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000');
