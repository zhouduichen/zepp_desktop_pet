import { getUnlockedForms, isFormUnlocked } from "./collection.js";

function isNonEmptyString(value) {
  return typeof value === "string" && value.length > 0;
}

export function canSelectForm(collection, formId) {
  return isNonEmptyString(formId) && isFormUnlocked(collection, formId);
}

export function getSelectableForms(collection) {
  return getUnlockedForms(collection);
}

export function applyFormSwitch(profile, newFormId, collection) {
  if (!canSelectForm(collection, newFormId)) return null;
  return {
    ...(profile || {}),
    selectedFormId: newFormId
  };
}
