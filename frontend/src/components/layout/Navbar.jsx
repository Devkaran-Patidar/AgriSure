import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, Leaf } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getDashboardPathByRole } from "../../lib/routeSecurity";

const links = [["/", "Home"], ["/about", "About"], ["/features", "Features"], ["/services", "Services"], ["/how-it-works", "How It Works"], ["/contact", "Contact"]];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate=useNavigate();
  const dashboardPath = getDashboardPathByRole(user?.role);

  return <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
    <div className="container-page flex h-15 items-center justify-between">
      <Link to="/" className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-white"><Leaf size={22}/></span>
        <span><strong className="font-heading text-lg text-navy">AgriContract</strong><small className="block text-[10px] font-semibold text-slate-400">Secure Farming. Assured Market.</small></span>
      </Link>

      <nav className="hidden items-center gap-7 lg:flex">
        {links.map(([to,label])=><NavLink key={to} to={to} className={({isActive})=>`text-sm font-bold ${isActive?"text-primary":"text-slate-500 hover:text-primary"}`}>{label}</NavLink>)}
        {!user && <div className="relative">
          <button onClick={()=>setRegisterOpen(!registerOpen)} className="flex items-center gap-1 text-sm font-bold text-slate-500">Register <ChevronDown size={15}/></button>
          {registerOpen&&<div className="absolute right-0 top-9 w-48 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
            <Link className="block rounded-xl p-3 text-sm font-bold hover:bg-soft" to="/register/farmer">Register as Farmer</Link>
            <Link className="block rounded-xl p-3 text-sm font-bold hover:bg-soft" to="/register/company">Register as Company</Link>
          </div>}
        </div>}
        {user ? <button className="btn-primary" onClick={()=>{logout();navigate("/");}}>Logout</button> :
          <Link to="/login" className="text-sm font-bold text-slate-500">Login</Link>}
        {!user&&<Link to="/register" className="btn-primary">Get Started</Link>}
        {user&&<Link to={dashboardPath} className="btn-primary">Dashboard</Link>}
      </nav>

      <button className="lg:hidden" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button>
    </div>
    {open&&<div className="border-t border-slate-100 bg-white p-4 lg:hidden">
      <div className="container-page grid gap-2">
        {links.map(([to,label])=><Link key={to} onClick={()=>setOpen(false)} className="rounded-xl p-3 font-bold hover:bg-soft" to={to}>{label}</Link>)}
        {user?<><Link className="rounded-xl p-3 font-bold hover:bg-soft" to={dashboardPath}>Dashboard</Link><button className="btn-primary" onClick={()=>{logout();setOpen(false);navigate("/")}}>Logout</button></>:
          <><Link className="rounded-xl p-3 font-bold hover:bg-soft" to="/login">Login</Link><Link className="btn-primary" to="/register">Get Started</Link></>}
      </div>
    </div>}
  </header>
}
