import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Activity,
  FolderKanban,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import Logo from "../../components/Logo.jsx";

const navItems = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "Messages", to: "/admin/messages", icon: MessageSquare },
  { label: "Activities", to: "/admin/activities", icon: Activity },
  { label: "Projects", to: "/admin/projects", icon: FolderKanban },
];

export default function AdminSidebar({ mobileOpen, onClose }) {
  const { logout } = useAuth();

  const linkClasses = ({ isActive }) =>
    `group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-gradient-to-r from-gold/10 to-transparent text-gold"
        : "text-muted hover:bg-card hover:text-heading"
    }`;

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-5">
        <span className="flex items-center gap-2.5 font-display text-lg font-semibold text-heading">
          <Logo size={26} className="text-heading" />
          Admin Panel
        </span>
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="text-muted hover:text-heading lg:hidden"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClose}
            className={linkClasses}
          >
            {({ isActive }) => (
              <>
                <span
                  className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-gold transition-opacity duration-200 ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                />
                <item.icon
                  size={18}
                  className="transition-transform duration-200 group-hover:scale-110"
                />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border px-3 py-4">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted transition-colors duration-200 hover:bg-card hover:text-gold"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-bg-secondary lg:block">
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-border bg-bg-secondary shadow-2xl animate-fade-in">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
