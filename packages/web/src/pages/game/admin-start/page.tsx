import { STATUS } from "@quizio/common/types/game/status";
import {
  useEvent,
  useSocket,
} from "@quizio/web/features/game/contexts/socketProvider";
import { useManagerStore } from "@quizio/web/features/game/stores/manager";
import { useCallback, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";

const AdminGameStartPage = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const { socket, isConnected } = useSocket();
  const { setGameId, setStatus } = useManagerStore();
  const navigate = useNavigate();
  const hasSent = useRef(false);

  const startGame = useCallback(() => {
    if (hasSent.current) return;
    hasSent.current = true;

    try {
      const token = JSON.parse(
        localStorage.getItem("admin_token") ?? "null",
      ) as string | null;

      if (!token || !quizId) {
        navigate("/admin/dashboard", { replace: true });
        return;
      }

      socket?.emit("manager:authWithToken", { token, quizId });
    } catch {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [socket, quizId, navigate]);

  useEvent("connect", startGame);

  useEffect(() => {
    if (isConnected) {
      startGame();
    }
  }, [isConnected, startGame]);

  useEvent("manager:gameCreated", ({ gameId, inviteCode, background }) => {
    setGameId(gameId);
    setStatus(STATUS.SHOW_ROOM, {
      text: "Waiting for the players",
      inviteCode,
      background,
    });
    navigate(`/party/manager/${gameId}`, { replace: true });
  });

  useEvent("manager:errorMessage", (message) => {
    toast.error(message);
    navigate("/admin/dashboard", { replace: true });
  });

  useEvent("game:errorMessage", (message) => {
    toast.error(message);
    navigate("/admin/dashboard", { replace: true });
  });

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <p className="text-2xl font-bold text-white">Starting game...</p>
    </div>
  );
};

export default AdminGameStartPage;
