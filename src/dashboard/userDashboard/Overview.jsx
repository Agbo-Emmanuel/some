import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FilePlus,
  FileText,
  TrendingUp,
  Edit3,
  Briefcase,
  Sparkles,
  ChevronDown,
  ArrowRight,
  MoreHorizontal,
  Check,
  CheckCircle2,
  FileCheck2,
  PieChart,
  Megaphone,
  LayoutGrid,
  Layers,
  ExternalLink,
} from "lucide-react";

const INITIAL_DOCUMENTS = [
  {
    id: "doc-1",
    title: "Solar Installation Proposal",
    type: "Business Proposal",
    revisions: 6,
    status: "Finalized",
    updatedAt: "Updated 2 hours ago",
    icon: FileText,
  },
  {
    id: "doc-2",
    title: "SME Partnership Contract",
    type: "Contract",
    revisions: 3,
    status: "Draft",
    updatedAt: "Updated 2 hours ago",
    icon: FileCheck2,
  },
  {
    id: "doc-3",
    title: "Marketing Strategy 2026",
    type: "Marketing Plan",
    revisions: 9,
    status: "Draft",
    updatedAt: "Updated 2 hours ago",
    icon: Megaphone,
  },
  {
    id: "doc-4",
    title: "Warehouse Intake SOP",
    type: "SOP",
    revisions: 2,
    status: "Draft",
    updatedAt: "Updated 2 hours ago",
    icon: LayoutGrid,
  },
  {
    id: "doc-5",
    title: "Series-A Investor Deck",
    type: "Pitch Deck",
    revisions: 12,
    status: "Exported",
    updatedAt: "Updated 2 hours ago",
    icon: PieChart,
  },
  {
    id: "doc-6",
    title: "Ridgepoint Business Plan",
    type: "Presentation",
    revisions: 3,
    status: "Draft",
    updatedAt: "Updated 2 hours ago",
    icon: Layers,
  },
  {
    id: "doc-7",
    title: "Fulfilment Proposal",
    type: "Business Proposal",
    revisions: 7,
    status: "Exported",
    updatedAt: "Updated 2 hours ago",
    icon: FileText,
  },
];

const Overview = () => {
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState("All types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [activeMenuDocId, setActiveMenuDocId] = useState(null);

  // Filter documents
  const filteredDocuments = INITIAL_DOCUMENTS.filter((doc) => {
    const matchesType =
      typeFilter === "All types" || doc.type === typeFilter;
    const matchesStatus =
      statusFilter === "All Status" || doc.status === statusFilter;
    return matchesType && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "Finalized":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-[#059669] border border-emerald-200/50">
            Finalized
          </span>
        );
      case "Exported":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EEF2FF] text-[#4F46E5] border border-indigo-200/50">
            Exported
          </span>
        );
      case "Draft":
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFFBEB] text-[#D97706] border border-amber-200/50">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Workspace Hero Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/70 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <span className="text-xs font-bold text-indigo-600 tracking-wider">
            Workspace
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Good morning, Chidi
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Build professional business documents using the context you've already given Ahiia.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/dashboard/create-document")}
          className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl bg-[#131B4D] hover:bg-[#1C2666] text-white font-bold text-sm shadow-md shadow-[#131B4D]/20 transition-all hover:shadow-lg hover:scale-[1.01] shrink-0 cursor-pointer"
        >
          <FilePlus className="w-4 h-4" />
          <span>Create document</span>
        </button>
      </div>

      {/* 2. Your Activity Stat Cards */}
      <div>
        <h3 className="text-base font-extrabold text-slate-900 mb-3.5">
          Your activity
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-indigo-100 transition-colors">
            <div className="flex items-start justify-between">
              <span className="text-xs font-bold text-slate-600">
                Documents Created
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                24
              </span>
              <p className="text-xs text-slate-400 mt-1">
                Total documents created
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-indigo-100 transition-colors">
            <div className="flex items-start justify-between">
              <span className="text-xs font-bold text-slate-600">
                Most Used Generator
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 tracking-tight truncate block">
                Business Proposal
              </span>
              <p className="text-xs text-slate-400 mt-1">
                Your most frequently used document type
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-indigo-100 transition-colors sm:col-span-2 md:col-span-1">
            <div className="flex items-start justify-between">
              <span className="text-xs font-bold text-slate-600">
                AI Edits
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Edit3 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                38
              </span>
              <p className="text-xs text-slate-400 mt-1">
                AI-assisted edits performed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Split Section: Recent Documents + Side Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Recent Documents */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          {/* Table Header / Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900">
              Recent Documents
            </h3>

            <div className="flex items-center gap-2.5">
              {/* Type Filter */}
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="appearance-none text-xs font-semibold bg-white text-slate-700 pl-3 pr-8 py-2 rounded-xl border border-slate-200 shadow-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option>All types</option>
                  <option>Business Proposal</option>
                  <option>Contract</option>
                  <option>Marketing Plan</option>
                  <option>SOP</option>
                  <option>Pitch Deck</option>
                  <option>Presentation</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none text-xs font-semibold bg-white text-slate-700 pl-3 pr-8 py-2 rounded-xl border border-slate-200 shadow-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option>All Status</option>
                  <option>Finalized</option>
                  <option>Draft</option>
                  <option>Exported</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Documents List */}
          <div className="divide-y divide-slate-100">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No documents matching the selected filters.
              </div>
            ) : (
              filteredDocuments.map((doc) => {
                const IconComponent = doc.icon;
                return (
                  <div
                    key={doc.id}
                    className="py-3.5 flex items-center justify-between gap-3 group hover:bg-slate-50/60 -mx-2 px-2 rounded-xl transition-colors"
                  >
                    {/* Left: Icon + Info */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-blue-50/70 text-blue-600 flex items-center justify-center shrink-0">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {doc.title}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {doc.type} • {doc.revisions} revisions
                        </p>
                      </div>
                    </div>

                    {/* Middle: Badge & Updated */}
                    <div className="hidden sm:flex items-center gap-4 shrink-0">
                      <div>{getStatusBadge(doc.status)}</div>
                      <span className="text-xs text-slate-400 w-32 text-right">
                        {doc.updatedAt}
                      </span>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => navigate("/dashboard/documents")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      {/* Dropdown menu trigger */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuDocId(
                              activeMenuDocId === doc.id ? null : doc.id
                            )
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          aria-label="More actions"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {activeMenuDocId === doc.id && (
                          <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-30 animate-in fade-in duration-100">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuDocId(null);
                                navigate("/dashboard/documents");
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                            >
                              Edit Document
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuDocId(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                            >
                              Duplicate
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveMenuDocId(null)}
                              className="w-full text-left px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* List Footer */}
          <div className="pt-5 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Layers className="w-3.5 h-3.5" />
              <span>Showing {filteredDocuments.length} of {INITIAL_DOCUMENTS.length} documents</span>
            </div>

            <button
              type="button"
              onClick={() => navigate("/dashboard/documents")}
              className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
            >
              View all documents
            </button>
          </div>
        </div>

        {/* Right 1 Col: Profile & Brand Kit Cards */}
        <div className="space-y-6">
          {/* Card 1: Your business profile */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0E1538] text-white flex items-center justify-center shadow-xs">
                <Briefcase className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Your business profile
              </h4>
            </div>

            <div className="mt-4">
              <p className="text-base font-extrabold text-slate-900">
                SolarTech Nigeria
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Renewable Energy</p>
            </div>

            {/* Profile completeness bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">
                  Profile completeness
                </span>
                <span className="font-bold text-blue-600">85%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: "85%" }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Missing: <span className="text-slate-600">Competitive advantage</span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/dashboard/company-profile")}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 mt-5 transition-colors cursor-pointer"
            >
              <span>View company profile</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Card 2: Brand Kit */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Brand Kit</h4>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-[#059669]">
                Configured
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-3 leading-relaxed">
              Your brand identity is ready to be applied to generated documents.
            </p>

            {/* Brand Kit Details */}
            <div className="mt-4 space-y-3 text-xs">
              {/* Logo */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Logo</span>
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#0E1538] text-white text-[11px] font-mono">
                  <span className="w-4 h-4 rounded bg-white/20 text-[9px] flex items-center justify-center font-bold">
                    ST
                  </span>
                  <span>solartech-logo.svg</span>
                </div>
              </div>

              {/* Colours */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Colours</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#0E1538] border border-white shadow-xs" />
                  <span className="w-4 h-4 rounded-full bg-[#2563EB] border border-white shadow-xs" />
                </div>
              </div>

              {/* Font */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Font</span>
                <span className="font-bold text-slate-800">Montserrat</span>
              </div>

              {/* Tagline */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Tagline</span>
                <span className="font-medium text-slate-700">
                  Clean power, built to last
                </span>
              </div>
            </div>

            {/* Checkmark indicator */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>Applied to covers, headings and callouts</span>
            </div>

            <button
              type="button"
              onClick={() => navigate("/dashboard/brand-kit")}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 mt-4 transition-colors cursor-pointer"
            >
              <span>Manage brand kit</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
