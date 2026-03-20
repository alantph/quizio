import type { StatusDataMap } from "@quizio/common/types/game/status";
import AnswerButton from "@quizio/web/features/game/components/AnswerButton";
import { useManagerStore } from "@quizio/web/features/game/stores/manager";
import {
  ANSWERS_COLORS,
  ANSWERS_ICONS,
} from "@quizio/web/features/game/utils/constants";
import clsx from "clsx";

type Props = {
  data: StatusDataMap["SELECT_ANSWER"];
};

const ManagerSelectAnswer = ({
  data: { question, answers, totalPlayer },
}: Props) => {
  const { players, answeredPlayers } = useManagerStore();
  const answeredSet = new Set(answeredPlayers.map((p) => p.playerId));
  const answeredCount = answeredPlayers.length;
  const total = players.length || totalPlayer;

  const progressPercent =
    total > 0 ? Math.round((answeredCount / total) * 100) : 0;

  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center gap-6 px-6">
      <h2 className="text-center text-2xl font-bold text-white drop-shadow-lg md:text-4xl">
        {question}
      </h2>

      <div className="grid w-full max-w-3xl grid-cols-2 gap-3">
        {answers.map((answer, index) => {
          const Icon = ANSWERS_ICONS[index];
          const color = ANSWERS_COLORS[index];
          return (
            <AnswerButton
              key={index}
              icon={Icon}
              className={clsx(color, "cursor-default text-white")}
            >
              {answer}
            </AnswerButton>
          );
        })}
      </div>

      <div className="w-full max-w-md">
        <div className="mb-2 flex justify-between text-sm font-semibold text-white">
          <span>Answered</span>
          <span>
            {answeredCount} / {total}
          </span>
        </div>
        <div className="h-4 w-full overflow-hidden rounded-full bg-white/30">
          <div
            className="h-full rounded-full bg-green-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex w-full max-w-3xl flex-wrap justify-center gap-2">
        {players.map((player) => {
          const hasAnswered = answeredSet.has(player.id);
          return (
            <div
              key={player.id}
              className={clsx(
                "flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium transition-all duration-300",
                hasAnswered
                  ? "scale-105 bg-green-500 text-white"
                  : "bg-white/20 text-white/70",
              )}
            >
              <span>{hasAnswered ? "✓" : "·"}</span>
              <span>{player.username}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ManagerSelectAnswer;
