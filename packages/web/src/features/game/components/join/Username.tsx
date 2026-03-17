import { STATUS } from "@quizio/common/types/game/status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useEvent,
  useSocket,
} from "@quizio/web/features/game/contexts/socketProvider";
import { usePlayerStore } from "@quizio/web/features/game/stores/player";

import { type KeyboardEvent, useState } from "react";
import { useNavigate } from "react-router";

const Username = () => {
  const { socket } = useSocket();
  const { gameId, login, setStatus } = usePlayerStore();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  const handleLogin = () => {
    if (!gameId) {
      return;
    }

    socket?.emit("player:login", { gameId, data: { username } });
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };

  useEvent("game:successJoin", (gameId) => {
    setStatus(STATUS.WAIT, { text: "Waiting for the players" });
    login(username);

    navigate(`/party/${gameId}`);
  });

  return (
    <Card className="z-10 w-full max-w-80">
      <CardHeader>
        <CardTitle className="text-center text-xl">Choose a Username</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Input
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Username here"
          className="text-lg font-semibold"
        />
        <Button
          className="w-full bg-primary hover:bg-primary/90 text-white"
          onClick={handleLogin}
        >
          Enter Game
        </Button>
      </CardContent>
    </Card>
  );
};

export default Username;
