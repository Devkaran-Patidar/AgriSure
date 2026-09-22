import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  BarChart3,
  Bell,
  ClipboardList,
  FileText,
  Handshake,
  LayoutDashboard,
  Leaf,
  MessageSquare,
  Search,
  ShieldCheck,
  Sprout,
  User,
  Wallet,
} from "lucide-react";

const NAV = {
  FARMER: [
    { to: "/farmer/dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/farmer/crops", label: "My crops", icon: Sprout },
    { to: "/farmer/contracts", label: "Agreements", icon: FileText },
    { to: "/farmer/crop-progress", label: "Crop progress", icon: Leaf },
    { to: "/farmer/payments", label: "Payments", icon: Wallet },
    { to: "/farmer/messages", label: "Messages", icon: MessageSquare },
    { to: "/farmer/notifications", label: "Notifications", icon: Bell },
    { to: "/farmer/profile", label: "Profile", icon: User },
  ],
  COMPANY: [
    { to: "/company/dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/company/find-farmers", label: "Find crops", icon: Search },
    { to: "/company/procurement", label: "Procurement", icon: ClipboardList },
    { to: "/company/negotiations", label: "Negotiations", icon: Handshake },
    { to: "/company/contracts", label: "Agreements", icon: FileText },
    { to: "/company/crop-monitoring", label: "Monitoring", icon: Sprout },
    { to: "/company/payments", label: "Payments", icon: Wallet },
    { to: "/company/messages", label: "Messages", icon: MessageSquare },
    { to: "/company/notifications", label: "Notifications", icon: Bell },
    { to: "/company/profile", label: "Profile", icon: User },
  ],
  ADMIN: [
    { to: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/admin/users", label: "Users & verification", icon: ShieldCheck },
    { to: "/admin/contracts", label: "Agreements", icon: FileText },
    { to: "/admin/payments", label: "Payments", icon: Wallet },
    { to: "/admin/disputes", label: "Disputes", icon: Handshake },
    { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  ],
};

const LABELS = {
  FARMER: "Farmer workspace",
  COMPANY: "Buyer workspace",
  ADMIN: "Admin console",
};

export default function WorkspaceLayout({ role }) {
  const { user } = useAuth();
  const items = NAV[role] || [];

  return (
    <div className="workspace-shell">
      <aside className="workspace-sidebar">
        <div className="workspace-sidebar-head">
          <p className="workspace-sidebar-eyebrow">{LABELS[role]}</p>
          <p className="workspace-sidebar-user">{user?.email}</p>
        </div>
        <nav className="workspace-nav">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to.endsWith("/dashboard")}
              className={({ isActive }) => `workspace-nav-link${isActive ? " active" : ""}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="workspace-content">
        <Outlet />
      </div>
    </div>
  );
}
