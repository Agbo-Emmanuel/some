import React from "react";

// ---------------------------------------------------------------------------
// Generic labelled field wrapper. Keeps every form's markup identical so the
// setup pages line up pixel-for-pixel with the design regardless of type.
// ---------------------------------------------------------------------------
export const FieldLabel = ({ children, hint }) => (
  <div className="mb-1.5">
    <label className="block text-xs font-bold text-slate-700">{children}</label>
    {hint && <p className="text-[11px] text-slate-400 mt-0.5">{hint}</p>}
  </div>
);

export const TextInput = ({ label, hint, prefix, ...props }) => (
  <div>
    <FieldLabel hint={hint}>{label}</FieldLabel>
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
          {prefix}
        </span>
      )}
      <input
        {...props}
        className={`w-full rounded-xl border border-slate-200 bg-slate-50/60 text-sm px-3.5 py-2.5 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#131B4D]/15 focus:border-[#131B4D] transition-colors ${
          prefix ? "pl-7" : ""
        }`}
      />
    </div>
  </div>
);

export const TextArea = ({ label, hint, rows = 3, ...props }) => (
  <div>
    <FieldLabel hint={hint}>{label}</FieldLabel>
    <textarea
      rows={rows}
      {...props}
      className="w-full rounded-xl border border-slate-200 bg-slate-50/60 text-sm px-3.5 py-2.5 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#131B4D]/15 focus:border-[#131B4D] transition-colors resize-none"
    />
  </div>
);

// Row of selectable pill chips, e.g. "Starting a new venture" / "Seeking funding"
export const ChipGroup = ({ options, value, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {options.map((opt) => {
      const active = value === opt;
      return (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors ${
            active
              ? "border-[#131B4D] bg-[#131B4D] text-white"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
          }`}
        >
          {opt}
        </button>
      );
    })}
  </div>
);

// Section wrapper with the "Required" badge used above every required block
export const RequiredSection = ({ title, description, children }) => (
  <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        {description && (
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        )}
      </div>
      <span className="shrink-0 px-2.5 py-1 rounded-full bg-[#131B4D] text-white text-[10px] font-bold">
        Required
      </span>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);
