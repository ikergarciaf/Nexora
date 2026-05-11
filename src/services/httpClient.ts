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

async function request<T = any>(url: string, options: RequestInit = {}): Promise<T | null> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: { ...buildHeaders(), ...(options.headers as Record<string, string> || {}) },
    });
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
      }
      return null;
    }
    return res.status !== 204 ? await res.json() : null;
  } catch {
    return null;
  }
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
