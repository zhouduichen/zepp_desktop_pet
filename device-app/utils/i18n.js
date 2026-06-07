export const SUPPORTED_LANGUAGES = ["en"];

const strings = {
  en: {
    app_name: "Pet Universe",
    home_title: "PET UNIVERSE",
    steps_label: "STEPS",
    food_label: "FOOD",
    feed: "FEED",
    pet: "PET",
    play: "PLAY",
    evo: "EVO",
    collection: "COLLECTION",
    history: "HISTORY",
    form_switch: "SWITCH FORM",
    next: "NEXT",
    back: "BACK",
    use: "USE",
    unlocked: "Unlocked",
    locked: "Locked",
    selected: "Selected",
    forms: "Forms",
    no_activity: "No activity yet",
    date: "DATE",
    steps: "STEPS",
    food: "FOOD",
    forms_label: "FORMS",
    aff: "AFF",
    exp: "EXP",
    choose: "CHOOSE",
    rare_form_unlocked: "Rare form unlocked",
    secret_form_found: "Secret form found",
    evolved_to: "Evolved to",
    keep_growing: "Keep growing for evolution",
    choose_or: "Choose {branches}",
    max: "MAX"
  }
};

let currentLanguage = "en";

export function setLanguage(lang) {
  if (SUPPORTED_LANGUAGES.includes(lang)) currentLanguage = lang;
}

export function t(key, params) {
  const value = strings[currentLanguage]?.[key];
  if (!value) return key;
  if (params) {
    return Object.entries(params).reduce((str, [k, v]) => str.replace(`{${k}}`, v), value);
  }
  return value;
}
