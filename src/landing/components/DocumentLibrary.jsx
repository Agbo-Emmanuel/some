import React from "react";
import {
  HiOutlineDesktopComputer,
  HiOutlineClipboardList,
  HiArrowRight,
} from "react-icons/hi";
import { BsBullseye } from "react-icons/bs";
import { HiOutlinePencilSquare, HiOutlineDocumentText } from "react-icons/hi2";

/**
 * Small reusable "mini preview" pieces used inside each card.
 * Built from plain divs so they scale cleanly at any width.
 */

const Bar = ({ w = "w-full", h = "h-2", tone = "bg-slate-200" }) => (
  <div className={`${w} ${h} ${tone} rounded-full`} />
);

const PitchDeckPreview = () => (
  <div className="w-full max-w-sm mx-auto flex flex-col gap-3 border border-gray-100 p-4 rounded-xl bg-gray-50">
    {/* Dark problem card */}
    <div className="rounded-2xl bg-[#0B1029] p-5 shadow-[0_20px_40px_-15px_rgba(11,16,41,0.5)]">
      <p className="text-[11px] font-medium text-indigo-300 tracking-wide">
        Problem
      </p>
      <p className="mt-1.5 text-sm font-semibold text-white">
        Fragmented energy supply
      </p>
      <div className="mt-4 space-y-2">
        <div className="h-[3px] w-full rounded-full bg-white/20" />
        <div className="h-[3px] w-2/3 rounded-full bg-white/20" />
      </div>
    </div>

    {/* Nav pills */}
    <div className="grid grid-cols-4 gap-2">
      {["Solution", "Market", "Traction", "Model"].map((label) => (
        <div
          key={label}
          className="rounded-xl bg-white shadow-[0_8px_20px_-10px_rgba(11,16,41,0.25)] flex flex-col items-center gap-1.5 py-2.5 px-1"
        >
          <span className="text-[9px] font-medium text-slate-700">{label}</span>
          <span className="h-[2px] w-4 rounded-full bg-indigo-400" />
        </div>
      ))}
    </div>
  </div>
);

const BusinessPlanPreview = () => (
  <div className="w-full max-w-sm mx-auto flex flex-col gap-3 border border-gray-100 p-4 rounded-xl bg-gray-50">
    <div className="rounded-2xl bg-white  ring-1 ring-slate-100 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.15)] p-5">
      <p className="text-[11px] font-semibold text-indigo-500 tracking-wide">
        Business Plan
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-800">
        Executive Summary
      </p>

      <div className="mt-4 h-[3px] w-full rounded-full bg-slate-100" />

      <div className="mt-5 flex items-end justify-between gap-4">
        <div className="flex items-end gap-2">
          {[
            { h: 5, tone: "bg-indigo-200" },
            { h: 7, tone: "bg-indigo-300" },
            { h: 9, tone: "bg-indigo-400" },
            { h: 12, tone: "bg-indigo-500" },
            { h: 15, tone: "bg-indigo-600" },
          ].map((bar, i) => (
            <div
              key={i}
              style={{ height: `${bar.h * 4}px` }}
              className={`w-4 rounded-md ${bar.tone}`}
            />
          ))}
        </div>

        <div className="space-y-2 pb-1">
          {["Market", "Strategy", "Operations", "Financials"].map((label) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              <span className="text-[9px] text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ContractPreview = () => (
  <div className="w-full max-w-sm mx-auto flex flex-col gap-3 border border-gray-100 p-4 rounded-xl bg-gray-50">
    <div className="rounded-xl bg-white ring-1 ring-slate-100 p-4">
      <p className="text-xs font-semibold text-slate-800 text-center mb-3">
        Service Agreement
      </p>
      <div className="space-y-2.5">
        {["Parties", "Scope", "Terms"].map((label) => (
          <div key={label} className="space-y-1">
            <p className="text-[8px] text-slate-400">{label}</p>
            <Bar h="h-[3px]" tone="bg-slate-200" />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-4 text-[8px] text-slate-400">
        <span>Client</span>
        <span>Provider</span>
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-indigo-300 text-sm leading-none">〰</span>
        <span className="text-indigo-300 text-sm leading-none">〰</span>
      </div>
    </div>
  </div>
);

const SOPPreview = () => (
  <div className="w-full max-w-sm mx-auto flex flex-col gap-3 border border-gray-100 p-4 rounded-xl bg-gray-50">
    <div className="rounded-xl bg-white ring-1 ring-slate-100 p-4">
      <p className="text-[10px] font-semibold text-indigo-500">Process</p>
      <p className="text-xs font-semibold text-slate-800 mb-3">
        Warehouse Intake
      </p>
      <div className="space-y-2 mb-3">
        {["Receive shipment", "Verify against order", "Log to inventory"].map(
          (label, i) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-[8px] font-medium text-slate-400 bg-[#EEF3FF] px-1 py-0.5 rounded-full">
                0{i + 1}
              </span>
              <span className="w-full text-[9px] text-slate-600 font-medium border border-b-2 border-x-0 border-t-0 border-gray-200">
                {label}
              </span>
            </div>
          ),
        )}
      </div>
      <div className="flex items-center justify-between rounded-md bg-emerald-50 px-2 py-1.5">
        <span className="text-[8px] font-medium text-emerald-600">
          Approval
        </span>
        <span className="text-[8px] text-emerald-600 font-medium">
          Ops lead
        </span>
      </div>
    </div>
  </div>
);

const PresentationPreview = () => (
  <div className="w-full max-w-sm mx-auto flex flex-col gap-3 border border-gray-100 p-4 rounded-xl bg-gray-50">
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl bg-white ring-1 ring-slate-100 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.15)] p-5">
        <p className="text-[11px] font-semibold text-indigo-500 tracking-wide">
          Title slide
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-800">
          Q3 Business Review
        </p>

        <div className="mt-4 flex items-end gap-1.5">
          {[
            { h: 5, tone: "bg-indigo-400" },
            { h: 7, tone: "bg-indigo-500" },
            { h: 9, tone: "bg-indigo-600" },
          ].map((bar, i) => (
            <div
              key={i}
              style={{ height: `${bar.h * 4}px` }}
              className={`w-3 rounded-sm ${bar.tone}`}
            />
          ))}
          <div className="ml-2 h-px flex-1 bg-slate-200" />
        </div>
      </div>

      {/* Nav pills */}
      <div className="grid grid-cols-4 gap-2">
        {["Insights", "Data", "Strategy", "Next"].map((label, i) => (
          <div
            key={label}
            className={`rounded-sm text-center py-2.5 text-[10px] font-medium ring-1 ${
              i === 0
                ? "bg-white text-indigo-600 ring-indigo-200 shadow-[0_8px_20px_-10px_rgba(79,70,229,0.35)] relative"
                : "bg-white text-slate-500 ring-slate-100 shadow-[0_8px_20px_-10px_rgba(15,23,42,0.15)]"
            }`}
          >
            {label}
            {i === 0 && (
              <span className="absolute left-1/2 -translate-x-1/2 bottom-1 h-[2px] w-4 rounded-full bg-indigo-500" />
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ProposalPreview = () => (
  <div className="w-full max-w-sm mx-auto flex flex-col gap-3 border border-gray-100 p-4 rounded-xl bg-gray-50">
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl bg-white ring-1 ring-slate-100 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.15)] p-5">
        <p className="text-[11px] font-semibold text-indigo-500 tracking-wide">
          Proposal
        </p>

        <div className="mt-3">
          <Bar h="h-[3px]" w="w-4/5" tone="bg-indigo-200" />
        </div>

        <div className="mt-4 space-y-3">
          {[
            { label: "Project Overview", w: "w-2/3", tone: "bg-slate-200" },
            { label: "Scope", w: "w-full", tone: "bg-slate-200" },
            { label: "Pricing", w: "w-full", tone: "bg-indigo-400" },
            { label: "Timeline", w: "w-1/2", tone: "bg-slate-200" },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-3">
              <span className="text-[10px] font-semibold text-slate-800 w-20 shrink-0 leading-tight">
                {row.label}
              </span>
              <Bar h="h-[3px]" w={row.w} tone={row.tone} />
            </div>
          ))}
        </div>
      </div>

      {/* Total bar */}
      <div className="flex items-center justify-between rounded-2xl bg-[#0B1029] px-5 py-3 shadow-[0_20px_40px_-15px_rgba(11,16,41,0.5)]">
        <span className="text-[11px] font-medium text-white/60">Total</span>
        <span className="text-[11px] font-semibold text-white">
          $50,000,000
        </span>
      </div>
    </div>
  </div>
);

const categories = [
  {
    icon: HiOutlineDesktopComputer,
    label: "Fundraising",
    title: "Pitch Decks",
    description: "Turn your business idea into an investor-ready presentation.",
    preview: PitchDeckPreview,
  },
  {
    icon: BsBullseye,
    label: "Strategy",
    title: "Business Plans",
    description: "Turn your business idea into a structured plan.",
    preview: BusinessPlanPreview,
  },
  {
    icon: HiOutlinePencilSquare,
    label: "Agreements",
    title: "Contracts",
    description: "Generate professionally structured business agreements.",
    preview: ContractPreview,
  },
  {
    icon: HiOutlineClipboardList,
    label: "Operations",
    title: "SOPs",
    description: "Document your processes consistently.",
    preview: SOPPreview,
  },
  {
    icon: HiOutlineDesktopComputer,
    label: "Internal",
    title: "Presentations",
    description: "Turn business information into polished presentations.",
    preview: PresentationPreview,
  },
  {
    icon: HiOutlineDocumentText,
    label: "Client-facing",
    title: "Business Proposals",
    description: "Create persuasive proposals faster.",
    preview: ProposalPreview,
    dark: true,
  },
];

const Card = ({
  icon: Icon,
  label,
  title,
  description,
  preview: Preview,
  dark,
}) => (
  <div className="group flex flex-col rounded-2xl bg-white p-6 ring-1 ring-slate-100 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:ring-indigo-100">
    <div className="flex items-center gap-2 mb-4">
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-lg ${
          dark ? "bg-slate-900 text-white" : "bg-indigo-50 text-indigo-500"
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="text-xs font-medium text-slate-500">{label}</span>
    </div>

    <h3 className="text-lg font-bold text-slate-900 mb-1.5">{title}</h3>
    <p className="text-sm text-slate-500 leading-relaxed mb-5">{description}</p>

    <div className="mb-6 transition-transform duration-300 ease-out group-hover:scale-[1.02]">
      <Preview />
    </div>

    <a
      href="#"
      className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition-all duration-200 hover:gap-2.5 hover:text-indigo-700"
    >
      Explore
      <HiArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
    </a>
  </div>
);

const DocumentLibrary = () => {
  return (
    <section className="w-full bg-[#F7F8FB] px-4 py-16 sm:px-8 sm:py-20 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
          <span className="mb-5 inline-flex items-center rounded-full bg-indigo-100 px-4 py-1.5 text-xs font-semibold text-indigo-600">
            Document library
          </span>
          <h2 className="max-w-4xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Everything You Need to Build Your Business
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((item) => (
            <Card key={item.title} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DocumentLibrary;
