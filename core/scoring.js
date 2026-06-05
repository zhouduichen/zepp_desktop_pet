import {
  CLOSE_SCORE_THRESHOLD,
  SCORING_WINDOW_DAYS
} from "../device-app/core/constants.js";

const DAILY_STEP_TARGET = 5000;
const ACTIVE_FULL_SCORE_STEPS = 70000;
const EXPLORER_HIGH_STEP_THRESHOLD = 8000;

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function toStepDay(entry) {
  return {
    settledSteps: Math.max(0, Math.floor(Number(entry?.settledSteps) || 0))
  };
}

function latestDays(dailyActivity) {
  if (!Array.isArray(dailyActivity)) return [];
  return dailyActivity.slice(-SCORING_WINDOW_DAYS).map(toStepDay);
}

function mean(values) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function standardDeviation(values) {
  if (values.length === 0) return 0;
  const average = mean(values);
  const variance = mean(values.map((value) => (value - average) ** 2));
  return Math.sqrt(variance);
}

function scoreActive(days) {
  const total = days.reduce((sum, day) => sum + day.settledSteps, 0);
  return clampScore((total / ACTIVE_FULL_SCORE_STEPS) * 100);
}

function scoreSteady(days) {
  if (days.length === 0) return 0;

  const steps = days.map((day) => day.settledSteps);
  const daysAtTarget = steps.filter((value) => value >= DAILY_STEP_TARGET).length;
  const completionScore = (daysAtTarget / SCORING_WINDOW_DAYS) * 70;
  const average = mean(steps);
  const deviation = standardDeviation(steps);
  const consistencyRatio = average > 0 ? Math.max(0, 1 - deviation / average) : 0;

  return clampScore(completionScore + consistencyRatio * 30);
}

function scoreExplorer(days) {
  if (days.length === 0) return 0;

  const steps = days.map((day) => day.settledSteps);
  const activeDays = steps.filter((value) => value > 0).length;
  const lowActiveDays = steps.filter((value) => value > 0 && value < DAILY_STEP_TARGET).length;
  const highDays = steps.filter((value) => value >= EXPLORER_HIGH_STEP_THRESHOLD).length;
  const breadthScore = (activeDays / SCORING_WINDOW_DAYS) * 45;
  const varietyScore = Math.min(30, (lowActiveDays + highDays) * 5);
  const range = Math.max(...steps, 0) - Math.min(...steps);
  const rangeScore = Math.min(25, range / 400);

  return clampScore(breadthScore + varietyScore + rangeScore);
}

export function computeScores(dailyActivity) {
  const days = latestDays(dailyActivity);
  if (days.length === 0) return { active: 0, steady: 0, explorer: 0 };

  return {
    active: scoreActive(days),
    steady: scoreSteady(days),
    explorer: scoreExplorer(days)
  };
}

export function pickMatureBranch(scores) {
  const normalized = {
    active: Math.max(0, Math.floor(Number(scores?.active) || 0)),
    steady: Math.max(0, Math.floor(Number(scores?.steady) || 0)),
    explorer: Math.max(0, Math.floor(Number(scores?.explorer) || 0))
  };
  const hasAnyScore = Object.values(normalized).some((score) => score > 0);

  if (!hasAnyScore) {
    return {
      chosen: "steady",
      tiebreaker: false,
      closeBranches: ["steady"]
    };
  }

  const sorted = Object.entries(normalized).sort((left, right) => {
    const scoreDifference = right[1] - left[1];
    if (scoreDifference !== 0) return scoreDifference;
    return ["active", "steady", "explorer"].indexOf(left[0]) - ["active", "steady", "explorer"].indexOf(right[0]);
  });
  const [chosen, topScore] = sorted[0];
  const closeBranches = sorted
    .filter(([, score]) => topScore - score <= CLOSE_SCORE_THRESHOLD)
    .map(([branch]) => branch);

  return {
    chosen,
    tiebreaker: closeBranches.length > 1,
    closeBranches
  };
}
