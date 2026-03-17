import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type AdminUserItem,
  settingsApi,
} from "@quizio/web/features/admin/api/settings";
import { useAdminStore } from "@quizio/web/features/admin/stores/admin";
import { useEffect, useState } from "react";
import { Navigate } from "react-router";

const AdminSettingsPage = () => {
  const { token, user } = useAdminStore();
  if (!token) return <Navigate to="/admin/login" replace />;

  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [resetPwId, setResetPwId] = useState<string | null>(null);
  const [resetPwValue, setResetPwValue] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      const data = await settingsApi.listUsers();
      setUsers(data);
    } catch {}
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await settingsApi.addUser(newUsername, newPassword);
      setNewUsername("");
      setNewPassword("");
      setMessage("Admin added successfully");
      loadUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await settingsApi.deleteUser(id);
      setMessage("Admin deleted");
      loadUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await settingsApi.changePassword(currentPw, newPw);
      setCurrentPw("");
      setNewPw("");
      setMessage("Password changed successfully");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    }
  };

  const handleResetPassword = async (id: string) => {
    if (!resetPwValue) return;
    try {
      await settingsApi.resetUserPassword(id, resetPwValue);
      setResetPwId(null);
      setResetPwValue("");
      setMessage("Password reset successfully");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    }
  };

  return (
    <div className="space-y-8">
      {message && <p className="text-sm text-green-600">{message}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      <section>
        <h2 className="mb-4 text-lg font-semibold">Admin Management</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.username}</TableCell>
                <TableCell>
                  {new Date(u.createdAt).toLocaleDateString("en-US")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {u.username !== user?.username && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setResetPwId(resetPwId === u.id ? null : u.id)
                          }
                        >
                          Reset PW
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteUser(u.id)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                    {resetPwId === u.id && (
                      <div className="flex gap-2">
                        <Input
                          value={resetPwValue}
                          onChange={(e) => setResetPwValue(e.target.value)}
                          placeholder="New password"
                          className="w-36"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleResetPassword(u.id)}
                        >
                          OK
                        </Button>
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <form onSubmit={handleAddUser} className="mt-4 flex items-end gap-2">
          <div>
            <Label>New username</Label>
            <Input
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <Button type="submit">Add admin</Button>
        </form>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Change my password</h2>
        <form onSubmit={handleChangePassword} className="space-y-3 max-w-sm">
          <div>
            <Label>Current password</Label>
            <Input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
            />
          </div>
          <div>
            <Label>New password</Label>
            <Input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
            />
          </div>
          <Button type="submit">Change password</Button>
        </form>
      </section>
    </div>
  );
};

export default AdminSettingsPage;
