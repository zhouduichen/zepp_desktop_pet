import { LocalStorage } from "@zos/storage";
import { createDefaultProfile, normalizeProfile } from "../core/profile.js";

const PROFILE_KEY = "pet_universe_profile_v1";
const COLLECTION_KEY = "pet_universe_collection_v1";
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

export function loadCollections() {
  const raw = localStorage.getItem(COLLECTION_KEY, "");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

export function saveCollections(collections) {
  localStorage.setItem(COLLECTION_KEY, JSON.stringify(Array.isArray(collections) ? collections : []));
}
