import type { Status } from "@quizio/common/types/game/status";
import { STATUS } from "@quizio/common/types/game/status";
import defaultBackground from "@quizio/web/assets/background.webp";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Loader from "@quizio/web/features/game/components/Loader";
import {
  useEvent,
  useSocket,
} from "@quizio/web/features/game/contexts/socketProvider";
import { usePlayerStore } from "@quizio/web/features/game/stores/player";
import { useManagerStore } from "@quizio/web/features/game/stores/manager";
import { useQuestionStore } from "@quizio/web/features/game/stores/question";
import { MANAGER_SKIP_BTN } from "@quizio/web/features/game/utils/constants";
import clsx from "clsx";
import { type PropsWithChildren, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

type Props = PropsWithChildren & {
  statusName: Status | undefined;
  onNext?: () => void;
  manager?: boolean;
  background?: string;
};

const ACTIVE_GAME_STATUSES: string[] = [
  STATUS.SHOW_START,
  STATUS.SHOW_PREPARED,
  STATUS.SHOW_QUESTION,
  STATUS.SELECT_ANSWER,
  STATUS.SHOW_RESULT,
  STATUS.SHOW_RESPONSES,
  STATUS.SHOW_LEADERBOARD,
];

const GameWrapper = ({ children, statusName, onNext, manager, background }: Props) => {
  const { isConnected, socket } = useSocket();
  const { player } = usePlayerStore();
  const { gameId, reset } = useManagerStore();
  const { questionStates, setQuestionStates } = useQuestionStore();
  const [isDisabled, setIsDisabled] = useState(false);
  const navigate = useNavigate();

  const lastBgRef = useRef<string | undefined>(undefined);
  if (background !== undefined) {
    lastBgRef.current = background;
  }
  const activeBg = lastBgRef.current;
  const next = statusName ? MANAGER_SKIP_BTN[statusName] : null;
  const showEndGame =
    manager && statusName && ACTIVE_GAME_STATUSES.includes(statusName);
  const showBackToHome = manager && statusName === STATUS.SHOW_ROOM;

  const handleEndGame = () => {
    if (gameId) {
      socket?.emit("manager:endGame", { gameId });
    }
  };

  const handleBackToHome = () => {
    if (gameId) {
      socket?.emit("manager:abortQuiz", { gameId });
    }
    reset();
    navigate("/admin/dashboard");
  };

  useEvent("game:updateQuestion", ({ current, total }) => {
    setQuestionStates({
      current,
      total,
    });
  });

  useEvent("game:errorMessage", (message) => {
    toast.error(message);
    setIsDisabled(false);
  });

  useEffect(() => {
    setIsDisabled(false);
  }, [statusName]);

  const handleNext = () => {
    setIsDisabled(true);
    onNext?.();
  };

  return (
    <section className="relative min-h-dvh flex">
      <div className="fixed top-0 left-0 h-full w-full">
        <img
          className="pointer-events-none h-full w-full object-cover"
          src={activeBg || defaultBackground}
          alt="background"
        />
      </div>

      <div className="z-10 flex flex-1 w-full flex-col justify-between">
        {!isConnected && !statusName ? (
          <div className="flex h-full w-full flex-1 flex-col items-center justify-center">
            <Loader className="h-30" />
            <h1 className="text-4xl font-bold text-white">Connecting...</h1>
          </div>
        ) : (
          <>
            <div className="flex w-full justify-between p-4">
              <div>
                {questionStates && (
                  <Badge
                    variant="outline"
                    className="shadow-inset bg-white px-4 py-2 text-base font-bold text-black"
                  >
                    {`${questionStates.current} / ${questionStates.total}`}
                  </Badge>
                )}
                {showBackToHome && (
                  <Button variant="secondary" size="sm" onClick={handleBackToHome}>
                    Back to Home
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {showEndGame && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        End Game
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>End game early?</AlertDialogTitle>
                        <AlertDialogDescription>
                          All players will be disconnected and the game will end
                          immediately. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleEndGame}>
                          End Game
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {manager && next && (
                  <Button
                    variant="secondary"
                    disabled={isDisabled}
                    className={clsx({
                      "pointer-events-none": isDisabled,
                    })}
                    onClick={handleNext}
                  >
                    {next}
                  </Button>
                )}
              </div>
            </div>

            {children}

            {!manager && (
              <div className="z-50 flex items-center justify-between bg-white px-4 py-2">
                <p className="text-lg font-bold text-gray-800">
                  {player?.username}
                </p>
                <Badge className="bg-gray-800 px-3 py-1 text-base text-white">
                  {player?.points}
                </Badge>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default GameWrapper;
