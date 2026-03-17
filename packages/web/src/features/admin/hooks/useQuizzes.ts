import { useCallback, useEffect } from "react";
import { quizzesApi } from "../api/quizzes";
import { useAdminStore } from "../stores/admin";

export const useQuizzes = (params?: { search?: string; sort?: string }) => {
  const { quizzes, setQuizzes, isLoading, setLoading, error, setError, token } =
    useAdminStore();

  const fetchQuizzes = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await quizzesApi.list(params);
      setQuizzes(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [token, params?.search, params?.sort, setQuizzes, setLoading, setError]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  return { quizzes, isLoading, error, refetch: fetchQuizzes };
};
