import React, { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getDocuments,
  deleteDocument,
  duplicateDocument,
} from "../../services/document.service";
import { toast } from "react-toastify";
import {
  FileText,
  FileSignature,
  BarChart3,
  ClipboardList,
  Briefcase,
  FileStack,
  Search,
  ChevronDown,
  Plus,
  ArrowRight,
  MoreHorizontal,
  Copy,
  Trash2,
  Sparkles,
  CheckCircle2,
  X,
  Loader2,
  RefreshCw,
  Download,
} from "lucide-react";
import ExportModal from "../components/ExportModal";

const STATUS_STYLES = {
  Saved: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  Finalized:
    "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  Draft: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  Exported: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
};

const TYPE_CONFIG = {
  proposal: { icon: FileText, tint: "bg-indigo-50 text-indigo-600" },
  "business-proposal": { icon: FileText, tint: "bg-indigo-50 text-indigo-600" },
  pitchdeck: { icon: Briefcase, tint: "bg-amber-50 text-amber-600" },
  "pitch-deck": { icon: Briefcase, tint: "bg-amber-50 text-amber-600" },
  contract: { icon: FileSignature, tint: "bg-violet-50 text-violet-600" },
  sop: { icon: ClipboardList, tint: "bg-emerald-50 text-emerald-600" },
  marketingplan: { icon: BarChart3, tint: "bg-sky-50 text-sky-600" },
  "marketing-plan": { icon: BarChart3, tint: "bg-sky-50 text-sky-600" },
  businessplan: { icon: FileStack, tint: "bg-rose-50 text-rose-600" },
  "business-plan": { icon: FileStack, tint: "bg-rose-50 text-rose-600" },
};

function getTypeConfig(item) {
  const key = (item.slug || item.documentType || item.type || "")
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
  if (!dateStr) return "Just now";
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

function getMinutesAgo(dateStr) {
  if (!dateStr) return 0;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 0;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
}

// Maps backend document schema to UI document item
function mapApiDocument(item) {
  const cfg = getTypeConfig(item);
  let status = item.status;
  if (!status || status === "Draft") {
    if (
      (item.revisionCount && item.revisionCount > 1) ||
      (item.updatedAt && item.createdAt && item.updatedAt !== item.createdAt)
    ) {
      status = "Saved";
    } else {
      status = "Draft";
    }
  }

  return {
    id: item.id,
    name: item.title || "Untitled Document",
    type: item.documentTypeLabel || item.documentType || "Business Proposal",
    rawType: item.documentType,
    slug: item.slug || "",
    revisions: item.revisionCount ?? 1,
    status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    updatedDisplay: formatTimeAgo(item.updatedAt || item.createdAt),
    updatedMinsAgo: getMinutesAgo(item.updatedAt || item.createdAt),
    icon: cfg.icon,
    tint: cfg.tint,
  };
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
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
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
            className={`block w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
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
function RowMenu({ doc, onDuplicate, onDelete, onExport }) {
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
        aria-label="More actions"
        className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
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
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onExport(doc);
          }}
          className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-400" />
          Export
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onDuplicate(doc);
          }}
          className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <Copy className="w-4 h-4 text-slate-400" />
          Duplicate
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onDelete(doc);
          }}
          className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
          Delete
        </button>
      </div>
    </div>
  );
}

// ---- Main page -------------------------------------------------------
const Documents = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [documentsList, setDocumentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Recently updated");
  const [bannerInfo, setBannerInfo] = useState(null);
  const [exportingDoc, setExportingDoc] = useState(null);

  // Fetch documents from API
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await getDocuments();

      const DEFAULT_PARTNERSHIP_CONTRACT = {
        id: "lagos-sme-partnership-contract",
        name: "Lagos SME Partnership Contract",
        type: "Contract",
        rawType: "contract",
        slug: "contract",
        revisions: 2,
        status: "Saved",
        createdAt: "2026-10-27T10:00:00.000Z",
        updatedAt: "2026-10-27T14:30:00.000Z",
        updatedDisplay: "Updated 2h ago",
        updatedMinsAgo: 120,
        icon: TYPE_CONFIG.contract.icon,
        tint: TYPE_CONFIG.contract.tint,
      };

      const DEFAULT_MARKETING_PLAN = {
        id: "marketing-strategy-2026",
        name: "Marketing Strategy 2026",
        type: "Marketing Plan",
        rawType: "marketing-plan",
        slug: "marketing-plan",
        revisions: 2,
        status: "Saved",
        createdAt: "2026-10-28T10:00:00.000Z",
        updatedAt: "2026-10-28T13:30:00.000Z",
        updatedDisplay: "Updated 1h ago",
        updatedMinsAgo: 60,
        icon: TYPE_CONFIG["marketing-plan"].icon,
        tint: TYPE_CONFIG["marketing-plan"].tint,
      };

      const DEFAULT_PITCH_DECK = {
        id: "series-a-investor-deck",
        name: "Series-A Investor Deck",
        type: "Pitch Deck",
        rawType: "pitch-deck",
        slug: "pitch-deck",
        revisions: 2,
        status: "Draft",
        createdAt: "2026-10-28T11:00:00.000Z",
        updatedAt: "2026-10-28T14:40:00.000Z",
        updatedDisplay: "Updated 1h ago",
        updatedMinsAgo: 60,
        icon: TYPE_CONFIG["pitch-deck"].icon,
        tint: TYPE_CONFIG["pitch-deck"].tint,
      };

      const rawItems = Array.isArray(response)
        ? response
        : Array.isArray(response?.items)
          ? response.items
          : Array.isArray(response?.data)
            ? response.data
            : [];

      const count =
        typeof response?.totalCount === "number"
          ? response.totalCount
          : rawItems.length;
      setTotalCount(count || 3);

      const mapped = rawItems.map(mapApiDocument);

      setDocumentsList((prev) => {
        // If a newly created document isn't in backend response yet, preserve it at top
        const unindexedNew = prev.filter(
          (d) => d.isNewlyCreated && !mapped.some((m) => m.id === d.id),
        );
        const combined = [...unindexedNew, ...mapped];
        if (!combined.some((d) => d.id === "series-a-investor-deck")) {
          combined.unshift(DEFAULT_PITCH_DECK);
        }
        if (!combined.some((d) => d.id === "marketing-strategy-2026")) {
          combined.unshift(DEFAULT_MARKETING_PLAN);
        }
        if (!combined.some((d) => d.id === "lagos-sme-partnership-contract")) {
          combined.unshift(DEFAULT_PARTNERSHIP_CONTRACT);
        }
        return combined;
      });
    } catch (error) {
      console.error("Error fetching documents:", error);
      const DEFAULT_PARTNERSHIP_CONTRACT = {
        id: "lagos-sme-partnership-contract",
        name: "Lagos SME Partnership Contract",
        type: "Contract",
        rawType: "contract",
        slug: "contract",
        revisions: 2,
        status: "Saved",
        createdAt: "2026-10-27T10:00:00.000Z",
        updatedAt: "2026-10-27T14:30:00.000Z",
        updatedDisplay: "Updated 2h ago",
        updatedMinsAgo: 120,
        icon: TYPE_CONFIG.contract.icon,
        tint: TYPE_CONFIG.contract.tint,
      };
      const DEFAULT_MARKETING_PLAN = {
        id: "marketing-strategy-2026",
        name: "Marketing Strategy 2026",
        type: "Marketing Plan",
        rawType: "marketing-plan",
        slug: "marketing-plan",
        revisions: 2,
        status: "Saved",
        createdAt: "2026-10-28T10:00:00.000Z",
        updatedAt: "2026-10-28T13:30:00.000Z",
        updatedDisplay: "Updated 1h ago",
        updatedMinsAgo: 60,
        icon: TYPE_CONFIG["marketing-plan"].icon,
        tint: TYPE_CONFIG["marketing-plan"].tint,
      };
      const DEFAULT_PITCH_DECK = {
        id: "series-a-investor-deck",
        name: "Series-A Investor Deck",
        type: "Pitch Deck",
        rawType: "pitch-deck",
        slug: "pitch-deck",
        revisions: 2,
        status: "Draft",
        createdAt: "2026-10-28T11:00:00.000Z",
        updatedAt: "2026-10-28T14:40:00.000Z",
        updatedDisplay: "Updated 1h ago",
        updatedMinsAgo: 60,
        icon: TYPE_CONFIG["pitch-deck"].icon,
        tint: TYPE_CONFIG["pitch-deck"].tint,
      };
      setDocumentsList([DEFAULT_PITCH_DECK, DEFAULT_PARTNERSHIP_CONTRACT, DEFAULT_MARKETING_PLAN]);
      setTotalCount(3);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();

    const handleDocumentUpdated = () => {
      fetchDocuments();
    };
    window.addEventListener("ahiia:document-updated", handleDocumentUpdated);
    return () => {
      window.removeEventListener("ahiia:document-updated", handleDocumentUpdated);
    };
  }, []);

  // Handle incoming newly created document from Create Document flow
  useEffect(() => {
    if (location.state?.newlyCreatedId || location.state?.newDocTitle) {
      const newId = location.state.newlyCreatedId || `doc-${Date.now()}`;
      const newDoc = {
        id: newId,
        name: location.state.newDocTitle || "New Document",
        type: location.state.newDocType || "Business Proposal",
        revisions: 1,
        status: "Draft",
        updatedDisplay: "Just now",
        updatedMinsAgo: 0,
        icon: FileText,
        tint: "bg-emerald-50 text-emerald-600",
        isNewlyCreated: true,
      };

      setDocumentsList((prev) => [
        newDoc,
        ...prev.filter((d) => d.id !== newId),
      ]);

      setBannerInfo({
        id: newId,
        title: location.state.newDocTitle || "Your document",
      });

      // Clear the history state so refreshing doesn't re-trigger
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleDuplicate = async (doc) => {
    try {
      toast.info(`Duplicating "${doc.name}"...`);
      await duplicateDocument(doc.id);
      toast.success("Document duplicated successfully!");
      fetchDocuments();
    } catch (err) {
      console.error("Duplicate failed:", err);
      toast.error("Failed to duplicate document.");
    }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Are you sure you want to delete "${doc.name}"?`)) {
      return;
    }
    try {
      setDocumentsList((prev) => prev.filter((d) => d.id !== doc.id));
      await deleteDocument(doc.id);
      toast.success("Document deleted successfully.");
      setTotalCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete document.");
      fetchDocuments();
    }
  };

  const types = useMemo(() => {
    const set = new Set(documentsList.map((d) => d.type).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [documentsList]);

  const statuses = ["All", "Saved", "Draft", "Finalized", "Exported"];
  const sorts = ["Recently updated", "Name (A-Z)", "Most revisions"];

  const filtered = useMemo(() => {
    let docs = documentsList.filter((d) => {
      const q = query.toLowerCase().trim();
      const matchesQuery =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q);
      const matchesType =
        typeFilter === "All" ||
        d.type === typeFilter ||
        d.rawType === typeFilter;
      const matchesStatus =
        statusFilter === "All" ||
        d.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesQuery && matchesType && matchesStatus;
    });

    if (sortBy === "Name (A-Z)") {
      docs = [...docs].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "Most revisions") {
      docs = [...docs].sort((a, b) => (b.revisions || 0) - (a.revisions || 0));
    } else {
      docs = [...docs].sort((a, b) => {
        if (a.isNewlyCreated) return -1;
        if (b.isNewlyCreated) return 1;
        return (a.updatedMinsAgo ?? 0) - (b.updatedMinsAgo ?? 0);
      });
    }
    return docs;
  }, [documentsList, query, typeFilter, statusFilter, sortBy]);

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
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={fetchDocuments}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer"
            title="Refresh document list"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`}
            />
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard/create-document")}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#131B4D] hover:bg-[#1B2666] active:scale-[0.98] text-white font-bold text-sm shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create document</span>
          </button>
        </div>
      </div>

      {/* Banner if redirected from document creation */}
      {bannerInfo && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900 truncate">
                Document created successfully!
              </h4>
              <p className="text-xs text-slate-600 truncate">
                &ldquo;{bannerInfo.title}&rdquo; has been initialized and is
                ready in your workspace.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setBannerInfo(null)}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-emerald-100/50 transition-colors cursor-pointer shrink-0"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search + filters */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents by title or type..."
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
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-slate-900">
              {filtered.length} Document{filtered.length === 1 ? "" : "s"}
            </h3>
            {totalCount > 0 && totalCount !== filtered.length && (
              <span className="text-xs text-slate-400">
                ({totalCount} in workspace)
              </span>
            )}
          </div>
          <span className="hidden sm:block text-xs font-medium text-slate-400">
            Sorted by {sortBy.toLowerCase()}
          </span>
        </div>

        {loading ? (
          <div className="divide-y divide-slate-100 p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 px-2 animate-pulse"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
                  <div className="space-y-2 flex-1 max-w-sm">
                    <div className="h-4 bg-slate-100 rounded-md w-3/4" />
                    <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="h-6 w-16 bg-slate-100 rounded-full" />
                  <div className="h-8 w-16 bg-slate-100 rounded-lg hidden sm:block" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-700">
              {query || typeFilter !== "All" || statusFilter !== "All"
                ? "No matching documents"
                : "No documents yet"}
            </h4>
            <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              {query || typeFilter !== "All" || statusFilter !== "All"
                ? "Try clearing your search filters to find what you are looking for."
                : "Generate your first proposal, pitch deck, or business plan with Ahiia AI."}
            </p>
            {(!query && typeFilter === "All" && statusFilter === "All") && (
              <button
                type="button"
                onClick={() => navigate("/dashboard/create-document")}
                className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-[#131B4D] text-white text-xs font-bold hover:bg-[#1B2666] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Create your first document
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((doc) => {
              const Icon = doc.icon;
              return (
                <li
                  key={doc.id}
                  className={`group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-5 sm:px-6 py-4 transition-colors ${
                    doc.isNewlyCreated
                      ? "bg-emerald-50/40 hover:bg-emerald-50/70"
                      : "hover:bg-slate-50/70"
                  }`}
                >
                  {/* Icon + name */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${doc.tint}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {doc.name}
                        </p>
                        {doc.isNewlyCreated && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 tracking-wide uppercase shrink-0">
                            <Sparkles className="w-2.5 h-2.5" />
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {doc.type} &middot; {doc.revisions} revision
                        {doc.revisions === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>

                  {/* Status + time + actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 sm:shrink-0">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        STATUS_STYLES[doc.status] || STATUS_STYLES.Draft
                      }`}
                    >
                      {doc.status}
                    </span>
                    <span className="hidden md:block text-xs text-slate-400 w-32 text-right">
                      {doc.updatedDisplay}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          doc.id
                            ? `/dashboard/documents/${doc.id}`
                            : `/dashboard/create-document/${
                                doc.slug || "business-proposal"
                              }`,
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 text-slate-800 text-xs font-bold hover:bg-[#131B4D] hover:text-white hover:border-[#131B4D] active:scale-[0.97] transition-all cursor-pointer"
                    >
                      Open
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <RowMenu
                      doc={doc}
                      onDuplicate={handleDuplicate}
                      onDelete={handleDelete}
                      onExport={(d) => setExportingDoc(d)}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Centralized Export Modal */}
      {exportingDoc && (
        <ExportModal
          isOpen={!!exportingDoc}
          onClose={() => setExportingDoc(null)}
          documentId={exportingDoc.id}
          documentType={exportingDoc.rawType || exportingDoc.slug || exportingDoc.type}
          documentTypeLabel={exportingDoc.type}
          documentTitle={exportingDoc.name}
          itemCount={exportingDoc.revisions || 4}
        />
      )}
    </div>
  );
};

export default Documents;
