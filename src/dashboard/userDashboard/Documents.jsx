import React, { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  FileSignature,
  BarChart3,
  ClipboardList,
  Briefcase,
  Presentation,
  FileStack,
  Search,
  ChevronDown,
  Plus,
  ArrowRight,
  MoreHorizontal,
  Pencil,
  Copy,
  Download,
  Trash2,
} from "lucide-react";

// ---- Mock data (would come from API) ----------------------------------
const DOCUMENTS = [
  {
    id: "doc-1",
    name: "Solar Installation Proposal",
    type: "Business Proposal",
    revisions: 6,
    status: "Finalized",
    updatedMinsAgo: 120,
    icon: FileText,
    tint: "bg-indigo-50 text-indigo-600",
  },
  {
    id: "doc-2",
    name: "SME Partnership Contract",
    type: "Contract",
    revisions: 3,
    status: "Draft",
    updatedMinsAgo: 120,
    icon: FileSignature,
    tint: "bg-violet-50 text-violet-600",
  },
  {
    id: "doc-3",
    name: "Marketing Strategy 2026",
    type: "Marketing Plan",
    revisions: 9,
    status: "Draft",
    updatedMinsAgo: 120,
    icon: BarChart3,
    tint: "bg-sky-50 text-sky-600",
  },
  {
    id: "doc-4",
    name: "Warehouse Intake SOP",
    type: "SOP",
    revisions: 2,
    status: "Draft",
    updatedMinsAgo: 120,
    icon: ClipboardList,
    tint: "bg-emerald-50 text-emerald-600",
  },
  {
    id: "doc-5",
    name: "Series-A Investor Deck",
    type: "Pitch Deck",
    revisions: 12,
    status: "Exported",
    updatedMinsAgo: 120,
    icon: Briefcase,
    tint: "bg-amber-50 text-amber-600",
  },
  {
    id: "doc-6",
    name: "Ridgepoint Presentation",
    type: "Presentation",
    revisions: 3,
    status: "Draft",
    updatedMinsAgo: 120,
    icon: Presentation,
    tint: "bg-cyan-50 text-cyan-600",
  },
  {
    id: "doc-7",
    name: "Fulfilment Proposal",
    type: "Business Proposal",
    revisions: 7,
    status: "Exported",
    updatedMinsAgo: 120,
    icon: FileStack,
    tint: "bg-rose-50 text-rose-600",
  },
];

const STATUS_STYLES = {
  Finalized:
    "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  Draft: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  Exported: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
};

function timeAgo(mins) {
  if (mins < 60) return `Updated ${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `Updated ${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  return `Updated ${days} day${days === 1 ? "" : "s"} ago`;
}

// ---- Small reusable dropdown -------------------------------------------
function Dropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors whitespace-nowrap"
      >
        <span>{value === "All" ? label : value}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`absolute right-0 sm:left-0 z-20 mt-2 w-44 origin-top rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5 overflow-hidden transition-all duration-150 ${
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => {
              onChange(opt);
              setOpen(false);
            }}
            className={`block w-full text-left px-4 py-2.5 text-sm transition-colors ${
              value === opt
                ? "bg-slate-50 text-[#131B4D] font-bold"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- Row action menu -----------------------------------------------------
function RowMenu({ onOpen }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const items = [
    { label: "Rename", icon: Pencil },
    { label: "Duplicate", icon: Copy },
    { label: "Download", icon: Download },
    { label: "Delete", icon: Trash2, danger: true },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="More actions"
        className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      <div
        className={`absolute right-0 z-20 mt-1 w-44 rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5 overflow-hidden transition-all duration-150 ${
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {items.map(({ label, icon: Icon, danger }) => (
          <button
            key={label}
            type="button"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
              danger
                ? "text-red-600 hover:bg-red-50"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- Main page -------------------------------------------------------
const Documents = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Recently updated");

  const types = useMemo(
    () => ["All", ...Array.from(new Set(DOCUMENTS.map((d) => d.type)))],
    [],
  );
  const statuses = ["All", "Draft", "Finalized", "Exported"];
  const sorts = ["Recently updated", "Name (A-Z)", "Most revisions"];

  const filtered = useMemo(() => {
    let docs = DOCUMENTS.filter((d) => {
      const matchesQuery = d.name.toLowerCase().includes(query.toLowerCase());
      const matchesType = typeFilter === "All" || d.type === typeFilter;
      const matchesStatus = statusFilter === "All" || d.status === statusFilter;
      return matchesQuery && matchesType && matchesStatus;
    });

    if (sortBy === "Name (A-Z)") {
      docs = [...docs].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "Most revisions") {
      docs = [...docs].sort((a, b) => b.revisions - a.revisions);
    } else {
      docs = [...docs].sort((a, b) => a.updatedMinsAgo - b.updatedMinsAgo);
    }
    return docs;
  }, [query, typeFilter, statusFilter, sortBy]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <p className="text-xs font-bold text-blue-600 mb-1">
            Manage and continue working on your business documents.
          </p>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Your documents
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Everything you've created with Ahiia.Ai, in one place.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/dashboard/create-document")}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#131B4D] hover:bg-[#1B2666] active:scale-[0.98] text-white font-bold text-sm shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create document</span>
        </button>
      </div>

      {/* Search + filters */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#131B4D]/15 focus:border-[#131B4D]/40 transition-shadow"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <Dropdown
              label="All types"
              value={typeFilter}
              options={types}
              onChange={setTypeFilter}
            />
            <Dropdown
              label="All status"
              value={statusFilter}
              options={statuses}
              onChange={setStatusFilter}
            />
            <Dropdown
              label="Recently updated"
              value={sortBy}
              options={sorts}
              onChange={setSortBy}
            />
          </div>
        </div>
      </div>

      {/* Document list */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-black text-slate-900">
            {filtered.length} Document{filtered.length === 1 ? "" : "s"}
          </h3>
          <span className="hidden sm:block text-xs font-medium text-slate-400">
            Sorted by {sortBy.toLowerCase()}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-700">
              No documents found
            </h4>
            <p className="text-sm text-slate-400 mt-1">
              Try a different search term or clear your filters.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((doc) => {
              const Icon = doc.icon;
              return (
                <li
                  key={doc.id}
                  className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-5 sm:px-6 py-4 hover:bg-slate-50/70 transition-colors"
                >
                  {/* Icon + name */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${doc.tint}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {doc.name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {doc.type} &middot; {doc.revisions} revision
                        {doc.revisions === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>

                  {/* Status + time + actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 sm:shrink-0">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[doc.status]}`}
                    >
                      {doc.status}
                    </span>
                    <span className="hidden md:block text-xs text-slate-400 w-32">
                      {timeAgo(doc.updatedMinsAgo)}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate(`/dashboard/documents/${doc.id}`)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-slate-800 text-xs font-bold hover:bg-[#131B4D] hover:text-white hover:border-[#131B4D] active:scale-[0.97] transition-all"
                    >
                      Open
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <RowMenu
                      onOpen={() => navigate(`/dashboard/documents/${doc.id}`)}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Documents;
