import React, { useMemo, useState } from "react";
import {
  CheckCircle2,
  UploadCloud,
  ChevronDown,
  Plus,
  Trash2,
  Loader2,
  Check,
} from "lucide-react";

const FONTS = ["Montserrat", "Inter", "Poppins", "Lora", "Source Sans Pro"];
const PLATFORMS = [
  "Instagram",
  "LinkedIn",
  "X (Twitter)",
  "Facebook",
  "TikTok",
];

const SWATCHES = [
  "#2563EB",
  "#131B4D",
  "#0EA5E9",
  "#7C3AED",
  "#0F766E",
  "#10B981",
  "#0F172A",
  "#EF4444",
];

const initials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const BrandKit = () => {
  const companyName = "SolarTech Nigeria";

  const [logoName, setLogoName] = useState("solartech-logo.svg");
  const [primaryColor, setPrimaryColor] = useState("#2563EB");
  const [secondaryColor, setSecondaryColor] = useState("#131C52");
  const [font, setFont] = useState("Montserrat");
  const [tagline, setTagline] = useState("Clean power, built to last");
  const [socialLinks, setSocialLinks] = useState([
    { platform: "LinkedIn", url: "https://linkedin.com/company/solartech-ng" },
  ]);

  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const markDirty = () => {
    if (!dirty) setDirty(true);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoName(file.name);
      markDirty();
    }
  };

  const handleAddSocial = () => {
    setSocialLinks((prev) => [...prev, { platform: "Instagram", url: "" }]);
    markDirty();
  };

  const handleRemoveSocial = (idx) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== idx));
    markDirty();
  };

  const handleSocialChange = (idx, field, value) => {
    setSocialLinks((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
    );
    markDirty();
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setDirty(false);
    }, 800);
  };

  const previewInitials = useMemo(() => initials(companyName), [companyName]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-blue-600 mb-1">
            The identity Ahiia applies to your documents.
          </p>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Brand Kit
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Keep your brand consistent across the documents you create with
            Ahiia.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !dirty}
          className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-xs transition-all shrink-0 ${
            dirty && !saving
              ? "bg-[#131B4D] hover:bg-[#1B2666] active:scale-[0.98] text-white cursor-pointer"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>

      {/* Unsaved changes bar */}
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

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Brand identity */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-black text-slate-900">
              Brand identity
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Set your brand once. Ahiia applies it across your documents.
            </p>
          </div>

          {/* Logo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Logo
            </label>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/60">
              <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {logoName}
                </p>
                <p className="text-xs text-slate-400">SVG or PNG, up to 2 MB</p>
              </div>
              <label className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer shrink-0">
                Replace
                <input
                  type="file"
                  accept="image/*,.svg"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </label>
            </div>
          </div>

          {/* Brand colours */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Brand colours
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              {SWATCHES.map((color) => {
                const isSelected =
                  color === primaryColor || color === secondaryColor;
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      setPrimaryColor(color);
                      markDirty();
                    }}
                    aria-label={color}
                    className="relative w-7 h-7 rounded-full ring-1 ring-inset ring-black/5 transition-transform hover:scale-110"
                    style={{ backgroundColor: color }}
                  >
                    {isSelected && (
                      <Check
                        className="w-3.5 h-3.5 text-white absolute inset-0 m-auto drop-shadow"
                        strokeWidth={3}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-slate-200">
                <label className="relative w-8 h-8 rounded-lg shrink-0 cursor-pointer overflow-hidden ring-1 ring-inset ring-black/5">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => {
                      setSecondaryColor(e.target.value);
                      markDirty();
                    }}
                    className="absolute -inset-2 cursor-pointer"
                  />
                </label>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-500">
                    Secondary color
                  </p>
                  <p className="text-xs font-mono text-slate-700 uppercase truncate">
                    {secondaryColor}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-slate-200">
                <label className="relative w-8 h-8 rounded-lg shrink-0 cursor-pointer overflow-hidden ring-1 ring-inset ring-black/5">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => {
                      setPrimaryColor(e.target.value);
                      markDirty();
                    }}
                    className="absolute -inset-2 cursor-pointer"
                  />
                </label>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-500">
                    Primary color
                  </p>
                  <p className="text-xs font-mono text-slate-700 uppercase truncate">
                    {primaryColor}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Font + Tagline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Font
              </label>
              <div className="relative">
                <select
                  value={font}
                  onChange={(e) => {
                    setFont(e.target.value);
                    markDirty();
                  }}
                  className="w-full appearance-none px-3.5 py-2.5 pr-9 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#131B4D]/15 focus:border-[#131B4D]/40 transition-shadow"
                >
                  {FONTS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => {
                  setTagline(e.target.value);
                  markDirty();
                }}
                placeholder="e.g. Clean power, built to last"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#131B4D]/15 focus:border-[#131B4D]/40 transition-shadow"
              />
            </div>
          </div>

          {/* Social links */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Social links
              </label>
              <span className="text-[11px] text-slate-400">Optional</span>
            </div>

            <div className="space-y-2.5">
              {socialLinks.map((link, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="relative shrink-0 w-32 sm:w-36">
                    <select
                      value={link.platform}
                      onChange={(e) =>
                        handleSocialChange(idx, "platform", e.target.value)
                      }
                      className="w-full appearance-none px-3 py-2.5 pr-7 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#131B4D]/15 focus:border-[#131B4D]/40 transition-shadow"
                    >
                      {PLATFORMS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) =>
                      handleSocialChange(idx, "url", e.target.value)
                    }
                    placeholder="https://"
                    className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#131B4D]/15 focus:border-[#131B4D]/40 transition-shadow"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSocial(idx)}
                    aria-label="Remove social link"
                    className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddSocial}
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add social link
            </button>
          </div>
        </div>

        {/* Document preview */}
        <div className="lg:col-span-3">
          <p className="text-xs font-bold text-slate-400 mb-2 px-1">
            Document preview
          </p>
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Preview header */}
            <div
              className="px-6 py-5 flex items-center gap-3 transition-colors duration-300"
              style={{ backgroundColor: secondaryColor }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0 transition-colors duration-300"
                style={{ backgroundColor: primaryColor }}
              >
                {previewInitials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {companyName}
                </p>
                <p className="text-xs text-white/70 truncate">
                  {tagline || "Your tagline appears here"}
                </p>
              </div>
            </div>

            {/* Preview body */}
            <div className="p-6">
              <p
                className="text-xs font-bold uppercase tracking-wide transition-colors duration-300"
                style={{ color: primaryColor }}
              >
                Proposal
              </p>
              <h4
                className="text-lg font-black text-slate-900 mt-1"
                style={{ fontFamily: font }}
              >
                Solar Installation Project
              </h4>

              <p className="text-xs font-bold text-slate-800 mt-4">
                Executive summary
              </p>
              <p className="text-xs text-slate-500 leading-relaxed mt-1.5">
                A phased rollout of rooftop solar across three facilities, sized
                to daily load and commissioned in under six weeks.
              </p>

              <div className="space-y-1.5 mt-4">
                <div className="h-1.5 w-full rounded-full bg-slate-100" />
                <div className="h-1.5 w-4/5 rounded-full bg-slate-100" />
              </div>

              <div
                className="mt-5 rounded-xl px-4 py-3 transition-colors duration-300"
                style={{ backgroundColor: `${primaryColor}14` }}
              >
                <p className="text-[11px] font-bold text-slate-500">
                  Total project value
                </p>
                <p className="text-sm font-black text-slate-900 mt-0.5">
                  ₦50,000,000
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 mt-5">
                <button
                  type="button"
                  className="flex-1 py-2.5 rounded-xl text-white text-xs font-bold transition-colors duration-300"
                  style={{ backgroundColor: primaryColor }}
                >
                  Accept proposal
                </button>
                <button
                  type="button"
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Request changes
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 px-1 leading-relaxed">
            Updates as you change your logo, colours, font and tagline. Applied
            to covers, headings, callouts and buttons.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BrandKit;
