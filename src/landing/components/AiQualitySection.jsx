import React from "react";
import { HiCheck } from "react-icons/hi";
import { HiOutlineSparkles } from "react-icons/hi2";
import { BsExclamationTriangleFill } from "react-icons/bs";
import { FiClock } from "react-icons/fi";

const features = [
  {
    title: "Structured document blueprints",
    description:
      "Every document follows a proven section framework instead of a blank page.",
  },
  {
    title: "AI-assisted quality suggestions",
    description:
      "Inline notes flag vague pricing, thin scope, and missing detail.",
  },
  {
    title: "Document guidance",
    description: "See what a strong version of this document usually includes.",
  },
  {
    title: "Revision history",
    description: "Compare drafts and restore any earlier version at any time.",
  },
  {
    title: "Brand-aware generation",
    description: "Your logo, colours, and tone of voice applied consistently.",
  },
];

const SkeletonLine = ({ w = "w-full" }) => (
  <div className={`h-2 rounded-full bg-slate-100 ${w}`} />
);

const FeatureRow = ({ title, description }) => (
  <div className="flex gap-3 group">
    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 transition-colors duration-200 group-hover:bg-indigo-500 group-hover:text-white">
      <HiCheck className="h-3 w-3" strokeWidth={1} />
    </span>
    <div>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-0.5 text-sm leading-relaxed text-slate-500">
        {description}
      </p>
    </div>
  </div>
);

const ProposalCard = () => (
  <div className="relative">
    {/* ambient glow behind the card */}
    <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-indigo-200/40 blur-3xl" />

    <div className="w-full rounded-2xl bg-white p-6 shadow-xl shadow-indigo-100/60 ring-1 ring-slate-100 transition-transform duration-500 ease-out hover:-translate-y-1">
      {/* header */}
      <div className="flex items-start justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Q3 Partnership Proposal
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Draft 3 · edited 4 minutes ago
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600">
          <HiOutlineSparkles className="h-3.5 w-3.5" />
          Reviewed
        </span>
      </div>

      {/* executive summary */}
      <div className="pt-4">
        <p className="text-xs font-semibold text-slate-700">
          Executive Summary
        </p>
        <div className="mt-2.5 space-y-1.5">
          <SkeletonLine />
          <SkeletonLine />
          <SkeletonLine w="w-3/4" />
        </div>
      </div>

      {/* guidance callout */}
      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
        <div className="flex items-center gap-1.5">
          <BsExclamationTriangleFill className="h-3.5 w-3.5 text-amber-500" />
          <p className="text-xs font-semibold text-amber-800">Guidance</p>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-amber-700/90">
          Pricing section has no payment schedule. Proposals with clear
          milestones close faster.
        </p>
        <button className="mt-3 text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-700">
          Add payment schedule
        </button>
      </div>

      {/* scope of work */}
      <div className="mt-4">
        <p className="text-xs font-semibold text-slate-700">Scope of Work</p>
        <div className="mt-2.5 space-y-1.5">
          <SkeletonLine />
          <SkeletonLine w="w-2/3" />
        </div>
      </div>

      {/* revisions footer */}
      <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5">
        <FiClock className="h-3.5 w-3.5 text-indigo-500" />
        <p className="text-xs text-slate-600">
          <span className="font-semibold text-slate-900">3 revisions</span>{" "}
          saved · restore any version
        </p>
      </div>
    </div>
  </div>
);

const AiQualitySection = () => {
  return (
    <section className="w-full bg-white px-4 py-16 sm:px-8 sm:py-20 lg:px-12">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* left column */}
        <div>
          <span className="inline-flex items-center rounded-full bg-indigo-100 px-4 py-1.5 text-xs font-semibold text-indigo-600">
            AI quality
          </span>

          <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl md:text-[2.75rem]">
            AI That Helps You Create With Confidence
          </h2>

          <p className="mt-5 max-w-md text-base leading-relaxed text-slate-500">
            Ahiia.Ai is built to produce documents you can actually send. Every
            draft is grounded in your business context, checked against a proven
            structure, and open to review before it leaves your workspace.
          </p>

          <div className="mt-8 space-y-5">
            {features.map((f) => (
              <FeatureRow key={f.title} {...f} />
            ))}
          </div>
        </div>

        {/* right column */}
        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-md">
            <ProposalCard />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AiQualitySection;
