import { apiFetch } from "./client";

const BASE_URL = import.meta.env.VITE_API_URL || "";

export const backgroundsApi = {
  list: (): Promise<{ key: string; url: string }[]> =>
    apiFetch<{ key: string; url: string }[]>("/api/admin/backgrounds"),

  upload: async (file: File): Promise<{ url: string; key: string }> => {
    const token = (() => {
      try {
        return JSON.parse(
          localStorage.getItem("admin_token") ?? "null",
        ) as string | null;
      } catch {
        return null;
      }
    })();
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${BASE_URL}/api/admin/backgrounds`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error((data as { error?: string }).error || "Upload failed");
    }
    return res.json() as Promise<{ url: string; key: string }>;
  },

  deleteBackground: (key: string): Promise<{ success: boolean }> =>
    apiFetch<{ success: boolean }>("/api/admin/backgrounds", {
      method: "DELETE",
      body: JSON.stringify({ key }),
    }),
};
