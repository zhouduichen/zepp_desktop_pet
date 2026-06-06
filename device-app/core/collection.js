import { DEFAULT_PET_ID } from "./constants.js";

function nonEmptyString(value) {
  return typeof value === "string" && value.length > 0;
}

function toNonNegativeInt(value) {
  return Math.max(0, Math.floor(Number(value) || 0));
}

function asCollectionList(value) {
  return Array.isArray(value) ? value : [value].filter(Boolean);
}

export function createEmptyCollection(petId = DEFAULT_PET_ID) {
  return {
    petId: nonEmptyString(petId) ? petId : DEFAULT_PET_ID,
    unlockedFormIds: ["baby"],
    rareProgress: 0,
    secretTriggerFlags: 0
  };
}

export function unlockForm(collection, formId) {
  if (!collection || !nonEmptyString(formId)) return collection;
  if (!Array.isArray(collection.unlockedFormIds)) collection.unlockedFormIds = ["baby"];
  if (!collection.unlockedFormIds.includes(formId)) collection.unlockedFormIds.push(formId);
  return collection;
}

export function isFormUnlocked(collection, formId) {
  return Boolean(collection?.unlockedFormIds?.includes(formId));
}

export function getUnlockedForms(collection) {
  if (!Array.isArray(collection?.unlockedFormIds)) return [];
  return [...collection.unlockedFormIds];
}

export function updateRareProgress(collection, amount) {
  if (!collection) return collection;
  collection.rareProgress = toNonNegativeInt(collection.rareProgress) + toNonNegativeInt(amount);
  return collection;
}

export function checkRareUnlock(collection, formId = "rare", threshold = 100) {
  if (!collection || toNonNegativeInt(collection.rareProgress) < toNonNegativeInt(threshold)) return false;
  unlockForm(collection, formId);
  return true;
}

export function checkSecretTrigger(collection, formId = "secret", probability = 0, randomValue = Math.random()) {
  if (!collection || isFormUnlocked(collection, formId)) return false;

  const chance = Math.max(0, Math.min(1, Number(probability) || 0));
  const roll = Math.max(0, Math.min(1, Number(randomValue) || 0));
  if (roll >= chance) return false;

  unlockForm(collection, formId);
  collection.secretTriggerFlags = toNonNegativeInt(collection.secretTriggerFlags) | 1;
  return true;
}

export function getCollectionStats(collections) {
  const entries = asCollectionList(collections);
  return {
    petCount: entries.length,
    unlockedFormCount: entries.reduce((total, collection) => total + getUnlockedForms(collection).length, 0)
  };
}
