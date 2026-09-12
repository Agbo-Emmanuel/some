import React, { useCallback, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Loader2, CheckCircle2 } from "lucide-react";

const TABS = [
  { to: "account", label: "Account" },
  { to: "security", label: "Security" },
  { to: "notifications", label: "Notifications" },
];

const SettingsLanding = () => {
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveHandler, setSaveHandler] = useState(null);

  // Child tabs register how their own tab should persist changes.
  const registerSave = useCallback((fn) => {
    setSaveHandler(() => fn);
  }, []);

  const markDirty = useCallback((value = true) => setDirty(value), []);

  const handleSave = async () => {
    if (!dirty || saving) return;
    setSaving(true);
    setSaved(false);
    if (saveHandler) {
      await saveHandler();
    } else {
      await new Promise((res) => setTimeout(res, 700));
    }
    setSaving(false);
    setDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-blue-600 mb-1">
            Manage your Ahiia.Ai account and preferences.
          </p>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Settings
          </h2>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving}
          className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-xs transition-all shrink-0 ${
            dirty && !saving
              ? "bg-[#131B4D] hover:bg-[#1B2666] active:scale-[0.98] text-white cursor-pointer"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Saved
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>

      {/* Tab nav */}
      <div className="bg-white p-2 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors duration-150 ${
                  isActive
                    ? "bg-[#131B4D] text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200/70 hover:text-slate-700"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Unsaved changes indicator */}
      <div
        className={`bg-white px-5 sm:px-6 rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden transition-all duration-300 ${
          dirty
            ? "py-4 opacity-100"
            : "py-0 max-h-0 opacity-0 border-transparent"
        }`}
      >
        <p className="text-sm font-semibold text-amber-600 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
          You have unsaved changes.
        </p>
      </div>

      {/* Active tab content */}
      <Outlet context={{ markDirty, registerSave }} />
    </div>
  );
};

export default SettingsLanding;
