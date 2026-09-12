import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full shrink-0 transition-colors duration-200 ${
        checked ? "bg-[#131B4D]" : "bg-slate-200"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

const PREFERENCES = [
  {
    id: "documentReady",
    title: "Document Ready",
    desc: "Tell me when a generated document is ready to review.",
  },
  {
    id: "exportReady",
    title: "Export Ready",
    desc: "Tell me when a PDF or DOCX export has finished.",
  },
  {
    id: "actionRequired",
    title: "Action Required",
    desc: "Tell me when a document needs my input before it can continue.",
  },
];

const NotificationSettings = () => {
  const { markDirty, registerSave } = useOutletContext();

  const [prefs, setPrefs] = useState({
    documentReady: false,
    exportReady: false,
    actionRequired: false,
  });

  useEffect(() => {
    registerSave(async () => {
      await new Promise((res) => setTimeout(res, 700));
      // Persist `prefs` to the API here.
    });
  }, [registerSave, prefs]);

  const handleToggle = (id, value) => {
    setPrefs((prev) => ({ ...prev, [id]: value }));
    markDirty();
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs">
      <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-5 border-b border-slate-100">
        <h3 className="text-sm font-black text-slate-900">Notifications</h3>
        <p className="text-xs text-slate-400 mt-1">
          Choose which document updates Ahiia emails you about.
        </p>
      </div>

      <div className="divide-y divide-slate-100 px-5 sm:px-6">
        {PREFERENCES.map((pref) => (
          <div
            key={pref.id}
            className="flex items-center justify-between gap-4 py-4"
          >
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900">{pref.title}</p>
              <p className="text-xs text-slate-400 mt-0.5">{pref.desc}</p>
            </div>
            <Toggle
              checked={prefs[pref.id]}
              onChange={(val) => handleToggle(pref.id, val)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationSettings;
