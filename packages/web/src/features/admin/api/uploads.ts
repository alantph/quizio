const BASE_URL = import.meta.env.VITE_API_URL || "";

let tokenGetter: (() => string | null) | null = null;

export const configureUploadsClient = (getToken: () => string | null) => {
  tokenGetter = getToken;
};

export const uploadsApi = {
  upload: async (file: File): Promise<{ url: string }> => {
    const token = tokenGetter?.();
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${BASE_URL}/api/admin/uploads`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error((data as { error?: string }).error || "Upload failed");
    }
    return res.json() as Promise<{ url: string }>;
  },
};
