import { DAILY_FOOD_CAP, FOOD_PER_STEPS, HISTORY_DAYS } from "./constants.js";
import { normalizeProfile } from "./profile.js";
import { toNonNegativeInt } from "./helpers.js";

export function settleSteps(inputProfile, today, currentSteps) {
  const profile = normalizeProfile(inputProfile, today);
  const steps = toNonNegativeInt(currentSteps);
  const isNewDay = profile.lastSettlementDate !== today;
  const existing = isNewDay ? null : profile.dailyActivity.find((entry) => entry.date === today);
  const earnedToday = existing?.earnedFood ?? 0;
  const entitledFood = Math.min(DAILY_FOOD_CAP, Math.floor(steps / FOOD_PER_STEPS));
  const earnedFood = Math.max(0, entitledFood - earnedToday);
  const updatedActivity = profile.dailyActivity.filter((entry) => entry.date !== today);

  updatedActivity.push({
    date: today,
    settledSteps: steps,
    earnedFood: earnedToday + earnedFood
  });

  return {
    earnedFood,
    profile: {
      ...profile,
      foodBalance: profile.foodBalance + earnedFood,
      lastSettlementDate: today,
      lastSettledSteps: steps,
      dailyActivity: updatedActivity.slice(-HISTORY_DAYS)
    }
  };
}
