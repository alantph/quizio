import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useEvent,
  useSocket,
} from "@quizio/web/features/game/contexts/socketProvider";
import { usePlayerStore } from "@quizio/web/features/game/stores/player";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";

const Room = () => {
  const { socket, isConnected } = useSocket();
  const { join } = usePlayerStore();
  const [invitation, setInvitation] = useState("");
  const [searchParams] = useSearchParams();
  const hasJoinedRef = useRef(false);

  const handleJoin = () => {
    socket?.emit("player:join", invitation);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      handleJoin();
    }
  };

  useEvent("game:successRoom", (gameId) => {
    join(gameId);
  });

  useEffect(() => {
    const pinCode = searchParams.get("pin");

    if (!isConnected || !pinCode || hasJoinedRef.current) {
      return;
    }

    socket?.emit("player:join", pinCode);
    hasJoinedRef.current = true;
  }, [searchParams, isConnected, socket]);

  return (
    <Card className="z-10 w-full max-w-80">
      <CardHeader>
        <CardTitle className="text-center text-xl">Enter PIN Code</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Input
          onChange={(e) => setInvitation(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="PIN Code here"
          className="text-center text-lg font-semibold"
        />
        <Button
          className="w-full bg-primary hover:bg-primary/90 text-white"
          onClick={handleJoin}
        >
          Join Game
        </Button>
      </CardContent>
    </Card>
  );
};

export default Room;
