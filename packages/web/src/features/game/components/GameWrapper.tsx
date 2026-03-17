import type { Status } from "@quizio/common/types/game/status";
import background from "@quizio/web/assets/background.webp";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Loader from "@quizio/web/features/game/components/Loader";
import {
  useEvent,
  useSocket,
} from "@quizio/web/features/game/contexts/socketProvider";
import { usePlayerStore } from "@quizio/web/features/game/stores/player";
import { useQuestionStore } from "@quizio/web/features/game/stores/question";
import { MANAGER_SKIP_BTN } from "@quizio/web/features/game/utils/constants";
import clsx from "clsx";
import { type PropsWithChildren, useEffect, useState } from "react";
import toast from "react-hot-toast";

type Props = PropsWithChildren & {
  statusName: Status | undefined;
  onNext?: () => void;
  manager?: boolean;
};

const GameWrapper = ({ children, statusName, onNext, manager }: Props) => {
  const { isConnected } = useSocket();
  const { player } = usePlayerStore();
  const { questionStates, setQuestionStates } = useQuestionStore();
  const [isDisabled, setIsDisabled] = useState(false);
  const next = statusName ? MANAGER_SKIP_BTN[statusName] : null;

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
          src={background}
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
              {questionStates && (
                <Badge
                  variant="outline"
                  className="shadow-inset bg-white px-4 py-2 text-base font-bold text-black"
                >
                  {`${questionStates.current} / ${questionStates.total}`}
                </Badge>
              )}

              {manager && next && (
                <Button
                  variant="secondary"
                  disabled={isDisabled}
                  className={clsx("self-end", {
                    "pointer-events-none": isDisabled,
                  })}
                  onClick={handleNext}
                >
                  {next}
                </Button>
              )}
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
