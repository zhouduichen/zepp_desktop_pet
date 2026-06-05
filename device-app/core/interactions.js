import { toNonNegativeInt } from "./helpers.js";

const FEED_EXPERIENCE = 10;
const FEED_AFFINITY = 5;
const PET_AFFINITY = 1;
const PLAY_EXPERIENCE = 3;
const PLAY_AFFINITY = 1;

const ACTION_FRAMES = {
  idle: "static.png",
  feed: "feed_7.png",
  pet: "tap_3.png",
  play: "happy_4.png",
  noFood: "no_food_3.png"
};

function withCounters(profile) {
  return {
    ...profile,
    foodBalance: toNonNegativeInt(profile?.foodBalance),
    affinity: toNonNegativeInt(profile?.affinity),
    experience: toNonNegativeInt(profile?.experience)
  };
}

export function feedPet(profile) {
  const current = withCounters(profile);

  if (current.foodBalance <= 0) {
    return {
      action: "noFood",
      profile,
      message: "No food yet. Walk to earn more."
    };
  }

  return {
    action: "feed",
    profile: {
      ...current,
      foodBalance: current.foodBalance - 1,
      affinity: current.affinity + FEED_AFFINITY,
      experience: current.experience + FEED_EXPERIENCE
    },
    message: "Yum! +10 EXP +5 AFF"
  };
}

export function petPet(profile) {
  const current = withCounters(profile);

  return {
    action: "pet",
    profile: {
      ...current,
      affinity: current.affinity + PET_AFFINITY
    },
    message: "Pet +1 AFF"
  };
}

export function playPet(profile) {
  const current = withCounters(profile);

  return {
    action: "play",
    profile: {
      ...current,
      affinity: current.affinity + PLAY_AFFINITY,
      experience: current.experience + PLAY_EXPERIENCE
    },
    message: "Play +3 EXP +1 AFF"
  };
}

export function getInteractionFrame(petId, action = "idle") {
  return `pets/${petId}/baby/${ACTION_FRAMES[action] ?? ACTION_FRAMES.idle}`;
}
