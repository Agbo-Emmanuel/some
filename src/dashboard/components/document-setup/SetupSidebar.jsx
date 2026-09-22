import React from "react";
import { Check, Circle, ArrowRight } from "lucide-react";
import {
  COMPANY_PROFILE,
  WRITING_STYLES,
} from "../../../config/documentTemplates";

// ---------------------------------------------------------------------------
// The right rail is identical across every document type: only the title,
// required-section list, and completion count change.
// ---------------------------------------------------------------------------
const SetupSidebar = ({
  templateTitle,
  requiredSections,
  completedKeys,
  writingStyle,
  onWritingStyleChange,
  brandKitConnected = true,
}) => {
  const completedCount = requiredSections.filter((s) =>
    completedKeys.includes(s.key),
  ).length;

  return (
    <aside className="space-y-4 lg:sticky lg:top-4 h-fit">
      {/* Document Setup progress */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5">
        <p className="text-[11px] font-bold text-slate-400">Document Setup</p>
        <h4 className="text-base font-black text-slate-900 mt-0.5">
          {templateTitle}
        </h4>
        <p className="text-xs text-slate-400 mt-1 mb-3">
          {completedCount} of {requiredSections.length} required sections
          complete
        </p>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-[#131B4D] rounded-full transition-all"
            style={{
              width: `${(completedCount / requiredSections.length) * 100}%`,
            }}
          />
        </div>
        <ul className="space-y-2.5">
          {requiredSections.map((s) => {
            const done = completedKeys.includes(s.key);
            return (
              <li key={s.key} className="flex items-center gap-2">
                {done ? (
                  <span className="w-4 h-4 rounded-full bg-[#131B4D] flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </span>
                ) : (
                  <Circle
                    className="w-4 h-4 text-slate-200 shrink-0"
                    strokeWidth={2}
                  />
                )}
                <span
                  className={`text-xs font-medium ${
                    done ? "text-slate-700" : "text-slate-400"
                  }`}
                >
                  {s.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Company Profile */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5">
        <p className="text-sm font-bold text-slate-900 mb-1">Company Profile</p>
        <p className="text-xs text-slate-400 mb-3">
          Your saved company information will be used to personalize this
          document.
        </p>
        <ul className="space-y-1.5 mb-3">
          {COMPANY_PROFILE.fields.map((f) => (
            <li
              key={f.label}
              className="flex items-center gap-1.5 text-xs text-slate-600"
            >
              <Check
                className="w-3 h-3 text-emerald-500 shrink-0"
                strokeWidth={3}
              />
              {f.label}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
        >
          View Company Profile <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Brand Kit */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5">
        <p className="text-sm font-bold text-slate-900 mb-1">Brand Kit</p>
        {brandKitConnected ? (
          <p className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 mb-2">
            <Check className="w-3 h-3" strokeWidth={3} /> Brand Kit connected
          </p>
        ) : (
          <p className="text-xs font-bold text-slate-400 mb-2">
            Brand Kit not connected
          </p>
        )}
        <p className="text-xs text-slate-400">
          Your saved brand colors, logo and typography will be available when
          styling the document.
        </p>
      </div>

      {/* Writing Style */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5">
        <p className="text-sm font-bold text-slate-900 mb-3">Writing Style</p>
        <div className="flex flex-wrap gap-2">
          {WRITING_STYLES.map((style) => {
            const active = writingStyle === style.id;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => onWritingStyleChange(style.id)}
                className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-colors ${
                  active
                    ? "border-[#131B4D] bg-[#131B4D] text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {style.label}
                {style.tag && (
                  <span className={active ? "opacity-80" : "text-slate-400"}>
                    {" "}
                    · {style.tag}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default SetupSidebar;
