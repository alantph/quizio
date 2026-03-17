import { apiFetch, apiFetchBlob } from "./client";

export interface GameResultListItem {
  _id: string;
  quizzSubject: string;
  playedAt: string;
  totalPlayers: number;
  createdBy: string;
}

export interface GameResultDetail {
  _id: string;
  quizzSubject: string;
  playedAt: string;
  totalPlayers: number;
  createdBy: string;
  players: { username: string; totalPoints: number; rank: number }[];
  questions: {
    questionIndex: number;
    questionText: string;
    correctAnswerIndex: number;
    answers: string[];
    playerResults: {
      username: string;
      answerId: number | null;
      correct: boolean;
      points: number;
    }[];
  }[];
}

export const gameResultsApi = {
  list: (params?: {
    quizzId?: string;
    from?: string;
    to?: string;
    page?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params?.quizzId) qs.set("quizzId", params.quizzId);
    if (params?.from) qs.set("from", params.from);
    if (params?.to) qs.set("to", params.to);
    if (params?.page) qs.set("page", String(params.page));
    return apiFetch<GameResultListItem[]>(`/api/admin/game-results?${qs}`);
  },
  getById: (id: string) =>
    apiFetch<GameResultDetail>(`/api/admin/game-results/${id}`),
  exportCsv: async (id: string, subject: string, date: string) => {
    const blob = await apiFetchBlob(`/api/admin/game-results/${id}/export`);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${subject.replace(/[^a-z0-9]/gi, "_")}-${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
