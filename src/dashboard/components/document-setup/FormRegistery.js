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
  proposal: {
    Form: BusinessProposalForm,
    getCompletedSections: businessProposalCompleted,
  },
  "pitch-deck": {
    Form: PitchDeckForm,
    getCompletedSections: pitchDeckCompleted,
  },
  pitchdeck: {
    Form: PitchDeckForm,
    getCompletedSections: pitchDeckCompleted,
  },
  sop: { Form: SOPForm, getCompletedSections: sopCompleted },
  contract: { Form: ContractForm, getCompletedSections: contractCompleted },
  "marketing-plan": {
    Form: MarketingPlanForm,
    getCompletedSections: marketingPlanCompleted,
  },
  marketingplan: {
    Form: MarketingPlanForm,
    getCompletedSections: marketingPlanCompleted,
  },
  "business-plan": {
    Form: BusinessPlanForm,
    getCompletedSections: businessPlanCompleted,
  },
  businessplan: {
    Form: BusinessPlanForm,
    getCompletedSections: businessPlanCompleted,
  },
};

export const getFormRegistryEntry = (id) => {
  if (!id) return undefined;
  if (FORM_REGISTRY[id]) return FORM_REGISTRY[id];
  const normalized = String(id).toLowerCase().replace(/_/g, "-");
  return FORM_REGISTRY[normalized];
};
