import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileCheck2,
  Handshake,
  IndianRupee,
  ShieldCheck,
  Sprout,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { demoParticipants } from "../data/demoParticipants";
import { useLanguage } from "../context/LanguageContext";
import homeImage from "../assets/homepage.png";
const workflow = [
  ["01", "Onboard & verify", Users],
  ["02", "Create contract", FileCheck2],
  ["03", "Monitor crop", Sprout],
  ["04", "Inspect quality", ShieldCheck],
  ["05", "Release payment", IndianRupee],
  ["06", "Review performance", BarChart3],
];

export default function Home() {
  const { t } = useLanguage();
  return (
    <>
      <section className="overflow-hidden bg-gradient-to-br from-white via-white to-[#EFF8F2] py-16 ">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <span className="eyebrow"><Sprout size={15} /> {t("homeEyebrow")}</span>
            <h1 className="mt-7 max-w-2xl font-heading text-5xl font-extrabold leading-[1.04] tracking-tight text-navy md:text-6xl">{t("homeTitle")}</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-500">{t("homeDescription")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="btn-primary" to="/register/farmer">{t("registerAsFarmer")} <ArrowRight size={16} /></Link>
              <Link className="btn-secondary" to="/register/company">{t("registerAsCompany")}</Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-5 text-sm font-bold text-slate-600">
              {["Verified participants", "Agreed pricing", "Traceable milestones", "Protected payouts"].map((item) => <span key={item} className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" />{item}</span>)}
            </div>
          </motion.div>
          <HeroVisual />
        </div>
      </section>

      <section className="border-y border-[#DCE9DF] bg-white py-7">
        <div className="container-page grid gap-6 sm:grid-cols-3">
          {[
            ["01", "Plan before planting", "Agree crop, grade, quantity and delivery terms upfront."],
            ["02", "Track the growing season", "Keep updates, inspections and approvals in one shared record."],
            ["03", "Settle on verified outcomes", "Release milestone payments when both sides can see progress."],
          ].map(([number, title, description]) => <div className="flex gap-4" key={number}><span className="font-heading text-2xl font-extrabold text-primary">{number}</span><div><h2 className="font-heading text-sm font-extrabold text-navy">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{description}</p></div></div>)}
        </div>
      </section>

      <section className="section-padding bg-soft">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><span className="eyebrow">{t("connectedNetwork")}</span><h2 className="section-title">{t("networkTitle")}</h2></div>
            <p className="max-w-md text-sm leading-7 text-slate-500">{t("networkDescription")}</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {demoParticipants.map((participant) => {
              const isFarmer = participant.type === "FARMER";
              const Icon = isFarmer ? Sprout : Handshake;
              return <div className="card" key={participant.type}><div className="flex items-start justify-between gap-4"><div className="icon-box"><Icon size={22} /></div><span className="rounded-full bg-[#EAF4ED] px-3 py-1 text-xs font-extrabold text-primary">{isFarmer ? "Farmer / FPO" : "Company / Buyer"}</span></div><h3 className="mt-5 font-heading text-xl font-extrabold text-navy">{participant.name}</h3><p className="mt-2 text-sm font-bold text-slate-600">{participant.detail}</p><p className="mt-3 text-sm leading-7 text-slate-500">{participant.focus}</p></div>;
            })}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-page">
          <div className="text-center"><span className="eyebrow">{t("whyPlatform")}</span><h2 className="section-title">{t("fairerPath")}</h2></div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[[Handshake, "Build trusted partnerships", "Match production plans with buyers who are verified and ready to commit."], [FileCheck2, "Make every term clear", "Keep price, quantity, quality, delivery and approvals visible to both sides."], [IndianRupee, "Pay for real progress", "Connect inspections and milestones to a transparent settlement record."]].map(([Icon, title, description]) => <div className="card" key={title}><div className="icon-box"><Icon /></div><h3 className="mt-5 font-heading text-lg font-bold text-navy">{title}</h3><p className="mt-3 text-sm leading-7 text-slate-500">{description}</p></div>)}
          </div>
        </div>
      </section>

      <section className="section-padding bg-soft">
        <div className="container-page grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div><span className="eyebrow">{t("features")}</span><h2 className="section-title">{t("workflowTitle")}</h2><p className="section-description">{t("workflowDescription")}</p><Link to="/how-it-works" className="btn-primary mt-7">{t("exploreWorkflow")} <ArrowRight size={16} /></Link></div>
          <div className="grid gap-4 sm:grid-cols-2">{workflow.map(([number, label, Icon]) => <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm" key={label}><div className="icon-box h-11 w-11 shrink-0"><Icon size={19} /></div><div><span className="text-xs font-extrabold text-primary">{number}</span><h3 className="mt-1 font-heading text-sm font-bold text-navy">{label}</h3></div></div>)}</div>
        </div>
      </section>

      <footer className="bg-navy py-14 text-slate-300">
        <div className="container-page grid gap-10 md:grid-cols-4">
          <div><h3 className="font-heading text-xl font-extrabold text-white">AgriContract</h3><p className="mt-4 text-sm leading-7">Assured contract farming for stable market access, transparent agreements and reliable settlement.</p></div>
          <div><h4 className="font-heading font-bold text-white">Platform</h4><div className="mt-4 grid gap-2 text-sm"><Link to="/features">Features</Link><Link to="/services">Services</Link><Link to="/how-it-works">How It Works</Link></div></div>
          <div><h4 className="font-heading font-bold text-white">Company</h4><div className="mt-4 grid gap-2 text-sm"><Link to="/about">About</Link><Link to="/contact">Contact</Link></div></div>
          <div><h4 className="font-heading font-bold text-white">Access</h4><div className="mt-4 grid gap-2 text-sm"><Link to="/login">Login</Link><Link to="/register">Register</Link></div></div>
        </div>
        <div className="container-page mt-10 border-t border-white/10 pt-6 text-xs text-slate-500">© 2026 AgriContract. Built for assured agricultural markets.</div>
      </footer>
    </>
  );
}

function HeroVisual() {
  return <div className="relative mx-auto w-full max-w-[560px]"><div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl shadow-slate-200/60"><img src={homeImage} alt="Rows of crops growing in a sunlit field" className="aspect-[4/5] w-full object-cover sm:aspect-[5/4]" /><div className="absolute inset-0 bg-gradient-to-t from-[#0F2418]/75 via-transparent to-transparent" /><div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8"><span className="text-xs font-extrabold uppercase tracking-[.16em] text-[#C8E8CF]">Season 2026</span><h2 className="mt-2 max-w-sm font-heading text-2xl font-extrabold">From a trusted field to a reliable market.</h2><div className="mt-5 flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-white/15 px-3 py-2 backdrop-blur-sm">Verified buyer</span><span className="rounded-full bg-white/15 px-3 py-2 backdrop-blur-sm">₹ Milestone funded</span></div></div></div><div className="absolute -left-3 top-8 hidden items-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs font-extrabold text-navy shadow-xl sm:flex"><ShieldCheck size={15} className="text-primary" /> Contract approved</div><div className="absolute -right-3 bottom-12 hidden items-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs font-extrabold text-navy shadow-xl sm:flex"><CheckCircle2 size={15} className="text-primary" /> Harvest milestone</div></div>;
}
