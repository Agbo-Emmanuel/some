import React, { useEffect, useState } from "react";
import {
  RefreshCw,
  Wand2,
  Pencil,
  FileText,
  Megaphone,
  LayoutGrid,
  FileSignature,
  Presentation,
  MonitorPlay,
  Download,
  RotateCw,
} from "lucide-react";

// ---- Mock data (would come from API) -----------------------------------
const ACTIVITY_STATS = [
  {
    label: "Documents Created",
    value: "24",
    sub: "Total documents created",
    icon: RefreshCw,
  },
  {
    label: "Most Used Generator",
    value: "Business Proposal",
    sub: "Your most frequently used document type",
    icon: Wand2,
  },
  {
    label: "AI Edits",
    value: "38",
    sub: "AI-assisted edits performed",
    icon: Pencil,
  },
];

const BY_GENERATOR = [
  { label: "Business Proposal", count: 9, pct: 38, icon: FileText },
  { label: "Marketing Plan", count: 6, pct: 25, icon: Megaphone },
  { label: "SOP", count: 4, pct: 17, icon: LayoutGrid },
  { label: "Contract", count: 3, pct: 13, icon: FileSignature },
  { label: "Pitch Deck", count: 2, pct: 8, icon: Presentation },
  { label: "Business Plan", count: 2, pct: 8, icon: MonitorPlay },
];

const TOTAL_DOCUMENTS = 24;

const RECENT_ACTIVITY = [
  {
    id: 1,
    action: "AI edit performed",
    doc: "Solar Installation Proposal",
    time: "2 hours ago",
    icon: Pencil,
  },
  {
    id: 2,
    action: "Business Proposal created",
    doc: "Fulfilment Proposal",
    time: "Yesterday",
    icon: Wand2,
  },
  {
    id: 3,
    action: "Contract updated",
    doc: "Lagos SME Partnership Contract",
    time: "Yesterday",
    icon: RotateCw,
  },
  {
    id: 4,
    action: "Marketing Plan exported",
    doc: "Marketing Strategy 2026",
    time: "3 days ago",
    icon: Download,
  },
  {
    id: 5,
    action: "AI edit performed",
    doc: "Warehouse Intake SOP",
    time: "4 days ago",
    icon: Pencil,
  },
  {
    id: 6,
    action: "Pitch Deck created",
    doc: "Series-A Investor Deck",
    time: "Last week",
    icon: Wand2,
  },
];

// ---- Animated progress bar ---------------------------------------------
function ProgressBar({ pct, delay = 0 }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 100 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);

  return (
    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
      <div
        className="h-full rounded-full bg-[#131B4D] transition-all duration-700 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

const Analytics = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <p className="text-xs font-bold text-blue-600 mb-1">
          Understand how you're using Ahiia.Ai.
        </p>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Analytics
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Understand how you're using Ahiia.Ai across your business documents.
        </p>
      </div>

      {/* Your activity */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-black text-slate-900 mb-4">
          Your activity
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ACTIVITY_STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-2xl p-5 border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-500">
                    {stat.label}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <p
                  className={`mt-3 font-black text-slate-900 leading-tight ${
                    stat.value.length > 6 ? "text-lg sm:text-xl" : "text-2xl"
                  }`}
                >
                  {stat.value}
                </p>
                <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Documents by generator */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-slate-900">
            Documents by generator
          </h3>
          <span className="text-xs font-medium text-slate-400">
            {TOTAL_DOCUMENTS} documents total
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {BY_GENERATOR.map((g, i) => {
            const Icon = g.icon;
            return (
              <div key={g.label} className="py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-sm font-bold text-slate-800 truncate">
                      {g.label}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 shrink-0">
                    {g.count} &middot; {g.pct}%
                  </span>
                </div>
                <ProgressBar pct={g.pct} delay={i * 60} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-black text-slate-900 mb-2">
          Recent activity
        </h3>
        <ul className="divide-y divide-slate-100">
          {RECENT_ACTIVITY.map((item) => {
            const Icon = item.icon;
            return (
              <li
                key={item.id}
                className="flex items-center gap-3 sm:gap-4 py-3.5 hover:bg-slate-50/70 -mx-2 px-2 rounded-xl transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {item.action}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{item.doc}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0 whitespace-nowrap">
                  {item.time}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Analytics;
