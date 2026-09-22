import React from "react";
import { RequiredSection, TextArea, ChipGroup } from "../FormField";

const GOALS = [
  "Raise funding",
  "Attract customers",
  "Find partners",
  "Internal presentation",
  "Other",
];

export const getCompletedSections = (data) => {
  const done = [];
  if (data.purpose && data.problem) done.push("documentBrief");
  return done;
};

const PitchDeckForm = ({ data, onField }) => (
  <RequiredSection
    title="Document brief"
    description="What is the main purpose of this pitch?"
  >
    <ChipGroup
      options={GOALS}
      value={data.purpose}
      onChange={(v) => onField("purpose", v)}
    />
    <TextArea
      label="What problem are you solving?"
      hint="Tell Ahiia what you want this pitch deck to accomplish"
      placeholder="The problem your audience will recognise."
      value={data.problem || ""}
      onChange={(e) => onField("problem", e.target.value)}
    />
    <TextArea
      label="What are you asking for?"
      hint="funding amount / use if applicable"
      placeholder="Example: Seeking ₦50M to expand solar installation operations across Southwest Nigeria."
      value={data.ask || ""}
      onChange={(e) => onField("ask", e.target.value)}
    />
  </RequiredSection>
);

export default PitchDeckForm;
