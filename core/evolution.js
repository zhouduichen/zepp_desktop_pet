import {
  BABY_TO_TEEN_EXPERIENCE,
  TEEN_TO_MATURE_EXPERIENCE
} from "../device-app/core/constants.js";
import { unlockForm } from "./collection.js";
import { computeScores, pickMatureBranch } from "./scoring.js";

const MATURE_BRANCH_IDS = ["active", "steady", "explorer"];

function toNonNegativeInt(value) {
  return Math.max(0, Math.floor(Number(value) || 0));
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function progressFor(experience, threshold) {
  if (threshold <= 0) return 100;
  return clampPercent((toNonNegativeInt(experience) / threshold) * 100);
}

function copyProfile(profile, updates = {}) {
  return {
    ...(profile || {}),
    ...updates
  };
}

function withoutPendingChoices(profile) {
  const nextProfile = { ...(profile || {}) };
  delete nextProfile.pendingEvolutionChoices;
  return nextProfile;
}

function matureBranchFor(dailyActivity, scoreOverride) {
  const scores = scoreOverride || computeScores(dailyActivity);
  return pickMatureBranch(scores);
}

export function getEvolutionStatus(profile, dailyActivity = [], scoreOverride) {
  const currentFormId = profile?.selectedFormId || "baby";
  const experience = toNonNegativeInt(profile?.experience);

  if (currentFormId === "baby") {
    return {
      currentFormId,
      nextFormId: "teen",
      ready: experience >= BABY_TO_TEEN_EXPERIENCE,
      progress: progressFor(experience, BABY_TO_TEEN_EXPERIENCE),
      tiebreaker: false,
      closeBranches: []
    };
  }

  if (currentFormId === "teen") {
    const ready = experience >= TEEN_TO_MATURE_EXPERIENCE;
    const branch = ready
      ? matureBranchFor(dailyActivity, scoreOverride)
      : { chosen: "mature", tiebreaker: false, closeBranches: [] };

    return {
      currentFormId,
      nextFormId: branch.chosen,
      ready,
      progress: progressFor(experience, TEEN_TO_MATURE_EXPERIENCE),
      tiebreaker: ready && branch.tiebreaker,
      closeBranches: ready && branch.tiebreaker ? branch.closeBranches : []
    };
  }

  return {
    currentFormId,
    nextFormId: null,
    ready: false,
    progress: 100,
    tiebreaker: false,
    closeBranches: []
  };
}

export function progressEvolution(profile, collection, dailyActivity = [], scoreOverride) {
  const status = getEvolutionStatus(profile, dailyActivity, scoreOverride);
  if (!status.ready) {
    return {
      event: "none",
      status,
      profile,
      collection
    };
  }

  if (status.currentFormId === "baby") {
    const nextProfile = withoutPendingChoices(copyProfile(profile, { selectedFormId: "teen" }));
    unlockForm(collection, "teen");
    return {
      event: "evolved",
      targetFormId: "teen",
      status,
      profile: nextProfile,
      collection
    };
  }

  if (status.currentFormId === "teen" && status.tiebreaker) {
    return {
      event: "choice",
      closeBranches: status.closeBranches,
      status,
      profile: copyProfile(profile, { pendingEvolutionChoices: status.closeBranches }),
      collection
    };
  }

  if (status.currentFormId === "teen" && MATURE_BRANCH_IDS.includes(status.nextFormId)) {
    const nextProfile = withoutPendingChoices(copyProfile(profile, { selectedFormId: status.nextFormId }));
    unlockForm(collection, status.nextFormId);
    return {
      event: "evolved",
      targetFormId: status.nextFormId,
      status,
      profile: nextProfile,
      collection
    };
  }

  return {
    event: "none",
    status,
    profile,
    collection
  };
}

export function resolveMatureChoice(profile, collection, chosenFormId) {
  const pendingChoices = Array.isArray(profile?.pendingEvolutionChoices)
    ? profile.pendingEvolutionChoices
    : [];

  if (!pendingChoices.includes(chosenFormId)) {
    return {
      event: "invalid-choice",
      profile,
      collection
    };
  }

  const nextProfile = withoutPendingChoices(copyProfile(profile, { selectedFormId: chosenFormId }));
  unlockForm(collection, chosenFormId);

  return {
    event: "evolved",
    targetFormId: chosenFormId,
    profile: nextProfile,
    collection
  };
}
