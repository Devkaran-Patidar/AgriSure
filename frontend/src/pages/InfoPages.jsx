import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileCheck2,
  Gavel,
  Handshake,
  IndianRupee,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  Sprout,
  Users,
  Wallet,
} from "lucide-react";
import PageHero from "../components/ui/PageHero";

// Stand-in photography (Lorem Picsum, free to use while prototyping) — swap the
// `img.*` URLs below for licensed AgriContract photography before shipping.
const img = {
  about: "https://picsum.photos/seed/agrisure-about/800/1000",
  features: "https://picsum.photos/seed/agrisure-features/800/1000",
  spotlight: "https://picsum.photos/seed/agrisure-spotlight/900/700",
  services: "https://picsum.photos/seed/agrisure-services/800/1000",
  how: "https://picsum.photos/seed/agrisure-how/800/1000",
  contact: "https://picsum.photos/seed/agrisure-contact/900/560",
};

const HERO = {
  about: {
    eyebrow: "About AgriContract",
    title: "A structured digital layer for contract farming",
    description:
      "AgriContract connects farmers, FPOs and buyers through verified onboarding, transparent agreements and traceable execution.",
    image: img.about,
    badges: [
      { icon: ShieldCheck, label: "Verified network" },
      { icon: Handshake, label: "Fair agreements" },
    ],
  },
  features: {
    eyebrow: "Features",
    title: "Everything around the contract lifecycle",
    description:
      "Onboarding, contracts, negotiation, milestones, payments, monitoring, disputes and analytics are designed as one connected workflow.",
    image: img.features,
    badges: [
      { icon: FileCheck2, label: "Digital contracts" },
      { icon: Wallet, label: "Escrow tracked" },
    ],
  },
  services: {
    eyebrow: "Services",
    title: "Tools for farmers, buyers and platform operations",
    description: "Give each role the tools it needs while keeping shared contract records consistent.",
    image: img.services,
    badges: [
      { icon: Users, label: "Role-based tools" },
      { icon: Eye, label: "Shared visibility" },
    ],
  },
  how: {
    eyebrow: "How It Works",
    title: "A traceable journey from registration to settlement",
    description:
      "Verify participants, agree terms, sign the contract, monitor milestones and release funds against verified outcomes.",
    image: img.how,
    badges: [
      { icon: CheckCircle2, label: "8-step workflow" },
      { icon: IndianRupee, label: "Milestone payouts" },
    ],
  },
  contact: {
    eyebrow: "Contact",
    title: "Talk to the AgriContract team",
    description: "For pilots, buyer onboarding, farmer programs or platform questions, use the contact form below.",
  },
};

export default function InfoPage({ type }) {
  if (type === "contact") return <ContactPage />;
  if (type === "how") return <HowItWorksPage />;
  if (type === "features") return <FeaturesPage />;
  if (type === "services") return <ServicesPage />;
  return <AboutPage />;
}

// ===================================================================
// About
// ===================================================================
function AboutPage() {
  const values = [
    { icon: ShieldCheck, title: "Trust and transparency", desc: "Every participant is verified and every term is recorded before work begins." },
    { icon: Handshake, title: "Assured market access", desc: "Farmers agree terms with verified buyers instead of relying on uncertain spot sales." },
    { icon: FileCheck2, title: "Paperless contract lifecycle", desc: "Drafting, negotiation, signing and settlement all live in one digital record." },
    { icon: MapPin, title: "Regional accessibility", desc: "Built for participants working across regions and languages, not a single mandi." },
    { icon: Eye, title: "Traceable execution", desc: "Crop progress, inspections and payments stay visible to everyone on the contract." },
    { icon: BarChart3, title: "Operational oversight", desc: "Platform administrators can monitor activity and step in when something needs attention." },
  ];

  return (
    <>
      <PageHero {...HERO.about} />

      <section className="section-padding">
        <div className="container-page max-w-3xl text-center">
          <span className="eyebrow">Why we exist</span>
          <h2 className="section-title">Contract farming, without the guesswork</h2>
          <p className="section-description">
            Informal agreements between farmers and buyers often break down over unclear pricing, missed
            deliveries or disputed quality. AgriContract turns that handshake into a structured process —
            verified profiles, agreed terms, monitored progress and milestone-based payments — so both sides
            know exactly where an agreement stands at every stage.
          </p>
        </div>
      </section>

      <section className="section-padding bg-soft">
        <div className="container-page">
          <div className="text-center">
            <span className="eyebrow">What we stand for</span>
            <h2 className="section-title">Principles behind the platform</h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {values.map(({ icon: Icon, title, desc }) => (
              <div className="card" key={title}>
                <div className="icon-box"><Icon size={22} /></div>
                <h3 className="mt-5 font-heading text-lg font-bold text-navy">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}

// ===================================================================
// Features
// ===================================================================
function FeaturesPage() {
  const features = [
    { icon: Users, title: "Multi-role onboarding", desc: "Separate, guided sign-up flows for farmers, companies and admins." },
    { icon: ShieldCheck, title: "Document verification", desc: "Identity and business documents reviewed before an account goes live." },
    { icon: FileCheck2, title: "Contract templates", desc: "Standardised terms for price, quantity, grade and delivery." },
    { icon: MessageSquare, title: "Negotiation history", desc: "Every counter-offer and approval kept on record against the contract." },
    { icon: CheckCircle2, title: "Digital signing", desc: "Both parties sign off before an agreement becomes active." },
    { icon: ClipboardList, title: "Milestone tracking", desc: "Delivery and quality milestones tied directly to payment releases." },
    { icon: Wallet, title: "Escrow ledger", desc: "Funding and release transactions recorded in a transparent ledger." },
    { icon: Sprout, title: "Crop monitoring", desc: "Farmers log crop updates buyers and inspectors can follow." },
    { icon: Gavel, title: "Dispute resolution", desc: "A structured queue for raising, reviewing and resolving disagreements." },
  ];

  return (
    <>
      <PageHero {...HERO.features} />

      <section className="section-padding">
        <div className="container-page">
          <div className="text-center">
            <span className="eyebrow">Platform capabilities</span>
            <h2 className="section-title">One workflow, every stage covered</h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <div className="card" key={title}>
                <div className="icon-box"><Icon size={22} /></div>
                <h3 className="mt-5 font-heading text-lg font-bold text-navy">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-soft">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="overflow-hidden rounded-[28px] border border-slate-200 shadow-xl shadow-slate-200/60 lg:order-2">
            <img src={img.spotlight} alt="" className="aspect-[4/3] w-full object-cover" loading="lazy" />
          </div>
          <div className="lg:order-1">
            <span className="eyebrow">Built for accountability</span>
            <h2 className="section-title">Nothing happens off the record</h2>
            <p className="section-description">
              Milestone payments only release against logged crop updates and completed inspections, so
              buyers pay for verified progress and farmers get paid on a predictable schedule.
            </p>
            <ul className="mt-7 grid gap-3">
              {["Escrow funded before work begins", "Inspection sign-off tied to each milestone", "Admins can audit any contract end to end"].map((line) => (
                <li key={line} className="flex items-start gap-3 text-sm font-bold text-slate-600">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-primary" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}

// ===================================================================
// Services
// ===================================================================
function ServicesPage() {
  const groups = [
    {
      title: "For farmers",
      icon: Sprout,
      items: ["Guided onboarding and verification", "Crop listing and progress logging", "Milestone payment visibility"],
    },
    {
      title: "For buyers",
      icon: Handshake,
      items: ["Procurement and sourcing workflows", "Negotiation and contract administration", "Quality inspection coordination"],
    },
    {
      title: "Platform operations",
      icon: BarChart3,
      items: ["Verification and account oversight", "Payment and dispute monitoring", "Reporting and data exports"],
    },
  ];

  return (
    <>
      <PageHero {...HERO.services} />

      <section className="section-padding">
        <div className="container-page">
          <div className="text-center">
            <span className="eyebrow">Organised by role</span>
            <h2 className="section-title">The right tools for each side of the contract</h2>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {groups.map(({ title, icon: Icon, items }) => (
              <div className="card" key={title}>
                <div className="icon-box"><Icon size={22} /></div>
                <h3 className="mt-5 font-heading text-xl font-extrabold text-navy">{title}</h3>
                <ul className="mt-5 grid gap-3">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-500">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}

// ===================================================================
// How it works
// ===================================================================
function HowItWorksPage() {
  const steps = [
    { icon: Users, title: "Register and verify", desc: "Farmers and buyers sign up and submit documents for review." },
    { icon: FileCheck2, title: "Create contract terms", desc: "Price, quantity, grade and delivery terms are drafted for the agreement." },
    { icon: MessageSquare, title: "Negotiate and approve", desc: "Both sides discuss and adjust terms until they're satisfied." },
    { icon: CheckCircle2, title: "Digitally sign", desc: "The agreement is signed and becomes an active contract." },
    { icon: Wallet, title: "Fund escrow and track milestones", desc: "The buyer funds escrow against agreed delivery milestones." },
    { icon: Sprout, title: "Monitor crop and inspect quality", desc: "Crop updates and inspections are logged against the contract." },
    { icon: IndianRupee, title: "Release milestone payment", desc: "Funds release from escrow as milestones are verified." },
    { icon: Gavel, title: "Resolve disputes if needed", desc: "Either party can raise a dispute for admin review and resolution." },
  ];

  return (
    <>
      <PageHero {...HERO.how} />

      <section className="section-padding">
        <div className="container-page max-w-3xl">
          <div className="relative">
            <div className="absolute left-5 top-2 bottom-2 hidden w-px bg-[#DCE9DF] sm:block" aria-hidden="true" />
            <div className="grid gap-5">
              {steps.map(({ icon: Icon, title, desc }, index) => (
                <div className="relative flex gap-4 sm:gap-5" key={title}>
                  <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-primary bg-white font-heading font-extrabold text-primary">
                    {index + 1}
                  </span>
                  <div className="card flex-1">
                    <div className="flex items-center gap-3">
                      <Icon size={18} className="text-primary" />
                      <h3 className="font-heading font-bold text-navy">{title}</h3>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-slate-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}

// ===================================================================
// Contact
// ===================================================================
function ContactPage() {
  const support = [
    { icon: Users, label: "Farmer onboarding" },
    { icon: ShieldCheck, label: "Buyer verification" },
    { icon: FileCheck2, label: "Contract workflow" },
    { icon: Wallet, label: "Payment and milestone visibility" },
    { icon: Sprout, label: "Monitoring and inspection" },
    { icon: Gavel, label: "Dispute coordination" },
  ];

  return (
    <>
      <PageHero {...HERO.contact} />

      <section className="section-padding">
        <div className="container-page grid gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="card">
            <h2 className="font-heading text-2xl font-extrabold text-navy">Send an enquiry</h2>
            <p className="mt-2 text-sm text-slate-500">We usually reply within one business day.</p>
            <form
              className="mt-6 grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                alert("Enquiry captured locally. Connect this form to the backend contact endpoint when ready.");
              }}
            >
              <div>
                <label className="label">Name</label>
                <input className="input" placeholder="Your full name" />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" placeholder="you@example.com" />
              </div>
              <div>
                <label className="label">I am a</label>
                <select className="input">
                  <option>Farmer</option>
                  <option>Company / Buyer</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="label">Message</label>
                <textarea className="input min-h-32" placeholder="How can we help?" />
              </div>
              <button className="btn-primary justify-self-start">
                Submit <ArrowRight size={16} />
              </button>
            </form>
          </div>

          <div>
            <h2 className="font-heading text-2xl font-extrabold text-navy">What we support</h2>
            <ul className="mt-6 grid gap-3">
              {support.map(({ icon: Icon, label }) => (
                <li className="card flex items-center gap-4 py-4" key={label}>
                  <div className="icon-box shrink-0"><Icon size={20} /></div>
                  <span className="font-bold text-navy">{label}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 shadow-lg shadow-slate-200/50">
              <img src={img.contact} alt="" className="aspect-[16/9] w-full object-cover" loading="lazy" />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <a href="mailto:hello@agricontract.example" className="card flex items-center gap-3 py-4 text-sm font-bold text-navy">
                <Mail size={18} className="text-primary" /> hello@agricontract.example
              </a>
              <a href="tel:+910000000000" className="card flex items-center gap-3 py-4 text-sm font-bold text-navy">
                <Phone size={18} className="text-primary" /> +91 00000 00000
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ===================================================================
// Shared bottom CTA
// ===================================================================
function CtaBanner() {
  return (
    <section className="section-padding bg-soft">
      <div className="container-page">
        <div className="dashboard-feature flex flex-col items-center gap-6 rounded-[32px] border border-slate-200 px-8 py-14 text-center shadow-sm sm:px-14">
          <span className="eyebrow">Ready when you are</span>
          <h2 className="font-heading text-3xl font-extrabold text-navy md:text-4xl">
            Bring your next contract onto AgriContract
          </h2>
          <p className="max-w-xl text-sm leading-7 text-slate-500 md:text-base">
            Register as a farmer or a buyer and start with a verified, traceable agreement instead of an
            informal one.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link className="btn-primary" to="/register/farmer">
              Register as Farmer <ArrowRight size={16} />
            </Link>
            <Link className="btn-secondary" to="/register/company">
              Register as Company
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}