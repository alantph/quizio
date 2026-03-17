import { useCallback } from "react";
import { useNavigate } from "react-router";
import { authApi } from "../api/auth";
import { configureApiClient } from "../api/client";
import { configureUploadsClient } from "../api/uploads";
import { useAdminStore } from "../stores/admin";

export const useAdminAuth = () => {
  const { token, user, setToken, setUser, logout } = useAdminStore();
  const navigate = useNavigate();

  const setupApiClient = useCallback(() => {
    configureApiClient(
      () => useAdminStore.getState().token,
      () => {
        logout();
        navigate("/admin/login");
      },
    );
    configureUploadsClient(() => useAdminStore.getState().token);
  }, [logout, navigate]);

  const login = useCallback(
    async (username: string, password: string) => {
      const result = await authApi.login(username, password);
      setToken(result.token);
      setUser(result.user);
      setupApiClient();
      navigate("/admin/dashboard");
    },
    [setToken, setUser, setupApiClient, navigate],
  );

  const handleLogout = useCallback(() => {
    logout();
    navigate("/admin/login");
  }, [logout, navigate]);

  return { token, user, login, logout: handleLogout, setupApiClient };
};
