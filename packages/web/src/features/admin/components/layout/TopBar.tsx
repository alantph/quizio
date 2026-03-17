import { Button } from "@/components/ui/button";
import { useAdminAuth } from "../../hooks/useAdminAuth";

const TopBar = () => {
  const { user, logout } = useAdminAuth();

  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-3">
      <div />
      <div className="flex items-center gap-4">
        {user && <span className="text-sm text-gray-600">{user.username}</span>}
        <Button variant="outline" size="sm" onClick={logout}>
          Đăng xuất
        </Button>
      </div>
    </header>
  );
};

export default TopBar;
