import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@quizio/web/assets/logo.png";
import { useAdminAuth } from "@quizio/web/features/admin/hooks/useAdminAuth";
import { useState } from "react";
import { Navigate } from "react-router";

const AdminLoginPage = () => {
  const { token, login } = useAdminAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (token) return <Navigate to="/admin/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="antialiased relative flex min-h-dvh flex-col items-center justify-center bg-secondary">
      <div className="absolute h-full w-full overflow-hidden">
        <div className="bg-primary/15 absolute -top-[15vmin] -left-[15vmin] min-h-[75vmin] min-w-[75vmin] rounded-full"></div>
        <div className="bg-primary/15 absolute -right-[15vmin] -bottom-[15vmin] min-h-[75vmin] min-w-[75vmin] rotate-45"></div>
      </div>

      <img src={logo} className="z-10 mb-10 h-16" alt="logo" />

      <Card className="z-10 w-full max-w-80">
        <CardHeader>
          <CardTitle className="text-center text-xl">Quizio Admin</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-primary text-white hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
};

export default AdminLoginPage;
