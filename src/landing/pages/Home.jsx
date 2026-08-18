import React, { useEffect, useState } from "react";
import { ArrowRight, Play, Check, Sparkles, Loader2 } from "lucide-react";
import FeaturesSection from "../components/FeaturesSection";
import AhiiaWorkspace from "../components/AhiiaWorkspace";
import DocumentLibrary from "../components/DocumentLibrary";
import AiQualitySection from "../components/AiQualitySection";
import WaitlistCta from "../components/WaitListCta";

const FIELDS = [
  { label: "Company", value: "Kanto Logistics Ltd." },
  { label: "Client", value: "Ridgepoint Retail Group" },
  { label: "Project", value: "Nationwide Fulfilment Rollout" },
  { label: "Scope", value: "4 warehouses \u00b7 12 months" },
  { label: "Budget", value: "\u20a648,500,000" },
  { label: "Timeline", value: "Q3 2026 - Q2 2027" },
];

const GEN_STEPS = [
  "Understanding your business",
  "Structuring your document",
  "Applying your brand",
  "Reviewing content",
];

// Entrance animation helper: fades/slides an element in once `show` flips true
const Reveal = ({ show, delay = 0, className = "", children }) => (
  <div
    className={`transition-all ease-out duration-700 ${
      show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
    } ${className}`}
    style={{ transitionDelay: `${delay}ms` }}
  >
    {children}
  </div>
);

const HeroMock = ({ show }) => (
  <Reveal show={show} delay={350} className="w-full">
    <div className="relative rounded-2xl md:rounded-3xl border border-gray-300 bg-white backdrop-blur-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] overflow-hidden">
      {/* card header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-300">
        <div className="flex items-center gap-2 text-black/90 text-sm font-medium">
          <Sparkles size={16} className="text-indigo-300" />
          Company memory
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium bg-emerald-200/20 rounded-md px-2 py-1 text-emerald-300">
          {/* <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> */}
          Synced
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr_0.95fr] divide-y lg:divide-y-0 lg:divide-x divide-gray-300">
        {/* Column 1: document details */}
        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1.5">
              Document type
            </p>
            <div className="flex items-center justify-between rounded-lg border border-indigo-400/40 bg-indigo-500/10 px-3 py-2.5">
              <span className="text-sm font-medium text-indigo-500">
                Business Proposal
              </span>
              <Sparkles size={14} className="text-indigo-300" />
            </div>
          </div>
          <dl className="space-y-2.5">
            {FIELDS.map((f) => (
              <div
                key={f.label}
                className="flex items-start justify-between gap-3 text-xs"
              >
                <dt className="text-gray-500 shrink-0">{f.label}</dt>
                <dd className="text-black/90 font-medium text-right">
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Column 2: generation progress */}
        <div className="p-4 sm:p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Loader2 size={15} className="text-indigo-300 animate-spin" />
            <p className="text-sm font-medium text-black/90">
              Generating your proposal&hellip;
            </p>
          </div>
          <ul className="space-y-3 flex-1">
            {GEN_STEPS.map((step) => (
              <li
                key={step}
                className="flex items-center gap-2.5 text-sm text-gray-500"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
                  <Check size={11} strokeWidth={3} />
                </span>
                {step}
              </li>
            ))}
          </ul>
          <div className="mt-5">
            <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-300" />
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Draft ready in about 40 seconds
            </p>
          </div>
        </div>

        {/* Column 3: brand kit + result */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-black/90 mb-2.5">
              <Sparkles size={13} className="text-indigo-300" />
              Brand Kit Applied
            </div>
            <div className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-indigo-800 border border-white/10" />
              <span className="h-5 w-5 rounded-full bg-indigo-500 border border-white/10" />
              <span className="h-5 w-5 rounded-full bg-indigo-300 border border-white/10" />
              <span className="ml-1 text-[11px] text-gray-500 leading-tight">
                Montserrat &middot; Logo
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/[0.06] p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 mb-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20">
                <Check size={11} strokeWidth={3} />
              </span>
              Proposal Generated
            </div>
            <p className="text-xs text-gray-500 font-medium mb-1.5">
              14 pages &middot; 8 sections
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Your proposal has been generated using your company profile, brand
              guidelines, pricing, and sales rules. Review the content, make
              improvements, or export it when you&rsquo;re ready.
            </p>
          </div>
        </div>
      </div>
    </div>
  </Reveal>
);

const HeroDecoration = () => (
  <>
    {/* dotted arc, top-left */}
    <svg
      className="hidden md:block absolute -left-6 top-24 w-40 h-40 lg:w-52 lg:h-52 opacity-70 pointer-events-none"
      viewBox="0 0 200 200"
      fill="none"
    >
      <path
        d="M10 90 A90 90 0 0 1 170 40"
        stroke="url(#arcGrad)"
        strokeWidth="1"
        strokeDasharray="1 6"
        strokeLinecap="round"
      />
      <circle cx="10" cy="90" r="4" fill="#818CF8" />
      <circle cx="170" cy="40" r="2.5" fill="#818CF8" />
      <defs>
        <linearGradient id="arcGrad" x1="0" y1="0" x2="200" y2="200">
          <stop stopColor="#818CF8" />
          <stop offset="1" stopColor="#818CF8" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>

    {/* ascending path, top-right */}
    <svg
      className="hidden md:block absolute right-2 top-16 w-36 h-36 lg:w-48 lg:h-48 opacity-70 pointer-events-none"
      viewBox="0 0 200 200"
      fill="none"
    >
      <circle
        cx="150"
        cy="30"
        r="34"
        stroke="#6366F1"
        strokeWidth="1"
        opacity="0.5"
      />
      <path
        d="M40 180 L90 130 L120 155 L165 95"
        stroke="#818CF8"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="40" cy="180" r="3" fill="#A5B4FC" />
      <circle cx="165" cy="95" r="3" fill="#A5B4FC" />
    </svg>
  </>
);

const Home = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <main className="relative min-h-screen bg-[#07071c] overflow-hidden">
      <div className="relative min-h-screen overflow-hidden">
        {/* ambient background glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[820px] rounded-full bg-indigo-600/20 blur-[120px]" />
          <div className="absolute top-1/3 -right-40 h-[380px] w-[380px] rounded-full bg-blue-600/10 blur-[100px]" />
        </div>

        <section className="relative px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 lg:pt-24 pb-16 sm:pb-24">
          <div className="relative mx-auto max-w-4xl text-center">
            <HeroDecoration />

            <Reveal show={mounted} delay={0} className="flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs sm:text-sm text-slate-300">
                The AI Operating System for Modern Businesses.
              </span>
            </Reveal>

            <Reveal show={mounted} delay={100}>
              <h1 className="mt-6 text-[2.1rem] leading-[1.1] sm:text-5xl md:text-6xl font-bold tracking-tight text-white text-balance">
                Create Business Documents
                <br className="hidden sm:block" /> With{" "}
                <span className="text-indigo-400">Ahiia.AI</span> Faster.
              </h1>
            </Reveal>

            <Reveal show={mounted} delay={180}>
              <p className="mt-5 sm:mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto text-balance">
                Generate professional proposals, pitch decks, SOPs, contracts,
                and marketing plans tailored to your business in minutes.
              </p>
            </Reveal>

            <Reveal show={mounted} delay={260}>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <a
                  href="#get-started"
                  className="group inline-flex items-center gap-2 rounded-full bg-indigo-500 hover:bg-indigo-400 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:shadow-[0_0_0_6px_rgba(99,102,241,0.15)] w-full sm:w-auto justify-center"
                >
                  Get Started
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </a>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-slate-200 hover:bg-white/5 transition-colors duration-200 w-full sm:w-auto justify-center"
                >
                  <Play size={14} />
                  See How It Works
                </a>
              </div>
            </Reveal>
          </div>

          <div className="relative mx-auto mt-12 sm:mt-16 max-w-5xl">
            <HeroMock show={mounted} />
          </div>
        </section>

        <FeaturesSection />
        <AhiiaWorkspace />
        <DocumentLibrary />
        <AiQualitySection />
        <WaitlistCta />
      </div>
    </main>
  );
};

export default Home;
