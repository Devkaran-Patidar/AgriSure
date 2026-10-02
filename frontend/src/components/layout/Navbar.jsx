import { Link, NavLink, useNavigate } from "react-router-dom";
import { ChevronDown, Leaf, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getDashboardPathByRole } from "../../lib/routeSecurity";
import { useLanguage } from "../../context/LanguageContext";
import LanguageSwitcher from "../auth/LanguageSwitcher";

const publicLinks = [
  ["/", "overview"],
  ["/about", "about"],
  ["/features", "features"],
  ["/how-it-works", "howItWorks"],
  ["/contact", "contact"],
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const dashboardPath = getDashboardPathByRole(user?.role);
  const roleLabel = user?.role === "COMPANY"
    ? "Buyer workspace"
    : user?.role === "FARMER"
      ? "Farmer workspace"
      : user?.role === "ADMIN"
        ? "Admin console"
        : t("secureFarming");
  const closeMenu = () => { setOpen(false); setRegisterOpen(false); };
  const signOut = () => { logout(); closeMenu(); navigate("/"); };
  const toggleNavigation = () => {
    if (user) {
      window.dispatchEvent(new CustomEvent("workspace:open"));
      return;
    }
    setOpen((value) => !value);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to={user ? dashboardPath : "/"} className="flex items-center gap-3" onClick={closeMenu}>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-white">
            <Leaf size={22} />
          </span>
          <span>
            <strong className="font-heading text-lg text-navy">AgriSure</strong>
            <small className="block text-[10px] font-semibold text-slate-400">{roleLabel}</small>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 xl:flex">
          {!user && publicLinks.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `text-sm font-bold ${isActive ? "text-primary" : "text-slate-500 hover:text-primary"}`}
            >
              {t(label)}
            </NavLink>
          ))}

          {!user && (
            <div className="relative">
              <button onClick={() => setRegisterOpen(!registerOpen)} className="flex items-center gap-1 text-sm font-bold text-slate-500">
                {t("register")} <ChevronDown size={15} />
              </button>
              {registerOpen && (
                <div className="absolute right-0 top-9 w-48 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
                  <Link className="block rounded-xl p-3 text-sm font-bold hover:bg-soft" to="/register/farmer" onClick={closeMenu}>Register as Farmer</Link>
                  <Link className="block rounded-xl p-3 text-sm font-bold hover:bg-soft" to="/register/company" onClick={closeMenu}>{t("registerBuyer")}</Link>
                </div>
              )}
            </div>
          )}

          {user ? (
            <>
              <Link to={dashboardPath} className="btn-secondary">{t("openWorkspace")}</Link>
              <button className="btn-primary" onClick={signOut}>{t("logout")}</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-bold text-slate-500">{t("login")}</Link>
              <Link to="/register" className="btn-primary">{t("getStartedNav")}</Link>
            </>
          )}
          <LanguageSwitcher />
        </nav>

        <div className="flex items-center gap-1 xl:hidden">
          <button
            type="button"
            className="mobile-nav-icon"
            aria-label={user ? "Open workspace navigation" : (open ? "Close navigation" : "Open navigation")}
            aria-expanded={open}
            onClick={toggleNavigation}
            title={user ? "Open workspace navigation" : (open ? "Close navigation" : "Open navigation")}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && !user && (
        <div className="border-t border-slate-100 bg-white p-4 xl:hidden">
          <div className="container-page grid gap-2">
            {!user && publicLinks.map(([to, label]) => (
              <Link key={to} onClick={closeMenu} className="rounded-xl p-3 font-bold hover:bg-soft" to={to}>{t(label)}</Link>
            ))}
            {user ? (
              <>
                <Link onClick={closeMenu} className="rounded-xl p-3 font-bold hover:bg-soft" to={dashboardPath}>{t("openWorkspace")}</Link>
                <button className="btn-primary" onClick={signOut}>{t("logout")}</button>
              </>
            ) : (
              <>
                <Link onClick={closeMenu} className="rounded-xl p-3 font-bold hover:bg-soft" to="/login">Login</Link>
                <Link onClick={closeMenu} className="btn-primary" to="/register">{t("getStartedNav")}</Link>
              </>
            )}
            <div className="border-t border-slate-100 pt-3"><LanguageSwitcher /></div>
          </div>
        </div>
      )}
    </header>
  );
}
