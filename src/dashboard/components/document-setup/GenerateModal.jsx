import React from "react";
import { Sparkles, Loader2 } from "lucide-react";

// ---------------------------------------------------------------------------
// "Ready to generate your document?" summary modal
// ---------------------------------------------------------------------------
const SummaryRow = ({ label, value, tone = "default" }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0 gap-4">
    <span className="text-xs text-slate-500 shrink-0">{label}</span>
    <span
      className={`text-xs font-bold truncate text-right ${
        tone === "success" ? "text-emerald-600" : "text-slate-900"
      }`}
    >
      {value}
    </span>
  </div>
);

const GenerateModal = ({
  documentTitle,
  templateTitle,
  styleTemplate = "Corporate",
  optionalAddedCount,
  optionalTotalCount,
  referencedCount = 0,
  writingStyleLabel,
  onEdit,
  onGenerate,
  isGenerating = false,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-7 border border-slate-100 transition-all">
        <div className="w-12 h-12 rounded-2xl bg-[#131B4D] flex items-center justify-center mb-4 shadow-sm">
          {isGenerating ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Sparkles className="w-6 h-6 text-white" />
          )}
        </div>

        <h3 className="text-lg font-black text-slate-900">
          {isGenerating
            ? `Generating your ${templateTitle}...`
            : `Ready to generate your ${templateTitle}?`}
        </h3>
        <p className="text-xs text-slate-500 mt-1.5 mb-4 leading-relaxed">
          {isGenerating
            ? "Ahiia.Ai is applying your business context, brand styling, and structuring a comprehensive first draft."
            : "Ahiia will structure your inputs into a professional document draft. Everything you entered will be saved safely."}
        </p>

        <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-100/80 mb-5">
          <SummaryRow
            label="Document Title"
            value={documentTitle || templateTitle}
          />
          <SummaryRow label="Document Type" value={templateTitle} />
          <SummaryRow label="Style Template" value={styleTemplate} />
          <SummaryRow label="Writing Style" value={writingStyleLabel} />
          <SummaryRow
            label="Required Information"
            value="✓ Complete"
            tone="success"
          />
          <SummaryRow
            label="Optional Details"
            value={`${optionalAddedCount} of ${optionalTotalCount} added`}
          />
          {referencedCount > 0 && (
            <SummaryRow
              label="Referenced Docs"
              value={`${referencedCount} selected`}
              tone="success"
            />
          )}
          <SummaryRow
            label="Company Profile"
            value="✓ Included"
            tone="success"
          />
          <SummaryRow label="Brand Kit" value="✓ Applied" tone="success" />
        </div>

        {isGenerating ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 justify-center py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Contacting Ahiia AI Generation Engine...</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#131B4D] rounded-full animate-pulse w-full" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onEdit}
              disabled={isGenerating}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer"
            >
              ← Edit Details
            </button>
            <button
              type="button"
              onClick={onGenerate}
              disabled={isGenerating}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#131B4D] hover:bg-[#1B2666] active:scale-[0.98] text-white text-sm font-bold shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Now</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateModal;

