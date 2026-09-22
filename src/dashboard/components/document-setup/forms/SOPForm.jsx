import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { RequiredSection, TextInput, TextArea } from "../FormField";

export const getCompletedSections = (data) => {
  const done = [];
  if (
    data.processName &&
    data.performer &&
    data.purpose &&
    data.when &&
    data.steps?.some((s) => s.trim())
  ) {
    done.push("theProcess");
  }
  return done;
};

const SOPForm = ({ data, onField }) => {
  const steps = data.steps?.length ? data.steps : [""];

  const updateStep = (index, value) => {
    const next = [...steps];
    next[index] = value;
    onField("steps", next);
  };
  const addStep = () => onField("steps", [...steps, ""]);
  const removeStep = (index) =>
    onField(
      "steps",
      steps.filter((_, i) => i !== index),
    );

  return (
    <RequiredSection title="The process">
      <div className="grid sm:grid-cols-2 gap-4">
        <TextInput
          label="Process name"
          placeholder="Site survey and load assessment"
          value={data.processName || ""}
          onChange={(e) => onField("processName", e.target.value)}
        />
        <TextInput
          label="Who performs this process?"
          placeholder="Field engineering team"
          value={data.performer || ""}
          onChange={(e) => onField("performer", e.target.value)}
        />
      </div>
      <TextArea
        label="What is the purpose of this process?"
        placeholder="What it is meant to achieve and why it matters."
        value={data.purpose || ""}
        onChange={(e) => onField("purpose", e.target.value)}
      />
      <TextArea
        label="When should this process be performed?"
        placeholder="Before every installation quote"
        value={data.when || ""}
        onChange={(e) => onField("when", e.target.value)}
      />
      <TextArea
        label="What tools, materials or information are required?"
        placeholder="Equipment, forms, access, approvals."
        value={data.tools || ""}
        onChange={(e) => onField("tools", e.target.value)}
      />

      <div>
        <p className="text-xs font-bold text-slate-700 mb-1.5">
          Describe the steps involved
        </p>
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="shrink-0 w-6 h-6 rounded-full bg-[#131B4D] text-white text-[11px] font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <input
                value={step}
                onChange={(e) => updateStep(i, e.target.value)}
                placeholder="What happens at this step"
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50/60 text-sm px-3.5 py-2.5 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#131B4D]/15"
              />
              <button
                type="button"
                onClick={() => removeStep(i)}
                className="text-slate-300 hover:text-red-500 transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addStep}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <Plus className="w-3.5 h-3.5" /> Add another step
        </button>
      </div>
    </RequiredSection>
  );
};

export default SOPForm;
