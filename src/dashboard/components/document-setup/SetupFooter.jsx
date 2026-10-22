import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

const SetupFooter = ({
  completedCount,
  totalRequired,
  onBack,
  onSaveDraft,
  onReviewAndGenerate,
  isSavingDraft = false,
}) => {
  const isComplete = completedCount === totalRequired;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <span className="text-xs text-slate-400 font-medium">
            {completedCount} of {totalRequired} required sections complete
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSavingDraft}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSavingDraft ? "Saving..." : "Save Draft"}
          </button>
          <button
            type="button"
            onClick={onReviewAndGenerate}
            disabled={!isComplete}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              isComplete
                ? "bg-[#131B4D] hover:bg-[#1B2666] active:scale-[0.98] text-white shadow-xs cursor-pointer"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            Review & Generate <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-[11px] text-slate-400 mt-3">
        {isComplete
          ? "All required fields are complete! Click Review & Generate to create your document."
          : `Complete all ${totalRequired} required sections to review and generate your document.`}
      </p>
    </div>
  );
};

export default SetupFooter;
