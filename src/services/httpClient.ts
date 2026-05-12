const inflightRequests = new Map<string, Promise<any>>();

function getToken(): string {
  try { return localStorage.getItem('clinic_token') || ''; } catch { return ''; }
}

function getTenantId(): string {
  try { return localStorage.getItem('active_tenant_id') || ''; } catch { return ''; }
}

function buildHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
    'x-tenant-id': getTenantId(),
    ...extra,
  };
}

function inflightKey(url: string, options: RequestInit): string {
  return `${options.method || 'GET'}:${url}`;
}

async function request<T = any>(url: string, options: RequestInit = {}, retries = 0): Promise<T | null> {
  const key = inflightKey(url, options);
  const isGet = !options.method || options.method === 'GET';

  if (isGet && inflightRequests.has(key)) {
    return inflightRequests.get(key)!;
  }

  const doFetch = async (attempt: number): Promise<T | null> => {
    try {
      const res = await fetch(url, {
        ...options,
        headers: { ...buildHeaders(), ...(options.headers as Record<string, string> || {}) },
      });

      if (!res.ok) {
        if (res.status === 401) {
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
          return null;
        }

        if (res.status >= 500 && attempt < 2) {
          const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 200, 4000);
          await new Promise(r => setTimeout(r, delay));
          return doFetch(attempt + 1);
        }

        console.error(`[API] ${options.method || 'GET'} ${url} → ${res.status} ${res.statusText}`);
        return null;
      }

      return res.status !== 204 ? await res.json() : null;
    } catch (err) {
      if (attempt < 2) {
        const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 200, 4000);
        await new Promise(r => setTimeout(r, delay));
        return doFetch(attempt + 1);
      }
      console.error(`[API] Network error:`, err);
      return null;
    }
  };

  const promise = doFetch(0);

  if (isGet) {
    inflightRequests.set(key, promise);
    promise.finally(() => inflightRequests.delete(key));
  }

  return promise;
}

export const api = {
  get: <T = any>(url: string) => request<T>(url),
  post: <T = any>(url: string, body?: any) => request<T>(url, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  }),
  put: <T = any>(url: string, body?: any) => request<T>(url, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  }),
  delete: <T = any>(url: string) => request<T>(url, { method: 'DELETE' }),
};

export function apiHeaders() {
  return buildHeaders();
}
