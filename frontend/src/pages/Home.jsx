import { Link } from "react-router-dom";
import { ArrowRight,CheckCircle2,FileCheck2,Handshake,IndianRupee,Sprout,ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { demoParticipants } from "../data/demoParticipants";

export default function Home(){
 return <>
  <section className="overflow-hidden bg-gradient-to-br from-white via-white to-[#EFF8F2] py-20 lg:py-24">
   <div className="container-page grid items-center gap-12 lg:grid-cols-2">
    <motion.div initial={{opacity:0,x:-30}} animate={{opacity:1,x:0}}>
      <span className="eyebrow"><Sprout size={15}/> Assured Contract Farming Platform</span>
      <h1 className="mt-7 font-heading text-5xl font-extrabold leading-[1.04] tracking-tight text-navy md:text-6xl">Assured Contract Farming for Stable Market Access</h1>
      <p className="mt-6 max-w-xl text-lg leading-8 text-slate-500">Empowering farmers with verified buyers, secure digital contracts, transparent pricing, crop monitoring and timely milestone payments.</p>
      <div className="mt-8 flex flex-wrap gap-3"><Link className="btn-primary" to="/register/farmer">Register as Farmer <ArrowRight size={16}/></Link><Link className="btn-secondary" to="/register/company">Register as Company</Link></div>
      <div className="mt-7 flex flex-wrap gap-5 text-sm font-bold text-slate-600">{["Trusted by Farmers","Verified Buyers","Secure Payments","Digital Contracts"].map(x=><span key={x} className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary"/>{x}</span>)}</div>
    </motion.div>
    <HeroVisual/>
   </div>
  </section>

  <section className="section-padding bg-soft">
   <div className="container-page">
    <div className="flex flex-wrap items-end justify-between gap-4">
     <div><span className="eyebrow">Sample Network</span><h2 className="section-title">See how the marketplace connects</h2></div>
     <p className="max-w-md text-sm leading-7 text-slate-500">A preview of the farmer and buyer profiles that can work together through verified contracts.</p>
    </div>
    <div className="mt-10 grid gap-5 md:grid-cols-2">
     {demoParticipants.map((participant) => {
      const isFarmer = participant.type === "FARMER";
      const Icon = isFarmer ? Sprout : Handshake;
      return <div className="card" key={participant.type}>
       <div className="flex items-start justify-between gap-4">
        <div className="icon-box"><Icon size={22} /></div>
        <span className="rounded-full bg-[#EAF4ED] px-3 py-1 text-xs font-extrabold text-primary">{isFarmer ? "Farmer / FPO" : "Company / Buyer"}</span>
       </div>
       <h3 className="mt-5 font-heading text-xl font-extrabold text-navy">{participant.name}</h3>
       <p className="mt-2 text-sm font-bold text-slate-600">{participant.detail}</p>
       <p className="mt-3 text-sm leading-7 text-slate-500">{participant.focus}</p>
      </div>;
     })}
    </div>
   </div>
  </section>

  <section className="section-padding"><div className="container-page"><div className="text-center"><span className="eyebrow">Why AgriContract</span><h2 className="section-title">Turn uncertainty into an agreed workflow</h2></div>
   <div className="mt-12 grid gap-5 md:grid-cols-3">{[
    [Handshake,"Verified Partnerships","Connect farmers with buyers and structure expectations before cultivation."],
    [FileCheck2,"Digital Contracts","Keep price, quantity, grade, delivery and approval terms in one workflow."],
    [IndianRupee,"Milestone Payments","Track escrow, delivery milestones and settlement records transparently."]
   ].map(([Icon,title,desc])=><div className="card" key={title}><div className="icon-box"><Icon/></div><h3 className="mt-5 font-heading text-lg font-bold text-navy">{title}</h3><p className="mt-3 text-sm leading-7 text-slate-500">{desc}</p></div>)}</div>
  </div></section>

  <section className="section-padding bg-soft"><div className="container-page grid gap-10 lg:grid-cols-2 lg:items-center"><div><span className="eyebrow">Built Around the Contract</span><h2 className="section-title">From onboarding to signed agreement and settlement</h2><p className="section-description">The platform is structured around a traceable contract lifecycle rather than an unstructured marketplace chat.</p><Link to="/how-it-works" className="btn-primary mt-7">See How It Works</Link></div><div className="grid gap-4 sm:grid-cols-2">{["Onboard & Verify","Create Contract","Negotiate & Approve","Monitor Crop","Inspect Quality","Release Payment"].map((x,i)=><div className="rounded-2xl bg-white p-5 shadow-sm" key={x}><span className="text-xs font-extrabold text-primary">0{i+1}</span><h3 className="mt-2 font-heading font-bold text-navy">{x}</h3></div>)}</div></div></section>

  <footer className="bg-navy py-14 text-slate-300">
  <div className="container-page grid gap-10 md:grid-cols-4">
    <div><h3 className="font-heading text-xl font-extrabold text-white">AgriContract</h3><p className="mt-4 text-sm leading-7">Assured contract farming for stable market access, transparent agreements and reliable settlement.</p></div>
    <div><h4 className="font-heading font-bold text-white">Platform</h4><div className="mt-4 grid gap-2 text-sm"><Link to="/features">Features</Link><Link to="/services">Services</Link><Link to="/how-it-works">How It Works</Link></div></div>
    <div><h4 className="font-heading font-bold text-white">Company</h4><div className="mt-4 grid gap-2 text-sm"><Link to="/about">About</Link><Link to="/contact">Contact</Link></div></div>
    <div><h4 className="font-heading font-bold text-white">Access</h4><div className="mt-4 grid gap-2 text-sm"><Link to="/login">Login</Link><Link to="/register">Register</Link></div></div>
  </div>
  <div className="container-page mt-10 border-t border-white/10 pt-6 text-xs text-slate-500">© 2026 AgriContract. Built for assured agricultural markets.</div>
</footer>
 </>;

}
function HeroVisual(){return <div className="relative mx-auto h-[500px] w-full max-w-[560px]"><div className="absolute inset-8 rounded-[34px] border border-slate-200 bg-white shadow-2xl shadow-slate-200/60"/><div className="absolute left-1/2 top-24 w-48 -translate-x-1/2 rounded-3xl border-8 border-navy bg-white p-5 shadow-xl"><div className="h-2 w-16 rounded bg-slate-500"/><div className="mt-4 h-2 rounded bg-slate-200"/><div className="mt-3 h-2 w-4/5 rounded bg-slate-200"/><div className="mt-8 rounded-xl bg-[#EAF4ED] p-4"><div className="h-8 rounded-lg bg-white"/><div className="mt-3 h-2 w-2/3 rounded bg-primary/50"/></div></div><div className="absolute bottom-14 left-10 h-36 w-28 rounded-t-[50px] bg-primary"/><div className="absolute bottom-40 left-16 h-14 w-14 rounded-full bg-navy"/><div className="absolute bottom-14 right-10 h-36 w-28 rounded-t-[50px] bg-navy"/><div className="absolute bottom-40 right-16 h-14 w-14 rounded-full bg-slate-700"/><div className="absolute left-0 top-12 rounded-2xl bg-white px-4 py-3 text-xs font-extrabold text-navy shadow-xl">✓ Contract Approved</div><div className="absolute right-0 top-48 rounded-2xl bg-white px-4 py-3 text-xs font-extrabold text-navy shadow-xl">₹ Payment Released</div><div className="absolute bottom-0 left-1/2 h-20 w-4/5 -translate-x-1/2 rounded-[50%] bg-[#D9EBDD]"/></div>}
