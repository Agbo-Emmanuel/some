import React from "react";
import { RequiredSection, TextInput, TextArea } from "../FormField";

export const getCompletedSections = (data) => {
  const done = [];
  if (data.partyName && data.partyDetails) done.push("otherParty");
  if (
    data.agreementAbout &&
    data.provide &&
    data.otherProvide &&
    data.startDate &&
    data.endDate
  ) {
    done.push("theAgreement");
  }
  return done;
};

const ContractForm = ({ data, onField }) => (
  <>
    <RequiredSection
      title="Other party"
      description="Who this contract is with."
    >
      <TextInput
        label="Client / party name"
        placeholder="Lagos Foods Ltd"
        value={data.partyName || ""}
        onChange={(e) => onField("partyName", e.target.value)}
      />
      <TextArea
        label="Client / party details"
        placeholder="Registered address, contact person, registration number"
        value={data.partyDetails || ""}
        onChange={(e) => onField("partyDetails", e.target.value)}
      />
    </RequiredSection>

    <RequiredSection
      title="The agreement"
      description="Ahiia flags missing or risky clauses in Guidance after generation — you do not need to know every clause up front."
    >
      <TextInput
        label="What is this agreement about?"
        placeholder="The work or relationship"
        value={data.agreementAbout || ""}
        onChange={(e) => onField("agreementAbout", e.target.value)}
      />
      <TextArea
        label="What will you provide?"
        placeholder="Your obligations."
        value={data.provide || ""}
        onChange={(e) => onField("provide", e.target.value)}
      />
      <TextArea
        label="What will the other party provide or do?"
        placeholder="Their obligations."
        value={data.otherProvide || ""}
        onChange={(e) => onField("otherProvide", e.target.value)}
      />
      <div className="grid sm:grid-cols-2 gap-4">
        <TextInput
          label="Agreed payment"
          prefix="₦"
          placeholder="50,000,000"
          value={data.payment || ""}
          onChange={(e) => onField("payment", e.target.value)}
        />
        <TextInput
          label="Payment structure"
          placeholder="40% on signing, 40% on delivery, 20% on handover"
          value={data.paymentStructure || ""}
          onChange={(e) => onField("paymentStructure", e.target.value)}
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <TextInput
          label="Start date"
          type="date"
          value={data.startDate || ""}
          onChange={(e) => onField("startDate", e.target.value)}
        />
        <TextInput
          label="End date"
          type="date"
          value={data.endDate || ""}
          onChange={(e) => onField("endDate", e.target.value)}
        />
      </div>
      <TextArea
        label="How can either party terminate the agreement?"
        placeholder="Notice period and conditions."
        value={data.termination || ""}
        onChange={(e) => onField("termination", e.target.value)}
      />
    </RequiredSection>
  </>
);

export default ContractForm;
