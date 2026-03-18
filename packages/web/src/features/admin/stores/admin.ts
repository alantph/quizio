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

const getStored = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const setStored = (key: string, value: unknown) => {
  try {
    if (value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

export const useAdminStore = create<AdminStore>((set) => ({
  token: getStored<string>("admin_token"),
  user: getStored<AdminUser>("admin_user"),
  quizzes: [],
  isLoading: false,
  error: null,

  setToken: (token) => {
    setStored("admin_token", token);
    set({ token });
  },
  setUser: (user) => {
    setStored("admin_user", user);
    set({ user });
  },
  setQuizzes: (quizzes) => set({ quizzes }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  logout: () => {
    setStored("admin_token", null);
    setStored("admin_user", null);
    set({ token: null, user: null, quizzes: [] });
  },
}));
