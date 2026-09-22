import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

// ---------------------------------------------------------------------------
// Renders the "Optional information" card with one or more accordion rows.
// `sections` comes from the template config (label + helper text), `values`
// / `onChange` hold the freeform text per section key.
// ---------------------------------------------------------------------------
const OptionalInformation = ({ sections, values, onChange }) => {
  const [openKey, setOpenKey] = useState(null);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
      <h3 className="text-sm font-bold text-slate-900">Optional information</h3>
      <p className="text-xs text-slate-400 mt-0.5 mb-4">
        Add more context if you'd like Ahiia.Ai to make the document more
        specific.
      </p>

      <div className="space-y-3">
        {sections.map((section) => {
          const isOpen = openKey === section.key;
          return (
            <div
              key={section.key}
              className="border border-slate-200 rounded-2xl overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenKey(isOpen ? null : section.key)}
                className="w-full flex items-start justify-between gap-3 px-4 py-3.5 text-left"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {section.label}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {section.helper}
                  </p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 mt-1 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-4">
                  <textarea
                    rows={3}
                    placeholder="Type here..."
                    value={values[section.key] || ""}
                    onChange={(e) => onChange(section.key, e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 text-sm px-3.5 py-2.5 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#131B4D]/15 focus:border-[#131B4D] transition-colors resize-none"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OptionalInformation;
