import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  BarChart3,
  Bell,
  ChevronLeft,
  ClipboardList,
  FileText,
  Handshake,
  LayoutDashboard,
  Leaf,
  MessageSquare,
  Menu,
  Search,
  ShieldCheck,
  Sprout,
  User,
  Wallet,
  X,
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

const COLLAPSE_KEY = "workspace_sidebar_collapsed";

export default function WorkspaceLayout({ role }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const items = NAV[role] || [];

  // Desktop fold/unfold: persisted so the choice sticks across page loads.
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === "1");
  // Mobile off-canvas drawer: closed by default, opened with the hamburger button.
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  // Close the mobile drawer whenever the route changes, and stop the page
  // from scrolling behind it while it's open.
  useEffect(() => setMobileOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <div className={`workspace-shell${mobileOpen ? " mobile-open" : ""}`}>
      <div className="workspace-mobile-bar">
        <button
          type="button"
          className="workspace-fold-btn"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
        >
          <Menu size={16} />
        </button>
        <span>{LABELS[role]}</span>
      </div>

      <div className="workspace-backdrop" onClick={() => setMobileOpen(false)} />

      <aside className={`workspace-sidebar${collapsed ? " is-collapsed" : ""}`}>
        <div className="workspace-sidebar-head">
          <div className="workspace-sidebar-role">
            <span className="workspace-sidebar-role-label">{LABELS[role]}</span>
            <span className="workspace-sidebar-role-user">{user?.email}</span>
          </div>
          <button
            type="button"
            className="workspace-fold-btn desktop-only"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="workspace-mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="workspace-nav">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to.endsWith("/dashboard")}
              title={collapsed ? label : undefined}
              className={({ isActive }) => `workspace-nav-link${isActive ? " active" : ""}`}
            >
              <Icon size={18} />
              <span className="workspace-nav-label">{label}</span>
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