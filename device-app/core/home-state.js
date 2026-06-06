import {
  BABY_TO_TEEN_EXPERIENCE,
  DEFAULT_PET_ID,
  TEEN_TO_MATURE_EXPERIENCE
} from "./constants.js";
import {
  checkSecretTrigger,
  createEmptyCollection,
  getUnlockedForms,
  isFormUnlocked,
  unlockForm
} from "./collection.js";
import { progressEvolution, resolveMatureChoice } from "./evolution.js";
import { applyFormSwitch } from "./form-switch.js";
import { applyPetSwitch, getNextPetId, getPetById } from "./pets.js";

const EMPTY_BUTTON = { label: "", action: "none" };
const DEFAULT_BUTTONS = [
  { label: "FEED", action: "feed" },
  { label: "PET", action: "pet" },
  { label: "PLAY", action: "play" },
  { label: "EVO", action: "evolve" },
  { label: "FORM", action: "form" },
  { label: "NEXT", action: "next" }
];
const RARE_EXPERIENCE_TARGET = 800;
const SECRET_AFFINITY_TARGET = 150;
const SECRET_EXPERIENCE_TARGET = 1000;
const SECRET_PROBABILITY = 0.08;

function normalizeCollections(collections) {
  return Array.isArray(collections) ? collections.filter(Boolean) : [];
}

function upcase(value) {
  return String(value || "").toUpperCase();
}

function experienceThreshold(formId) {
  if (formId === "baby") return BABY_TO_TEEN_EXPERIENCE;
  if (formId === "teen") return TEEN_TO_MATURE_EXPERIENCE;
  return null;
}

function progressText(profile) {
  const threshold = experienceThreshold(profile?.selectedFormId);
  if (!threshold) return "MAX";
  const experience = Math.max(0, Math.floor(Number(profile?.experience) || 0));
  const progress = Math.max(0, Math.min(100, Math.round((experience / threshold) * 100)));
  return `${progress}%`;
}

function branchChoiceButtons(choices) {
  const labels = choices.slice(0, 4).map((choice) => ({
    label: upcase(choice),
    action: `choice:${choice}`
  }));

  while (labels.length < 4) labels.push(EMPTY_BUTTON);
  return [
    ...labels,
    { label: "FORM", action: "form" },
    { label: "NEXT", action: "next" }
  ];
}

function writeCollection(collections, nextCollection) {
  const entries = normalizeCollections(collections);
  const index = entries.findIndex((entry) => entry.petId === nextCollection.petId);
  if (index < 0) return [...entries, nextCollection];
  return entries.map((entry, entryIndex) => (entryIndex === index ? nextCollection : entry));
}

function withCollection(state) {
  const petId = state?.profile?.selectedPetId || DEFAULT_PET_ID;
  const collections = ensureCollectionForPet(state?.collections, petId);
  return {
    ...state,
    collections,
    collection: getCollectionForPet(collections, petId)
  };
}

export function getCollectionForPet(collections, petId = DEFAULT_PET_ID) {
  return normalizeCollections(collections).find((entry) => entry.petId === petId) || null;
}

export function ensureCollectionForPet(collections, petId = DEFAULT_PET_ID) {
  const entries = normalizeCollections(collections);
  if (getCollectionForPet(entries, petId)) return entries;
  return [...entries, createEmptyCollection(petId)];
}

export function createHomeView({ profile, collections }) {
  const selectedPet = getPetById(profile?.selectedPetId);
  const currentForm = profile?.selectedFormId || "baby";
  const pendingChoices = Array.isArray(profile?.pendingEvolutionChoices)
    ? profile.pendingEvolutionChoices
    : [];
  const selectedCollection = getCollectionForPet(
    ensureCollectionForPet(collections, selectedPet.id),
    selectedPet.id
  );
  const unlockedCount = getUnlockedForms(selectedCollection).length;

  return {
    petName: selectedPet.name.toUpperCase(),
    formText: `${upcase(currentForm)} ${progressText(profile)}`,
    growthText: `AFF ${Math.max(0, Math.floor(Number(profile?.affinity) || 0))}  EXP ${Math.max(0, Math.floor(Number(profile?.experience) || 0))}`,
    collectionText: `${unlockedCount} FORMS`,
    buttons: pendingChoices.length > 0 ? branchChoiceButtons(pendingChoices) : DEFAULT_BUTTONS
  };
}

export function applyEvolutionAction(state) {
  const current = withCollection(state);
  const result = progressEvolution(
    current.profile,
    current.collection,
    current.dailyActivity || current.profile?.dailyActivity || [],
    current.scoreOverride
  );
  const collections = writeCollection(current.collections, result.collection);

  if (result.event === "evolved") {
    return {
      profile: result.profile,
      collections,
      message: `Evolved to ${upcase(result.targetFormId)}`
    };
  }

  if (result.event === "choice") {
    return {
      profile: result.profile,
      collections,
      message: `Choose ${result.closeBranches.map(upcase).join(" or ")}`
    };
  }

  return {
    profile: current.profile,
    collections,
    message: "Keep growing for evolution"
  };
}

export function applyChoiceAction(state, choiceFormId) {
  const current = withCollection(state);
  const result = resolveMatureChoice(current.profile, current.collection, choiceFormId);
  const collections = writeCollection(current.collections, result.collection);

  if (result.event === "evolved") {
    return {
      profile: result.profile,
      collections,
      message: `Evolved to ${upcase(result.targetFormId)}`
    };
  }

  return {
    profile: current.profile,
    collections,
    message: "Choose an offered branch"
  };
}

export function applyFormCycleAction(state) {
  const current = withCollection(state);
  const forms = getUnlockedForms(current.collection);
  if (forms.length === 0) {
    unlockForm(current.collection, "baby");
    forms.push("baby");
  }

  const currentIndex = forms.indexOf(current.profile?.selectedFormId);
  const nextFormId = forms[(currentIndex + 1) % forms.length];
  const nextProfile = applyFormSwitch(current.profile, nextFormId, current.collection) || current.profile;

  return {
    profile: nextProfile,
    collections: writeCollection(current.collections, current.collection),
    message: `Form ${upcase(nextProfile.selectedFormId)}`
  };
}

export function applyPetCycleAction(state) {
  const currentProfile = state?.profile || {};
  const nextProfile = applyPetSwitch(currentProfile, getNextPetId(currentProfile.selectedPetId));
  const collections = ensureCollectionForPet(state?.collections, nextProfile.selectedPetId);

  return {
    profile: nextProfile,
    collections,
    message: `Selected ${getPetById(nextProfile.selectedPetId).name}`
  };
}

export function applyMilestoneUnlocks(state, randomValue = Math.random()) {
  const current = withCollection(state);
  let message = state?.message || "";
  const experience = Math.max(0, Math.floor(Number(current.profile?.experience) || 0));
  const affinity = Math.max(0, Math.floor(Number(current.profile?.affinity) || 0));

  current.collection.rareProgress = Math.max(
    Math.max(0, Math.floor(Number(current.collection.rareProgress) || 0)),
    Math.min(100, Math.floor((experience / RARE_EXPERIENCE_TARGET) * 100))
  );

  if (current.collection.rareProgress >= 100 && !isFormUnlocked(current.collection, "rare")) {
    unlockForm(current.collection, "rare");
    message = "Rare form unlocked";
  }

  if (
    isFormUnlocked(current.collection, "rare")
    && affinity >= SECRET_AFFINITY_TARGET
    && experience >= SECRET_EXPERIENCE_TARGET
    && checkSecretTrigger(current.collection, "secret", SECRET_PROBABILITY, randomValue)
  ) {
    message = "Secret form found";
  }

  return {
    profile: current.profile,
    collections: writeCollection(current.collections, current.collection),
    message
  };
}
