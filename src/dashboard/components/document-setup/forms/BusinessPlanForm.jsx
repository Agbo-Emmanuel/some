import React from "react";
import { RequiredSection, TextInput, TextArea, ChipGroup } from "../FormField";

const BRIEF_OPTIONS = [
  "Starting a new venture",
  "Growing the business",
  "Seeking funding",
  "Strategic planning",
  "Launching a new product or service",
  "Entering a new market",
  "Other",
];

export const getCompletedSections = (data) => {
  const done = [];
  if (data.briefType && data.goal) done.push("documentBrief");
  if (data.otherFinancial || data.revenueTarget || data.fundingRequired) {
    done.push("financialInformation");
  }
  return done;
};

const BusinessPlanForm = ({ data, onField }) => (
  <>
    <RequiredSection
      title="Document brief"
      description="What is the business plan for?"
    >
      <ChipGroup
        options={BRIEF_OPTIONS}
        value={data.briefType}
        onChange={(v) => onField("briefType", v)}
      />
      <TextArea
        label="What are you trying to achieve?"
        hint="Tell Ahiia what you want this plan to accomplish"
        placeholder="Example: We are seeking ₦50M in funding to expand our solar installation operations."
        value={data.goal || ""}
        onChange={(e) => onField("goal", e.target.value)}
      />
    </RequiredSection>

    <RequiredSection
      title="Financial information"
      description="Only what you already know. Ahiia will not invent figures."
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <TextInput
          label="Revenue target"
          hint="Optional"
          prefix="₦"
          placeholder="0"
          value={data.revenueTarget || ""}
          onChange={(e) => onField("revenueTarget", e.target.value)}
        />
        <TextInput
          label="Funding required"
          hint="Optional"
          prefix="₦"
          placeholder="0"
          value={data.fundingRequired || ""}
          onChange={(e) => onField("fundingRequired", e.target.value)}
        />
      </div>
      <TextArea
        label="Other financial information"
        hint="Optional"
        placeholder="Current investment, major expenses, margins you already track."
        value={data.otherFinancial || ""}
        onChange={(e) => onField("otherFinancial", e.target.value)}
      />
    </RequiredSection>
  </>
);

export default BusinessPlanForm;
