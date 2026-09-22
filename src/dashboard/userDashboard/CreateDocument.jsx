import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2, Palette, Check } from "lucide-react";
import { TEMPLATES } from "../../config/documentTemplates";

const CreateDocument = () => {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(null);

  const selected = TEMPLATES.find((t) => t.id === selectedId);

  const handleContinue = () => {
    if (!selected) return;
    navigate(`/dashboard/create-document/${selected.id}`);
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-24 sm:pb-0">
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
            SolarTech Nigeria
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Palette className="w-3.5 h-3.5 text-blue-500" />
            Brand Kit applied
          </span>
        </div>
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {TEMPLATES.map((tpl) => {
          const Icon = tpl.icon;
          const isSelected = tpl.id === selectedId;
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => setSelectedId(tpl.id)}
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
                {tpl.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed pr-6">
                {tpl.desc}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 mb-1">
                  Input
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {tpl.inputSummary}
                </p>
              </div>
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
            {selected ? selected.title : "No document type selected"}
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
