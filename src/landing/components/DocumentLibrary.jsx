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
  <div className="rounded-xl bg-[#0B1029] p-4 flex flex-col gap-4">
    <div className="space-y-2">
      <p className="text-[10px] font-medium text-indigo-300">Problem</p>
      <p className="text-xs font-semibold text-white">
        Fragmented energy supply
      </p>
      <Bar w="w-full" h="h-[3px]" tone="bg-white/20" />
    </div>
    <div className="grid grid-cols-4 gap-1.5">
      {["Solution", "Market", "Traction", "Model"].map((label) => (
        <div
          key={label}
          className="rounded-md bg-white/95 text-center py-1.5 text-[8px] font-medium text-slate-700"
        >
          {label}
        </div>
      ))}
    </div>
  </div>
);

const BusinessPlanPreview = () => (
  <div className="rounded-xl bg-white ring-1 ring-slate-100 p-4">
    <p className="text-[10px] font-semibold text-indigo-500">Business Plan</p>
    <p className="text-xs font-semibold text-slate-800 mb-3">
      Executive Summary
    </p>
    <div className="flex items-end justify-between gap-3">
      <div className="flex items-end gap-1.5">
        {[6, 9, 5, 10, 8].map((h, i) => (
          <div
            key={i}
            style={{ height: `${h * 4}px` }}
            className="w-3.5 rounded-sm bg-indigo-300/70"
          />
        ))}
      </div>
      <div className="space-y-1.5 pb-1">
        {["Market", "Strategy", "Operations", "Financials"].map((label) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            <span className="text-[8px] text-slate-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ContractPreview = () => (
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
);

const SOPPreview = () => (
  <div className="rounded-xl bg-white ring-1 ring-slate-100 p-4">
    <p className="text-[10px] font-semibold text-indigo-500">Process</p>
    <p className="text-xs font-semibold text-slate-800 mb-3">
      Warehouse Intake
    </p>
    <div className="space-y-2 mb-3">
      {["Receive shipment", "Verify against order", "Log to inventory"].map(
        (label, i) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-[8px] font-medium text-slate-400">
              0{i + 1}
            </span>
            <span className="text-[9px] text-slate-600">{label}</span>
          </div>
        ),
      )}
    </div>
    <div className="flex items-center justify-between rounded-md bg-emerald-50 px-2 py-1.5">
      <span className="text-[8px] font-medium text-emerald-600">Approval</span>
      <span className="text-[8px] text-emerald-600/70">Ops lead</span>
    </div>
  </div>
);

const PresentationPreview = () => (
  <div className="rounded-xl bg-white ring-1 ring-slate-100 p-4">
    <p className="text-[10px] font-semibold text-indigo-500">Title slide</p>
    <p className="text-xs font-semibold text-slate-800 mb-3">
      Q3 Business Review
    </p>
    <div className="flex items-end gap-1.5 mb-4 h-8">
      {[5, 8, 4].map((h, i) => (
        <div
          key={i}
          style={{ height: `${h * 4}px` }}
          className="w-3.5 rounded-sm bg-indigo-300/70"
        />
      ))}
    </div>
    <div className="grid grid-cols-4 gap-1.5">
      {["Insights", "Data", "Strategy", "Next"].map((label, i) => (
        <div
          key={label}
          className={`rounded-md text-center py-1.5 text-[8px] font-medium ${
            i === 0
              ? "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200"
              : "bg-slate-50 text-slate-500"
          }`}
        >
          {label}
        </div>
      ))}
    </div>
  </div>
);

const ProposalPreview = () => (
  <div className="rounded-xl bg-white ring-1 ring-slate-100 p-4">
    <p className="text-[10px] font-semibold text-indigo-500 mb-1">Proposal</p>
    <Bar h="h-[3px]" tone="bg-indigo-200" w="w-4/5" />
    <div className="space-y-2.5 mt-3 mb-4">
      {["Project Overview", "Scope", "Pricing", "Timeline"].map((label) => (
        <div key={label} className="flex items-center gap-2">
          <span className="text-[8px] text-slate-400 w-16 shrink-0">
            {label}
          </span>
          <Bar h="h-[3px]" tone="bg-slate-200" />
        </div>
      ))}
    </div>
    <div className="flex items-center justify-between rounded-md bg-[#0B1029] px-2 py-1.5">
      <span className="text-[8px] font-medium text-white/70">Total</span>
      <span className="text-[8px] font-semibold text-white">$50,000,000</span>
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

    <h3 className="text-lg font-semibold text-slate-900 mb-1.5">{title}</h3>
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
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
          <span className="mb-5 inline-flex items-center rounded-full bg-indigo-100 px-4 py-1.5 text-xs font-semibold text-indigo-600">
            Document library
          </span>
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
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
