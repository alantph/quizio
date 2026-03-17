import { create } from "zustand";

interface AdminUser {
  username: string;
  role: string;
}

interface Quiz {
  id: string;
  subject: string;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
}

interface AdminStore {
  token: string | null;
  user: AdminUser | null;
  quizzes: Quiz[];
  isLoading: boolean;
  error: string | null;

  setToken: (token: string | null) => void;
  setUser: (user: AdminUser | null) => void;
  setQuizzes: (quizzes: Quiz[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

const getStoredToken = () => {
  try {
    return sessionStorage.getItem("admin_token");
  } catch {
    return null;
  }
};

export const useAdminStore = create<AdminStore>((set) => ({
  token: getStoredToken(),
  user: null,
  quizzes: [],
  isLoading: false,
  error: null,

  setToken: (token) => {
    try {
      if (token) sessionStorage.setItem("admin_token", token);
      else sessionStorage.removeItem("admin_token");
    } catch {}
    set({ token });
  },
  setUser: (user) => set({ user }),
  setQuizzes: (quizzes) => set({ quizzes }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  logout: () => {
    try {
      sessionStorage.removeItem("admin_token");
    } catch {}
    set({ token: null, user: null, quizzes: [] });
  },
}));
