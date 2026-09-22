import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { RequiredSection, TextInput, TextArea } from "../FormField";

// Which fields must be filled for each required section's checklist dot
export const getCompletedSections = (data) => {
  const done = [];
  if (data.clientName && data.clientNeed) done.push("executiveSummary");
  if (data.projectService && data.proposedSolution) done.push("scopeOfWork");
  if (data.items?.some((i) => i.item && i.amount)) done.push("pricing");
  if (data.projectDuration) done.push("timeline");
  return done;
};

const emptyItem = () => ({ item: "", description: "", amount: "" });

const BusinessProposalForm = ({ data, onField }) => {
  const items = data.items?.length
    ? data.items
    : [emptyItem(), emptyItem(), emptyItem()];

  const updateItem = (index, key, value) => {
    const next = [...items];
    next[index] = { ...next[index], [key]: value };
    onField("items", next);
  };

  const addItem = () => onField("items", [...items, emptyItem()]);
  const removeItem = (index) =>
    onField(
      "items",
      items.filter((_, i) => i !== index),
    );

  const total = items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  return (
    <>
      <RequiredSection
        title="Executive Summary"
        description="Who is this proposal for and what they need."
      >
        <TextInput
          label="Client / company name"
          placeholder="Lagos Foods Ltd"
          value={data.clientName || ""}
          onChange={(e) => onField("clientName", e.target.value)}
        />
        <TextArea
          label="Client need or problem"
          placeholder="What they are trying to solve."
          value={data.clientNeed || ""}
          onChange={(e) => onField("clientNeed", e.target.value)}
        />
      </RequiredSection>

      <RequiredSection
        title="Scope of Work"
        description="What you are proposing."
      >
        <TextInput
          label="Project or service being proposed"
          placeholder="100kW rooftop solar installation"
          value={data.projectService || ""}
          onChange={(e) => onField("projectService", e.target.value)}
        />
        <TextArea
          label="Proposed solution"
          placeholder="How you will solve it."
          value={data.proposedSolution || ""}
          onChange={(e) => onField("proposedSolution", e.target.value)}
        />
      </RequiredSection>

      <RequiredSection
        title="Pricing"
        description="Provide the cost breakdown for the proposed work."
      >
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="text-left text-[11px] font-bold text-slate-400">
                <th className="pb-2 px-1 font-bold">Item / Service</th>
                <th className="pb-2 px-1 font-bold">Description</th>
                <th className="pb-2 px-1 font-bold">Amount</th>
                <th className="pb-2 px-1 w-8" />
              </tr>
            </thead>
            <tbody>
              {items.map((row, i) => (
                <tr key={i}>
                  <td className="px-1 py-1.5">
                    <input
                      value={row.item}
                      onChange={(e) => updateItem(i, "item", e.target.value)}
                      placeholder="Item or service"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/60 text-sm px-3 py-2 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#131B4D]/15"
                    />
                  </td>
                  <td className="px-1 py-1.5">
                    <input
                      value={row.description}
                      onChange={(e) =>
                        updateItem(i, "description", e.target.value)
                      }
                      placeholder="Short description"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/60 text-sm px-3 py-2 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#131B4D]/15"
                    />
                  </td>
                  <td className="px-1 py-1.5">
                    <input
                      type="number"
                      value={row.amount}
                      onChange={(e) => updateItem(i, "amount", e.target.value)}
                      placeholder="0"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/60 text-sm px-3 py-2 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#131B4D]/15"
                    />
                  </td>
                  <td className="px-1 py-1.5 text-center">
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            <Plus className="w-3.5 h-3.5" /> Add item
          </button>
          <div className="text-right">
            <p className="text-[11px] font-bold text-slate-400">Total</p>
            <p className="text-base font-black text-slate-900">
              ₦{total.toLocaleString()}
            </p>
          </div>
        </div>
      </RequiredSection>

      <RequiredSection
        title="Timeline"
        description="Provide the expected delivery schedule for the project."
      >
        <TextInput
          label="Project duration"
          placeholder="e.g. 12 weeks"
          value={data.projectDuration || ""}
          onChange={(e) => onField("projectDuration", e.target.value)}
        />
        <div>
          <p className="text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
            Milestones{" "}
            <span className="text-[11px] font-medium text-slate-400">
              Optional
            </span>
          </p>
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-400">
            No milestones yet. Ahiia will build a schedule from the duration
            alone.
          </div>
          <button
            type="button"
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            <Plus className="w-3.5 h-3.5" /> Add milestone
          </button>
        </div>
      </RequiredSection>
    </>
  );
};

export default BusinessProposalForm;
