import { apiFetch, apiFetchBlob } from "./client";

export interface QuizListItem {
  id: string;
  subject: string;
  questionCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuizDetail {
  _id: string;
  subject: string;
  background?: string;
  questions: {
    question: string;
    answers: string[];
    solution: number;
    cooldown: number;
    time: number;
    image?: string;
    video?: string;
    audio?: string;
    background?: string;
  }[];
}

export const quizzesApi = {
  list: (params?: { search?: string; sort?: string }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.sort) qs.set("sort", params.sort);
    return apiFetch<QuizListItem[]>(`/api/admin/quizzes?${qs}`);
  },
  getById: (id: string) => apiFetch<QuizDetail>(`/api/admin/quizzes/${id}`),
  create: (data: unknown) =>
    apiFetch<QuizDetail>("/api/admin/quizzes", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: unknown) =>
    apiFetch<QuizDetail>(`/api/admin/quizzes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/api/admin/quizzes/${id}`, {
      method: "DELETE",
    }),
  exportJson: async (id: string, subject: string) => {
    const blob = await apiFetchBlob(`/api/admin/quizzes/${id}/export`);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${subject.replace(/[^a-z0-9]/gi, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
  import: (data: unknown) =>
    apiFetch<QuizDetail>("/api/admin/quizzes/import", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
