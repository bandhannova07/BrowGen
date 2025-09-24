const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function apiUrl(path: string) {
  return `${API_BASE}${path}`;
}

export async function apiGet<T = any>(path: string, token?: string): Promise<T> {
  const res = await fetch(apiUrl(path), {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    cache: 'no-store'
  });
  if (!res.ok) throw new Error(`GET ${path} failed`);
  return res.json();
}

export async function apiPost<T = any>(path: string, body: any, token?: string): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`POST ${path} failed`);
  return res.json();
}

export const authStore = {
  getToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  },
  setToken: (t: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', t);
  },
  clear: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
  }
};
