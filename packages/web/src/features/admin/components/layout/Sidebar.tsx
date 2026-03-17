import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/game-history", label: "Game History" },
  { href: "/admin/settings", label: "Settings" },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="flex w-64 flex-col bg-slate-900 text-white">
      <div className="p-6">
        <h1 className="text-xl font-bold">Quizio Admin</h1>
      </div>
      <nav className="flex-1 px-4 py-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "mb-1 block rounded-md px-4 py-2 text-sm transition-colors",
              location.pathname.startsWith(item.href)
                ? "bg-slate-700 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
