import BusinessProposalForm, {
  getCompletedSections as businessProposalCompleted,
} from "./forms/BusinessProposalForm";
import PitchDeckForm, {
  getCompletedSections as pitchDeckCompleted,
} from "./forms/PitchDeckForm";
import SOPForm, { getCompletedSections as sopCompleted } from "./forms/SOPForm";
import ContractForm, {
  getCompletedSections as contractCompleted,
} from "./forms/ContractForm";
import MarketingPlanForm, {
  getCompletedSections as marketingPlanCompleted,
} from "./forms/MarketingPlanForm";
import BusinessPlanForm, {
  getCompletedSections as businessPlanCompleted,
} from "./forms/BusinessPlanForm";

export const FORM_REGISTRY = {
  "business-proposal": {
    Form: BusinessProposalForm,
    getCompletedSections: businessProposalCompleted,
  },
  "pitch-deck": {
    Form: PitchDeckForm,
    getCompletedSections: pitchDeckCompleted,
  },
  sop: { Form: SOPForm, getCompletedSections: sopCompleted },
  contract: { Form: ContractForm, getCompletedSections: contractCompleted },
  "marketing-plan": {
    Form: MarketingPlanForm,
    getCompletedSections: marketingPlanCompleted,
  },
  "business-plan": {
    Form: BusinessPlanForm,
    getCompletedSections: businessPlanCompleted,
  },
};
