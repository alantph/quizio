import { apiFetch } from "./client";

export const authApi = {
  login: (username: string, password: string) =>
    apiFetch<{ token: string; user: { username: string; role: string } }>(
      "/api/admin/auth",
      {
        method: "POST",
        body: JSON.stringify({ username, password }),
      },
    ),
  refresh: () =>
    apiFetch<{ token: string }>("/api/admin/auth/refresh", { method: "POST" }),
};
