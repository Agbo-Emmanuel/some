import React, { useEffect, useState, useRef } from "react";
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
  FileCheck2,
  PieChart,
  Megaphone,
  LayoutGrid,
  Layers,
  Building2,
  Copy,
  Trash2,
  Loader2,
  FileSignature,
  BarChart3,
  FileStack,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";
import { getDashboardInsights } from "../../services/insights.service";
import {
  duplicateDocument,
  deleteDocument,
} from "../../services/document.service";

const TYPE_CONFIG = {
  proposal: { icon: FileText, tint: "bg-indigo-50 text-indigo-600" },
  "business-proposal": { icon: FileText, tint: "bg-indigo-50 text-indigo-600" },
  contract: { icon: FileSignature, tint: "bg-violet-50 text-violet-600" },
  pitchdeck: { icon: Briefcase, tint: "bg-amber-50 text-amber-600" },
  "pitch-deck": { icon: Briefcase, tint: "bg-amber-50 text-amber-600" },
  sop: { icon: LayoutGrid, tint: "bg-emerald-50 text-emerald-600" },
  marketingplan: { icon: Megaphone, tint: "bg-sky-50 text-sky-600" },
  "marketing-plan": { icon: Megaphone, tint: "bg-sky-50 text-sky-600" },
  presentation: { icon: Layers, tint: "bg-purple-50 text-purple-600" },
  businessplan: { icon: FileStack, tint: "bg-rose-50 text-rose-600" },
  "business-plan": { icon: FileStack, tint: "bg-rose-50 text-rose-600" },
};

function getTypeConfig(doc) {
  const key = (
    doc?.slug ||
    doc?.documentType ||
    doc?.documentTypeLabel ||
    ""
  )
    .toLowerCase()
    .replace(/[_\s]/g, "-");

  return (
    TYPE_CONFIG[key] || {
      icon: FileText,
      tint: "bg-indigo-50 text-indigo-600",
    }
  );
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return "Recently updated";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Recently updated";

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMins < 1) return "Updated just now";
  if (diffMins < 60) return `Updated ${diffMins}m ago`;
  const hrs = Math.floor(diffMins / 60);
  if (hrs < 24) return `Updated ${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Updated yesterday";
  if (days < 30) return `Updated ${days}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const Overview = () => {
  const navigate = useNavigate();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [typeFilter, setTypeFilter] = useState("All types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [activeMenuDocId, setActiveMenuDocId] = useState(null);
  const menuRef = useRef(null);

  // Close row dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuDocId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchDashboardInsightsData = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const response = await getDashboardInsights();
      const data =
        response?.activity || response?.profile ? response : response?.data || response;
      if (data) {
        setInsights(data);
      }
    } catch (error) {
      console.error("Failed to load dashboard insights:", error);
      toast.error("Could not load dashboard data. Please try again.");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardInsightsData(true);

    const handleProfileUpdated = () => {
      fetchDashboardInsightsData(false);
    };
    const handleDocumentUpdated = () => {
      fetchDashboardInsightsData(false);
    };
    window.addEventListener("ahiia:profile-updated", handleProfileUpdated);
    window.addEventListener("ahiia:document-updated", handleDocumentUpdated);
    return () => {
      window.removeEventListener("ahiia:profile-updated", handleProfileUpdated);
      window.removeEventListener("ahiia:document-updated", handleDocumentUpdated);
    };
  }, []);

  // Safe data extraction
  const activity = insights?.activity || {};
  const profile = insights?.profile || {};
  const brandKit = insights?.brandKit || {};
  const recentDocuments = Array.isArray(insights?.recentDocuments)
    ? insights.recentDocuments
    : [];

  const profileLogo = brandKit?.logoUrl || profile?.logoUrl;
  const companyInitials = (profile?.companyName || "LT")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Document actions
  const handleDuplicate = async (docId) => {
    try {
      setActionLoadingId(docId);
      setActiveMenuDocId(null);
      await duplicateDocument(docId);
      toast.success("Document duplicated successfully");
      await fetchDashboardInsightsData(false);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to duplicate document"
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (docId) => {
    try {
      setActionLoadingId(docId);
      setActiveMenuDocId(null);
      await deleteDocument(docId);
      toast.success("Document deleted");
      await fetchDashboardInsightsData(false);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to delete document"
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const resolveDocStatus = (doc) => {
    if (!doc) return "Draft";
    if (doc.status === "Finalized" || doc.status === "Exported" || doc.status === "Saved") {
      return doc.status;
    }
    if (
      (doc.revisionCount && doc.revisionCount > 1) ||
      (doc.updatedAt && doc.createdAt && doc.updatedAt !== doc.createdAt)
    ) {
      return "Saved";
    }
    return doc.status || "Draft";
  };

  // Filter documents
  const filteredDocuments = recentDocuments.filter((doc) => {
    const docType = doc.documentTypeLabel || doc.documentType || "";
    const matchesType =
      typeFilter === "All types" || docType === typeFilter;
    const effectiveStatus = resolveDocStatus(doc);
    const matchesStatus =
      statusFilter === "All Status" || effectiveStatus === statusFilter;
    return matchesType && matchesStatus;
  });

  // Collect unique document types present in recentDocuments
  const availableTypes = Array.from(
    new Set(
      recentDocuments
        .map((d) => d.documentTypeLabel || d.documentType)
        .filter(Boolean)
    )
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "Finalized":
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-[#059669] border border-emerald-200/50">
            Finalized
          </span>
        );
      case "Exported":
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EEF2FF] text-[#4F46E5] border border-indigo-200/50">
            Exported
          </span>
        );
      case "Saved":
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-[#059669] border border-emerald-200/50">
            Saved
          </span>
        );
      case "Draft":
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FFFBEB] text-[#D97706] border border-amber-200/50">
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
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase">
              Workspace
            </span>
            {profile?.companyName && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100/80">
                <Building2 className="w-3 h-3 text-indigo-600" />
                {profile.companyName}
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {getGreeting()}
            {profile?.companyName ? `, ${profile.companyName}` : ""}
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Build professional business documents using the context you've already given Ahiia.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/dashboard/create-document")}
          className="inline-flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl bg-[#131B4D] hover:bg-[#1C2666] text-white font-bold text-sm shadow-md shadow-[#131B4D]/20 transition-all hover:shadow-lg hover:scale-[1.01] shrink-0 cursor-pointer"
        >
          <FilePlus className="w-4 h-4" />
          <span>Create document</span>
        </button>
      </div>

      {/* 2. Your Activity Stat Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-extrabold text-slate-900">
            Your activity
          </h3>
          <button
            type="button"
            onClick={() => fetchDashboardInsightsData(false)}
            title="Refresh overview"
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-600" : ""}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Card 1: Documents Created */}
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
                {activity?.documentsCreated ?? (loading ? "—" : 0)}
              </span>
              <p className="text-xs text-slate-400 mt-1">
                Total documents created
              </p>
            </div>
          </div>

          {/* Card 2: Most Used Generator */}
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
                {activity?.mostUsedGenerator?.label ||
                  activity?.mostUsedGenerator?.documentType ||
                  (loading ? "—" : "None yet")}
              </span>
              <p className="text-xs text-slate-400 mt-1">
                Your most frequently used document type
              </p>
            </div>
          </div>

          {/* Card 3: AI Edits */}
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
                {activity?.aiEdits ?? (loading ? "—" : 0)}
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
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Recent Documents
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Quick access to your latest drafts and generated proposals
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Type Filter */}
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="appearance-none text-xs font-semibold bg-white text-slate-700 pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 shadow-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option>All types</option>
                  {availableTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                  {availableTypes.length === 0 && (
                    <>
                      <option>Business Proposal</option>
                      <option>Contract</option>
                      <option>Marketing Plan</option>
                      <option>Pitch Deck</option>
                    </>
                  )}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none text-xs font-semibold bg-white text-slate-700 pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 shadow-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option>All Status</option>
                  <option>Saved</option>
                  <option>Draft</option>
                  <option>Finalized</option>
                  <option>Exported</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Documents List */}
          <div className="divide-y divide-slate-100">
            {loading && recentDocuments.length === 0 ? (
              <div className="py-6 space-y-4">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="flex items-center justify-between py-2 px-1 animate-pulse"
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
                      <div className="space-y-1.5 flex-1 max-w-sm">
                        <div className="h-4 bg-slate-100 rounded w-3/4" />
                        <div className="h-3 bg-slate-100 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-16 bg-slate-100 rounded-full" />
                      <div className="h-8 w-16 bg-slate-100 rounded-lg hidden sm:block" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-700">
                  {recentDocuments.length === 0
                    ? "No documents yet"
                    : "No documents matching the selected filters"}
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  {recentDocuments.length === 0
                    ? "Start creating professional proposals, plans, and decks with Ahiia AI."
                    : "Try resetting your filter to view all available recent documents."}
                </p>
                {recentDocuments.length === 0 && (
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard/create-document")}
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-[#131B4D] text-white text-xs font-bold hover:bg-[#1B2666] transition-colors cursor-pointer"
                  >
                    <FilePlus className="w-3.5 h-3.5" />
                    Create your first document
                  </button>
                )}
              </div>
            ) : (
              filteredDocuments.map((doc) => {
                const typeCfg = getTypeConfig(doc);
                const IconComponent = typeCfg.icon;
                const isItemActionLoading = actionLoadingId === doc.id;

                return (
                  <div
                    key={doc.id}
                    className="py-4 flex items-center justify-between gap-3 group hover:bg-slate-50/60 -mx-2 px-2 rounded-xl transition-colors"
                  >
                    {/* Left: Icon + Info */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeCfg.tint}`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {doc.title || "Untitled Document"}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {doc.documentTypeLabel ||
                            doc.documentType ||
                            "Business Proposal"}{" "}
                          • {doc.revisionCount ?? 1} revision
                          {doc.revisionCount === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>

                    {/* Middle: Badge & Updated */}
                    <div className="hidden sm:flex items-center gap-4 shrink-0">
                      <div>{getStatusBadge(resolveDocStatus(doc))}</div>
                      <span className="text-xs text-slate-400 w-32 text-right">
                        {formatTimeAgo(doc.updatedAt)}
                      </span>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            doc.id
                              ? `/dashboard/documents/${doc.id}`
                              : `/dashboard/create-document/${
                                  doc.slug || "business-proposal"
                                }`
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      {/* Dropdown menu trigger */}
                      <div className="relative" ref={menuRef}>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuDocId(
                              activeMenuDocId === doc.id ? null : doc.id
                            )
                          }
                          disabled={isItemActionLoading}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
                          aria-label="More actions"
                        >
                          {isItemActionLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                          ) : (
                            <MoreHorizontal className="w-4 h-4" />
                          )}
                        </button>

                        {activeMenuDocId === doc.id && (
                          <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-30 animate-in fade-in duration-100">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuDocId(null);
                                navigate(
                                  doc.id
                                    ? `/dashboard/documents/${doc.id}`
                                    : `/dashboard/create-document/${
                                        doc.slug || "business-proposal"
                                      }`
                                );
                              }}
                              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                              Edit Document
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicate(doc.id)}
                              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              Duplicate
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(doc.id)}
                              className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
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
              <span>
                Showing {filteredDocuments.length} of {recentDocuments.length}{" "}
                document{recentDocuments.length === 1 ? "" : "s"}
              </span>
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
              <div className="flex items-center gap-3">
                {profileLogo ? (
                  <img
                    src={profileLogo}
                    alt={profile.companyName || "Company logo"}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-black shrink-0 border border-indigo-100">
                    {companyInitials}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-base font-extrabold text-slate-900 truncate">
                    {profile?.companyName || "Your Business"}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    {profile?.industry || "Industry not specified"}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile completeness bar */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">
                  Profile completeness
                </span>
                <span className="font-bold text-blue-600">
                  {profile?.completenessPercent ?? 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${profile?.completenessPercent ?? 0}%` }}
                />
              </div>

              {profile?.missingFields && profile.missingFields.length > 0 ? (
                <p className="text-xs text-slate-400 mt-2">
                  Missing:{" "}
                  <span className="text-slate-600 font-medium">
                    {profile.missingFields
                      .map((f) => f.replace(/([A-Z])/g, " $1").toLowerCase())
                      .join(", ")}
                  </span>
                </p>
              ) : (
                <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Profile fully structured
                </p>
              )}
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
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                  brandKit?.configured
                    ? "bg-[#ECFDF5] text-[#059669] border border-emerald-200/50"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                {brandKit?.configured ? "Configured" : "Not configured"}
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-3 leading-relaxed">
              {brandKit?.configured
                ? "Your brand identity is ready to be applied to generated documents."
                : "Set up your brand colors, typography, and logo for documents."}
            </p>

            {/* Brand Kit Details */}
            <div className="mt-4 space-y-3 text-xs">
              {/* Logo */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Logo</span>
                {brandKit?.logoUrl ? (
                  <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700 text-[11px]">
                    <img
                      src={brandKit.logoUrl}
                      alt="Brand logo"
                      className="w-4 h-4 rounded object-cover bg-white"
                    />
                    <span className="font-mono text-[10px] text-slate-600 truncate max-w-[110px]">
                      logo.jpg
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-400 italic text-[11px]">
                    Not configured
                  </span>
                )}
              </div>

              {/* Colours */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Colours</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-4 h-4 rounded-full border border-slate-200 shadow-xs"
                      style={{
                        backgroundColor: brandKit?.primaryColor || "#0F172A",
                      }}
                      title={`Primary: ${brandKit?.primaryColor || "#0F172A"}`}
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-slate-200 shadow-xs"
                      style={{
                        backgroundColor: brandKit?.secondaryColor || "#2563EB",
                      }}
                      title={`Secondary: ${brandKit?.secondaryColor || "#2563EB"}`}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {brandKit?.primaryColor || "#0F172A"}
                  </span>
                </div>
              </div>

              {/* Font */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Font</span>
                <span className="font-bold text-slate-800">
                  {brandKit?.font || "Default"}
                </span>
              </div>

              {/* Tagline */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Tagline</span>
                <span
                  className="font-medium text-slate-700 truncate max-w-[160px] text-right"
                  title={brandKit?.tagline || ""}
                >
                  {brandKit?.tagline ? `"${brandKit.tagline}"` : "None set"}
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
