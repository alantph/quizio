const BASE_URL = import.meta.env.VITE_API_URL || "";

// Default token getter reads directly from localStorage so API calls work
// even before configureApiClient is called (e.g. on page refresh).
let tokenGetter: () => string | null = () => {
  try {
    return JSON.parse(localStorage.getItem("admin_token") ?? "null");
  } catch {
    return null;
  }
};
let onUnauthorized: (() => void) | null = null;

export const configureApiClient = (
  getToken: () => string | null,
  handleUnauthorized: () => void,
) => {
  tokenGetter = getToken;
  onUnauthorized = handleUnauthorized;
};

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = tokenGetter();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    onUnauthorized?.();
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function apiFetchBlob(path: string): Promise<Blob> {
  const token = tokenGetter();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.blob();
}
