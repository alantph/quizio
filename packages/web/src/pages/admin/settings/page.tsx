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
      setMessage("Thêm admin thành công");
      loadUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await settingsApi.deleteUser(id);
      setMessage("Đã xóa admin");
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
      setMessage("Đổi mật khẩu thành công");
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
      setMessage("Reset mật khẩu thành công");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    }
  };

  return (
    <div className="space-y-8">
      {message && <p className="text-sm text-green-600">{message}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      <section>
        <h2 className="mb-4 text-lg font-semibold">Quản lý admin</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.username}</TableCell>
                <TableCell>
                  {new Date(u.createdAt).toLocaleDateString("vi-VN")}
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
                          Xóa
                        </Button>
                      </>
                    )}
                    {resetPwId === u.id && (
                      <div className="flex gap-2">
                        <Input
                          value={resetPwValue}
                          onChange={(e) => setResetPwValue(e.target.value)}
                          placeholder="Mật khẩu mới"
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
            <Label>Username mới</Label>
            <Input
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
          </div>
          <div>
            <Label>Mật khẩu</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <Button type="submit">Thêm admin</Button>
        </form>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Đổi mật khẩu của tôi</h2>
        <form onSubmit={handleChangePassword} className="space-y-3 max-w-sm">
          <div>
            <Label>Mật khẩu hiện tại</Label>
            <Input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
            />
          </div>
          <div>
            <Label>Mật khẩu mới</Label>
            <Input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
            />
          </div>
          <Button type="submit">Đổi mật khẩu</Button>
        </form>
      </section>
    </div>
  );
};

export default AdminSettingsPage;
