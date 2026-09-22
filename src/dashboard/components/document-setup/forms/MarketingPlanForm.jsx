import React from "react";
import { Sparkles, Check } from "lucide-react";
import { RequiredSection, TextInput, ChipGroup } from "../FormField";

const GOALS = [
  "Increase awareness",
  "Generate leads",
  "Increase sales",
  "Launch a product",
  "Enter a new market",
  "Other",
];
const CHANNELS = [
  "Social Media",
  "Email",
  "Search",
  "Events",
  "Partnerships",
  "Advertising",
  "Other",
];

// The suggested audience Ahiia derives from the Company Profile / brand kit
const SUGGESTED_AUDIENCE =
  "Mid-sized manufacturers, agro-processors and commercial landlords in South-West Nigeria running on diesel backup.";

export const getCompletedSections = (data) => {
  const done = [];
  const hasAudience =
    data.audienceMode === "existing" ||
    (data.audienceMode === "custom" && data.customAudience?.trim());
  if (data.product && data.campaignDuration && hasAudience) {
    done.push("whatYouAreMarketing");
  }
  return done;
};

const MarketingPlanForm = ({ data, onField }) => {
  const audienceMode = data.audienceMode || "existing";
  const channels = data.channels || [];

  const toggleChannel = (channel) => {
    const next = channels.includes(channel)
      ? channels.filter((c) => c !== channel)
      : [...channels, channel];
    onField("channels", next);
  };

  return (
    <RequiredSection title="What you are marketing">
      <div className="grid sm:grid-cols-2 gap-4">
        <TextInput
          label="Product, service or campaign"
          placeholder="Commercial solar maintenance contracts"
          value={data.product || ""}
          onChange={(e) => onField("product", e.target.value)}
        />
        <TextInput
          label="Campaign duration or timeframe"
          placeholder="Q1 2026, 12 weeks"
          value={data.campaignDuration || ""}
          onChange={(e) => onField("campaignDuration", e.target.value)}
        />
      </div>

      <div>
        <p className="text-xs font-bold text-slate-700 mb-1.5">
          What is the main marketing goal?
        </p>
        <ChipGroup
          options={GOALS}
          value={data.goal}
          onChange={(v) => onField("goal", v)}
        />
      </div>

      {/* Audience: pick the AI-suggested audience, or switch to a custom one */}
      <div>
        <p className="text-xs font-bold text-slate-700 mb-1.5">
          Who are you trying to reach?
        </p>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => onField("audienceMode", "existing")}
            className={`w-full text-left flex items-start gap-3 rounded-2xl border px-4 py-3.5 transition-colors ${
              audienceMode === "existing"
                ? "border-[#131B4D] bg-[#131B4D]/[0.04]"
                : "border-slate-200 bg-white"
            }`}
          >
            <span
              className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                audienceMode === "existing"
                  ? "bg-[#131B4D] border-[#131B4D]"
                  : "border-slate-300"
              }`}
            >
              {audienceMode === "existing" && (
                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
              )}
            </span>
            <span>
              <span className="text-sm font-bold text-slate-900 inline-flex items-center gap-1">
                Use existing audience{" "}
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                {SUGGESTED_AUDIENCE}
              </p>
            </span>
          </button>

          <button
            type="button"
            onClick={() => onField("audienceMode", "custom")}
            className={`w-full text-left flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-colors ${
              audienceMode === "custom"
                ? "border-[#131B4D] bg-[#131B4D]/[0.04]"
                : "border-slate-200 bg-white"
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                audienceMode === "custom"
                  ? "bg-[#131B4D] border-[#131B4D]"
                  : "border-slate-300"
              }`}
            >
              {audienceMode === "custom" && (
                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
              )}
            </span>
            <span className="text-sm font-bold text-slate-900">
              Add or modify audience
            </span>
          </button>

          {/* Typing box only appears once "Add or modify audience" is selected */}
          {audienceMode === "custom" && (
            <textarea
              rows={3}
              autoFocus
              placeholder="Describe who you want to reach."
              value={data.customAudience || ""}
              onChange={(e) => onField("customAudience", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 text-sm px-3.5 py-2.5 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#131B4D]/15 focus:border-[#131B4D] transition-colors resize-none"
            />
          )}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-slate-700 mb-1.5">
          Which channels do you want to use?
        </p>
        <div className="flex flex-wrap gap-2">
          {CHANNELS.map((c) => {
            const active = channels.includes(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggleChannel(c)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                  active
                    ? "border-[#131B4D] bg-[#131B4D] text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <TextInput
        label="Marketing budget"
        hint="Optional"
        prefix="₦"
        placeholder="0"
        value={data.budget || ""}
        onChange={(e) => onField("budget", e.target.value)}
      />
    </RequiredSection>
  );
};

export default MarketingPlanForm;
