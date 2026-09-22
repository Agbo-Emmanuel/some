import React from "react";
import { Sparkles } from "lucide-react";

// ---------------------------------------------------------------------------
// "Ready to generate your X?" summary modal — identical shape for every
// document type, only the summary row values change.
// ---------------------------------------------------------------------------
const SummaryRow = ({ label, value, tone = "default" }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
    <span className="text-xs text-slate-500">{label}</span>
    <span
      className={`text-xs font-bold ${
        tone === "success" ? "text-emerald-600" : "text-slate-900"
      }`}
    >
      {value}
    </span>
  </div>
);

const GenerateModal = ({
  templateTitle,
  optionalAddedCount,
  optionalTotalCount,
  writingStyleLabel,
  onEdit,
  onGenerate,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6 sm:p-7">
        <div className="w-11 h-11 rounded-2xl bg-[#131B4D] flex items-center justify-center mb-4">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-black text-slate-900">
          Ready to generate your {templateTitle}?
        </h3>
        <p className="text-xs text-slate-500 mt-1.5 mb-4 leading-relaxed">
          Ahiia will structure your information into a first draft. The draft is
          saved as a revision, so nothing you entered is lost.
        </p>

        <div className="bg-slate-50/60 rounded-2xl px-4">
          <SummaryRow label="Document Type" value={templateTitle} />
          <SummaryRow
            label="Required Information"
            value="✓ Complete"
            tone="success"
          />
          <SummaryRow
            label="Optional Details"
            value={`${optionalAddedCount} of ${optionalTotalCount} added`}
          />
          <SummaryRow
            label="Company Profile"
            value="✓ Included"
            tone="success"
          />
          <SummaryRow label="Brand Kit" value="✓ Included" tone="success" />
          <SummaryRow label="Writing Style" value={writingStyleLabel} />
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            type="button"
            onClick={onEdit}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            ← Edit Information
          </button>
          <button
            type="button"
            onClick={onGenerate}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#131B4D] hover:bg-[#1B2666] text-white text-sm font-bold transition-colors"
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateModal;
