import { DEFAULT_FORM_ID, DEFAULT_PET_ID, HISTORY_DAYS, SCHEMA_VERSION_V1 } from "./constants.js";
import { toNonNegativeInt } from "./helpers.js";

const DATE_KEY = /^\d{8}$/;

export function createDefaultProfile(today) {
  return {
    schemaVersion: SCHEMA_VERSION_V1,
    selectedPetId: DEFAULT_PET_ID,
    selectedFormId: DEFAULT_FORM_ID,
    foodBalance: 0,
    affinity: 0,
    experience: 0,
    lastSettlementDate: today,
    lastSettledSteps: 0,
    dailyActivity: []
  };
}

export function normalizeProfile(value, today) {
  const source = value && typeof value === "object" ? value : {};
  const dailyActivity = Array.isArray(source.dailyActivity)
    ? source.dailyActivity
        .filter((entry) => entry && DATE_KEY.test(entry.date))
        .map((entry) => ({
          date: entry.date,
          settledSteps: toNonNegativeInt(entry.settledSteps),
          earnedFood: toNonNegativeInt(entry.earnedFood)
        }))
        .slice(-HISTORY_DAYS)
    : [];

  return {
    schemaVersion: SCHEMA_VERSION_V1,
    selectedPetId: typeof source.selectedPetId === "string" && source.selectedPetId
      ? source.selectedPetId
      : DEFAULT_PET_ID,
    selectedFormId: typeof source.selectedFormId === "string" && source.selectedFormId
      ? source.selectedFormId
      : DEFAULT_FORM_ID,
    foodBalance: toNonNegativeInt(source.foodBalance),
    affinity: toNonNegativeInt(source.affinity),
    experience: toNonNegativeInt(source.experience),
    lastSettlementDate: DATE_KEY.test(source.lastSettlementDate) ? source.lastSettlementDate : today,
    lastSettledSteps: toNonNegativeInt(source.lastSettledSteps),
    dailyActivity,
    ...(Array.isArray(source.pendingEvolutionChoices)
      ? { pendingEvolutionChoices: source.pendingEvolutionChoices.filter((id) => typeof id === "string" && id) }
      : {})
  };
}
