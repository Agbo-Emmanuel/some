import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Palette,
  Check,
  FileText,
  Briefcase,
  LayoutGrid,
  FileSignature,
  Megaphone,
  ClipboardList,
} from "lucide-react";
import { getBlueprints } from "../../services/document.service";
import { getUserProfile } from "../../services/profile.service";
import { TEMPLATES } from "../../config/documentTemplates";

// ---------------------------------------------------------------------------
// Icon lookup by slug – the API doesn't return icons so we map them locally.
// ---------------------------------------------------------------------------
const ICON_MAP = {
  "business-proposal": FileText,
  "pitch-deck": Briefcase,
  sop: LayoutGrid,
  contract: FileSignature,
  "marketing-plan": Megaphone,
  "business-plan": ClipboardList,
};

// Build a human-readable comma-separated summary from the inputs array.
const buildInputSummary = (inputs = []) =>
  inputs.map((i) => i.label).join(", ");

// Skeleton card shown while loading.
const SkeletonCard = () => (
  <div className="relative bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs animate-pulse">
    <div className="w-11 h-11 rounded-2xl bg-slate-100 mb-4" />
    <div className="h-4 w-2/3 bg-slate-100 rounded-full mb-2" />
    <div className="h-3 w-full bg-slate-100 rounded-full mb-1" />
    <div className="h-3 w-4/5 bg-slate-100 rounded-full mt-4" />
  </div>
);

const CreateDocument = () => {
  const navigate = useNavigate();
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [blueprints, setBlueprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companyName, setCompanyName] = useState("");

  const selected = blueprints.find((b) => b.slug === selectedSlug);

  useEffect(() => {
    getUserProfile()
      .then((res) => {
        const data = res?.companyName ? res : res?.data || res;
        if (data?.companyName) setCompanyName(data.companyName);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchBlueprints = async () => {
      try {
        setLoading(true);
        setError(null);
        const fallbackList = TEMPLATES.map((t) => ({
          slug: t.id,
          label: t.title,
          description: t.desc,
          inputs: t.requiredSections.map((s) => ({ label: s.label })),
        }));

        try {
          const response = await getBlueprints();
          const list = Array.isArray(response)
            ? response
            : Array.isArray(response?.data)
              ? response.data
              : [];
          if (list.length > 0) {
            const normalized = list.map((b) => {
              const rawSlug =
                b.slug || b.id || b.documentType || b.type || "";
              const slug = rawSlug
                ? rawSlug.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()
                : "business-proposal";
              return {
                slug,
                label: b.label || b.name || b.title || "Document",
                description: b.description || b.desc || "",
                inputs: Array.isArray(b.inputs)
                  ? b.inputs
                  : Array.isArray(b.requiredSections)
                    ? b.requiredSections.map((s) => ({
                        label: s.label || s,
                      }))
                    : [],
              };
            });
            setBlueprints(normalized);
          } else {
            setBlueprints(fallbackList);
          }
        } catch {
          // If the blueprints endpoint fails or requires seeding, gracefully fall back
          setBlueprints(fallbackList);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load document types. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlueprints();
  }, []);

  const handleContinue = () => {
    if (!selected) return;
    navigate(`/dashboard/create-document/${selected.slug}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 sm:pb-0">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <p className="text-xs font-bold text-blue-600 mb-1">
          Pick a generator to start a new business document.
        </p>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          What are you building today?
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Choose a document type and we'll help you turn your business context
          into a professional document
        </p>
      </div>

      {/* Context bar */}
      <div className="bg-white px-5 sm:px-6 py-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs sm:text-sm text-slate-500">
          Ahiia will use your Company Profile and Brand Kit to help personalize
          this document.
        </p>
        <div className="flex items-center gap-4 shrink-0">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Building2 className="w-3.5 h-3.5 text-blue-500" />
            {companyName || "Your Company"}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Palette className="w-3.5 h-3.5 text-blue-500" />
            Brand Kit applied
          </span>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-600 font-medium">
          {error}
        </div>
      )}

      {/* Template grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : blueprints.map((blueprint) => {
              const Icon = ICON_MAP[blueprint.slug] ?? FileText;
              const isSelected = blueprint.slug === selectedSlug;
              const inputSummary = buildInputSummary(blueprint.inputs);

              return (
                <button
                  key={blueprint.slug}
                  type="button"
                  onClick={() => setSelectedSlug(blueprint.slug)}
                  onDoubleClick={() =>
                    navigate(`/dashboard/create-document/${blueprint.slug}`)
                  }
                  aria-pressed={isSelected}
                  className={`relative text-left bg-white rounded-3xl p-5 sm:p-6 border shadow-xs transition-all duration-150 cursor-pointer group ${
                    isSelected
                      ? "border-[#131B4D] ring-2 ring-[#131B4D]/15 shadow-md"
                      : "border-slate-200/80 hover:border-slate-300 hover:shadow-md"
                  }`}
                >
                  {/* Selection indicator */}
                  <span
                    className={`absolute top-5 right-5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-[#131B4D] border-[#131B4D]"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    {isSelected && (
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    )}
                  </span>

                  {/* Icon */}
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                      isSelected
                        ? "bg-[#131B4D] text-white"
                        : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 pr-6">
                    {blueprint.label}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed pr-6">
                    {blueprint.description}
                  </p>

                  {/* Input summary */}
                  {inputSummary && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <p className="text-[11px] font-bold text-slate-400 mb-1">
                        Input
                      </p>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {inputSummary}
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
      </div>

      {/* Footer / continue bar */}
      <div className="fixed sm:sticky bottom-0 left-0 sm:left-auto right-0 sm:right-auto sm:bottom-2 z-10 bg-white sm:rounded-3xl border-t sm:border border-slate-200/80 shadow-[0_-4px_16px_rgba(15,23,42,0.06)] sm:shadow-xs px-5 sm:px-6 py-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-slate-400">Selected</p>
          <p
            className={`text-sm font-black truncate transition-colors ${
              selected ? "text-slate-900" : "text-slate-400"
            }`}
          >
            {selected ? selected.label : "No document type selected"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleContinue}
          disabled={!selected}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shrink-0 transition-all ${
            selected
              ? "bg-[#131B4D] hover:bg-[#1B2666] text-white active:scale-[0.98] cursor-pointer"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CreateDocument;
