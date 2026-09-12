import React, { useState } from "react";
import {
  Pencil,
  RotateCw,
  CheckCircle2,
  UploadCloud,
  ChevronDown,
  Loader2,
} from "lucide-react";

// ---- Business profile sections (AI-structured, read-only until edited) --
const INITIAL_PROFILE_SECTIONS = [
  {
    id: "mission",
    title: "Mission",
    hint: "What your business does today, and for whom.",
    body: "SolarTech Nigeria designs and installs commercial solar systems that give Nigerian businesses reliable, lower-cost power without depending on the grid.",
  },
  {
    id: "vision",
    title: "Vision",
    hint: "Where the business is heading over the next few years.",
    body: "To become the default energy partner for mid-sized Nigerian businesses, with installed capacity across every major commercial hub by 2030.",
  },
  {
    id: "advantage",
    title: "Competitive advantage",
    hint: "Why customers choose you over the alternatives.",
    body: "In-house engineering and maintenance teams, locally sourced components, and installations commissioned in under six weeks.",
  },
  {
    id: "audience",
    title: "Target audience",
    hint: "The customers your documents usually speak to.",
    body: "Operations and facilities leaders at manufacturing, logistics and retail businesses running 50kVA or more of daily load.",
  },
];

const INDUSTRIES = [
  "Renewable Energy",
  "Manufacturing",
  "Logistics & Supply Chain",
  "Retail & E-commerce",
  "Financial Services",
  "Construction",
];

// ---- One editable / regeneratable profile section -----------------------
function ProfileSection({ section, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(section.body);
  const [regenerating, setRegenerating] = useState(false);

  const handleSave = () => {
    onSave(section.id, draft);
    setEditing(false);
  };

  const handleRegenerate = () => {
    setRegenerating(true);
    // Simulate an AI regeneration call
    setTimeout(() => {
      onSave(
        section.id,
        `${section.body} Updated with the latest business context.`,
      );
      setRegenerating(false);
    }, 1100);
  };

  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-slate-900">{section.title}</h4>
          <p className="text-xs text-slate-400 mt-0.5">{section.hint}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setDraft(section.body);
              setEditing((e) => !e);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={regenerating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60 disabled:cursor-wait"
          >
            {regenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RotateCw className="w-3.5 h-3.5" />
            )}
            Regenerate
          </button>
        </div>
      </div>

      {editing ? (
        <div className="mt-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#131B4D]/15 focus:border-[#131B4D]/40 transition-shadow resize-none"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-3.5 py-1.5 rounded-lg bg-[#131B4D] text-white text-xs font-bold hover:bg-[#1B2666] transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p
          className={`text-sm text-slate-600 leading-relaxed mt-2 transition-opacity duration-200 ${
            regenerating ? "opacity-40" : "opacity-100"
          }`}
        >
          {section.body}
        </p>
      )}
    </div>
  );
}

const CompanyProfile = () => {
  const [companyName, setCompanyName] = useState("SolarTech Nigeria");
  const [industry, setIndustry] = useState("Renewable Energy");
  const [description, setDescription] = useState(
    "We design, install and maintain commercial solar systems for businesses across Nigeria, from site survey through to ongoing servicing.",
  );
  const [logoName, setLogoName] = useState("solartech-logo.svg");
  const [sections, setSections] = useState(INITIAL_PROFILE_SECTIONS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const completeness = [
    companyName,
    industry,
    description,
    logoName,
    ...sections.map((s) => s.body),
  ].filter(Boolean).length;
  const totalFields = 4 + sections.length;
  const pct = Math.round((completeness / totalFields) * 100);

  const updateSection = (id, body) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, body } : s)));
  };

  const handleSaveChanges = () => {
    setSaving(true);
    setSaved(false);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    }, 800);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) setLogoName(file.name);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-blue-600 mb-1">
            The business context Ahiia applies to every document.
          </p>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Company Profile
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Keep your business information up to date so Ahiia can create more
            relevant documents.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSaveChanges}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#131B4D] hover:bg-[#1B2666] active:scale-[0.98] text-white font-bold text-sm shadow-xs transition-all disabled:opacity-70 disabled:cursor-wait shrink-0"
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

      {/* Completeness bar */}
      <div className="bg-white px-5 sm:px-6 py-4 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
        <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
          Profile completeness
        </span>
        <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#3B4CCA] transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-black text-[#131B4D] whitespace-nowrap">
          {pct}%
        </span>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Business information */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-black text-slate-900">
            Business information
          </h3>
          <p className="text-xs text-slate-400 mt-1 mb-5">
            The facts Ahiia references in every document it structures.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Company name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#131B4D]/15 focus:border-[#131B4D]/40 transition-shadow"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Industry
              </label>
              <div className="relative">
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 pr-9 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#131B4D]/15 focus:border-[#131B4D]/40 transition-shadow"
                >
                  {INDUSTRIES.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Company description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#131B4D]/15 focus:border-[#131B4D]/40 transition-shadow resize-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Logo
                </label>
                <span className="text-[11px] text-slate-400">Optional</span>
              </div>
              <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 cursor-pointer transition-colors">
                <input
                  type="file"
                  accept="image/*,.svg"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                {logoName ? (
                  <>
                    <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {logoName}
                      </p>
                      <p className="text-xs text-slate-400">
                        Used on document covers and headers
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                      <UploadCloud className="w-4 h-4" />
                    </span>
                    <p className="text-sm font-semibold text-slate-500">
                      Upload a logo
                    </p>
                  </>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Business profile */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-black text-slate-900">
            Business Profile
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Ahiia can help structure your business information into a clearer
            profile. Nothing changes until you choose it.
          </p>

          <div className="divide-y divide-slate-100 mt-4">
            {sections.map((section) => (
              <ProfileSection
                key={section.id}
                section={section}
                onSave={updateSection}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
