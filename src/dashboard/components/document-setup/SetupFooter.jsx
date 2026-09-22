import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

const SetupFooter = ({
  completedCount,
  totalRequired,
  onBack,
  onSaveDraft,
  onReviewAndGenerate,
}) => (
  <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
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
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Save Draft
        </button>
        <button
          type="button"
          onClick={onReviewAndGenerate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#131B4D] hover:bg-[#1B2666] text-white text-sm font-bold transition-colors"
        >
          Review & Generate <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
    <p className="text-[11px] text-slate-400 mt-3">
      You can save a draft at any point required sections are checked before
      generating.
    </p>
  </div>
);

export default SetupFooter;
