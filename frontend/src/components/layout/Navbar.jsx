import { Link, NavLink, useNavigate } from "react-router-dom";
import { ChevronDown, Leaf, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getDashboardPathByRole } from "../../lib/routeSecurity";

const publicLinks = [
  ["/", "Overview"],
  ["/about", "About"],
  ["/features", "Features"],
  ["/how-it-works", "How It Works"],
  ["/contact", "Contact"],
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dashboardPath = getDashboardPathByRole(user?.role);
  const roleLabel = user?.role === "COMPANY"
    ? "Buyer workspace"
    : user?.role === "FARMER"
      ? "Farmer workspace"
      : user?.role === "ADMIN"
        ? "Admin console"
        : "Secure Farming. Assured Market.";
  const closeMenu = () => { setOpen(false); setRegisterOpen(false); };
  const signOut = () => { logout(); closeMenu(); navigate("/"); };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to={user ? dashboardPath : "/"} className="flex items-center gap-3" onClick={closeMenu}>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-white">
            <Leaf size={22} />
          </span>
          <span>
            <strong className="font-heading text-lg text-navy">AgriContract</strong>
            <small className="block text-[10px] font-semibold text-slate-400">{roleLabel}</small>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {!user && publicLinks.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `text-sm font-bold ${isActive ? "text-primary" : "text-slate-500 hover:text-primary"}`}
            >
              {label}
            </NavLink>
          ))}

          {!user && (
            <div className="relative">
              <button onClick={() => setRegisterOpen(!registerOpen)} className="flex items-center gap-1 text-sm font-bold text-slate-500">
                Register <ChevronDown size={15} />
              </button>
              {registerOpen && (
                <div className="absolute right-0 top-9 w-48 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
                  <Link className="block rounded-xl p-3 text-sm font-bold hover:bg-soft" to="/register/farmer" onClick={closeMenu}>Register as Farmer</Link>
                  <Link className="block rounded-xl p-3 text-sm font-bold hover:bg-soft" to="/register/company" onClick={closeMenu}>Register as Buyer</Link>
                </div>
              )}
            </div>
          )}

          {user ? (
            <>
              <Link to={dashboardPath} className="btn-secondary">Open workspace</Link>
              <button className="btn-primary" onClick={signOut}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-bold text-slate-500">Login</Link>
              <Link to="/register" className="btn-primary">Get Started</Link>
            </>
          )}
        </nav>

        <button
          className="rounded-xl p-2 text-slate-600 hover:bg-soft hover:text-primary lg:hidden"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white p-4 lg:hidden">
          <div className="container-page grid gap-2">
            {!user && publicLinks.map(([to, label]) => (
              <Link key={to} onClick={closeMenu} className="rounded-xl p-3 font-bold hover:bg-soft" to={to}>{label}</Link>
            ))}
            {user ? (
              <>
                <Link onClick={closeMenu} className="rounded-xl p-3 font-bold hover:bg-soft" to={dashboardPath}>Open workspace</Link>
                <button className="btn-primary" onClick={signOut}>Logout</button>
              </>
            ) : (
              <>
                <Link onClick={closeMenu} className="rounded-xl p-3 font-bold hover:bg-soft" to="/login">Login</Link>
                <Link onClick={closeMenu} className="btn-primary" to="/register">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
