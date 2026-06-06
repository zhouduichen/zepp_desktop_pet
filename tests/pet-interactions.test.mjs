import test from "node:test";
import assert from "node:assert/strict";
import {
  feedPet,
  getInteractionFrame,
  petPet,
  playPet
} from "../device-app/core/interactions.js";

test("feedPet consumes one food and grows the current pet", () => {
  const result = feedPet({
    selectedPetId: "pixel-cat",
    foodBalance: 2,
    affinity: 4,
    experience: 8
  });

  assert.equal(result.action, "feed");
  assert.equal(result.profile.foodBalance, 1);
  assert.equal(result.profile.affinity, 9);
  assert.equal(result.profile.experience, 18);
  assert.equal(result.message, "Yum! +10 EXP +5 AFF");
});

test("feedPet keeps profile unchanged when no food is available", () => {
  const profile = {
    selectedPetId: "pixel-cat",
    foodBalance: 0,
    affinity: 4,
    experience: 8
  };

  const result = feedPet(profile);

  assert.equal(result.action, "noFood");
  assert.deepEqual(result.profile, profile);
  assert.equal(result.message, "No food yet. Walk to earn more.");
});

test("petPet adds a small affinity reward without food", () => {
  const result = petPet({
    selectedPetId: "pixel-cat",
    foodBalance: 0,
    affinity: 4,
    experience: 8
  });

  assert.equal(result.action, "pet");
  assert.equal(result.profile.affinity, 5);
  assert.equal(result.profile.experience, 8);
  assert.equal(result.message, "Pet +1 AFF");
});

test("playPet adds lightweight experience and affinity", () => {
  const result = playPet({
    selectedPetId: "pixel-cat",
    foodBalance: 0,
    affinity: 4,
    experience: 8
  });

  assert.equal(result.action, "play");
  assert.equal(result.profile.affinity, 5);
  assert.equal(result.profile.experience, 11);
  assert.equal(result.message, "Play +3 EXP +1 AFF");
});

test("getInteractionFrame maps actions to existing pet sprite frames", () => {
  assert.equal(getInteractionFrame("pixel-cat", "idle"), "pets/pixel-cat/baby/static.png");
  assert.equal(getInteractionFrame("pixel-dog", "feed"), "pets/pixel-dog/baby/feed_7.png");
  assert.equal(getInteractionFrame("pixel-bunny", "pet"), "pets/pixel-bunny/baby/tap_3.png");
  assert.equal(getInteractionFrame("pixel-hamster", "play"), "pets/pixel-hamster/baby/happy_4.png");
  assert.equal(getInteractionFrame("pixel-fox", "noFood"), "pets/pixel-fox/baby/no_food_3.png");
  assert.equal(getInteractionFrame("pixel-cat", "active", "idle"), "pets/pixel-cat/active/static.png");
  assert.equal(getInteractionFrame("pixel-cat", "rare", "play"), "pets/pixel-cat/rare/happy_4.png");
});
