import { Link } from "react-router-dom";
export default function Footer(){return <footer className="bg-navy py-14 text-slate-300">
  <div className="container-page grid gap-10 md:grid-cols-4">
    <div><h3 className="font-heading text-xl font-extrabold text-white">AgriContract</h3><p className="mt-4 text-sm leading-7">Assured contract farming for stable market access, transparent agreements and reliable settlement.</p></div>
    <div><h4 className="font-heading font-bold text-white">Platform</h4><div className="mt-4 grid gap-2 text-sm"><Link to="/features">Features</Link><Link to="/services">Services</Link><Link to="/how-it-works">How It Works</Link></div></div>
    <div><h4 className="font-heading font-bold text-white">Company</h4><div className="mt-4 grid gap-2 text-sm"><Link to="/about">About</Link><Link to="/contact">Contact</Link></div></div>
    <div><h4 className="font-heading font-bold text-white">Access</h4><div className="mt-4 grid gap-2 text-sm"><Link to="/login">Login</Link><Link to="/register">Register</Link></div></div>
  </div>
  <div className="container-page mt-10 border-t border-white/10 pt-6 text-xs text-slate-500">© 2026 AgriContract. Built for assured agricultural markets.</div>
</footer>}
