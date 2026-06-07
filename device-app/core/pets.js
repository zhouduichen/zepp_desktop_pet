import { DEFAULT_FORM_ID, DEFAULT_PET_ID } from "./constants.js";

export const PET_ROSTER = [
  { id: "pixel-cat", name: "Pixel Cat" },
  { id: "pixel-dragon", name: "Pixel Dragon" },
  { id: "pixel-fox", name: "Pixel Fox" },
  { id: "pixel-hamster", name: "Pixel Hamster" },
  { id: "pixel-owl", name: "Pixel Owl" },
  { id: "pixel-penguin", name: "Pixel Penguin" },
  { id: "pixel-rabbit", name: "Pixel Rabbit" },
  { id: "pixel-shiba", name: "Pixel Shiba" }
];

export function getPetById(petId) {
  return PET_ROSTER.find((pet) => pet.id === petId) ?? PET_ROSTER[0];
}

export function getNextPetId(currentPetId) {
  const index = PET_ROSTER.findIndex((pet) => pet.id === currentPetId);
  if (index < 0) return DEFAULT_PET_ID;
  return PET_ROSTER[(index + 1) % PET_ROSTER.length].id;
}

export function applyPetSwitch(profile, nextPetId = getNextPetId(profile?.selectedPetId)) {
  return {
    ...profile,
    selectedPetId: getPetById(nextPetId).id,
    selectedFormId: DEFAULT_FORM_ID
  };
}
