import { LocalStorage } from "@zos/storage";
import { createDefaultProfile, normalizeProfile } from "../core/profile.js";

const PROFILE_KEY = "pet_universe_profile_v1";
const localStorage = new LocalStorage();

export function loadProfile(today) {
  const raw = localStorage.getItem(PROFILE_KEY, "");
  if (!raw) return createDefaultProfile(today);
  try {
    return normalizeProfile(JSON.parse(raw), today);
  } catch {
    return createDefaultProfile(today);
  }
}

export function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}
