import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEvent } from "@quizio/web/features/game/contexts/socketProvider";
import { type KeyboardEvent, useState } from "react";
import toast from "react-hot-toast";

type Props = {
  onSubmit: (_credentials: { username: string; password: string }) => void;
};

const ManagerPassword = ({ onSubmit }: Props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    onSubmit({ username, password });
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  useEvent("manager:errorMessage", (message) => {
    toast.error(message);
  });

  return (
    <Card className="z-10 w-full max-w-80">
      <CardHeader>
        <CardTitle className="text-center text-xl">Manager Login</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="manager-username">Username</Label>
          <Input
            id="manager-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Username"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="manager-password">Password</Label>
          <Input
            id="manager-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Password"
          />
        </div>
        <Button
          className="w-full bg-primary hover:bg-primary/90 text-white"
          onClick={handleSubmit}
        >
          Login
        </Button>
      </CardContent>
    </Card>
  );
};

export default ManagerPassword;
