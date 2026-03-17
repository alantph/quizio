import { apiFetch } from "./client";

export interface AdminUserItem {
  id: string;
  username: string;
  role: string;
  createdAt: string;
}

export const settingsApi = {
  listUsers: () => apiFetch<AdminUserItem[]>("/api/admin/settings/users"),
  addUser: (username: string, password: string) =>
    apiFetch<AdminUserItem>("/api/admin/settings/users", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  deleteUser: (id: string) =>
    apiFetch<{ success: boolean }>(`/api/admin/settings/users/${id}`, {
      method: "DELETE",
    }),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiFetch<{ success: boolean }>("/api/admin/settings/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
  resetUserPassword: (id: string, newPassword: string) =>
    apiFetch<{ success: boolean }>(`/api/admin/settings/users/${id}/password`, {
      method: "PUT",
      body: JSON.stringify({ newPassword }),
    }),
};
