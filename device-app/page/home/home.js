import { createWidget, event, prop, widget } from "@zos/ui";
import { Step } from "@zos/sensor";
import * as Common from "zosLoader:./../common.[pf].layout.js";
import * as Styles from "zosLoader:./home.[pf].layout.js";
import { feedPet, getInteractionFrame, petPet, playPet } from "../../core/interactions.js";
import { applyPetSwitch, getNextPetId, getPetById } from "../../core/pets.js";
import { toDateKey } from "../../core/date-key.js";
import { settleSteps } from "../../core/settlement.js";
import { loadProfile, saveProfile } from "../../utils/storage.js";

const step = new Step();
const TAP_EVENT = event.CLICK_DOWN;

function setText(target, text) {
  target.setProperty(prop.MORE, { text });
}

function setImage(target, src) {
  target.setProperty(prop.SRC, src);
}

function createButton(backgroundStyle, textStyle, text, onTap) {
  const background = createWidget(widget.FILL_RECT, backgroundStyle);
  const label = createWidget(widget.TEXT, { ...textStyle, text });
  background.addEventListener(TAP_EVENT, onTap);
  label.addEventListener(TAP_EVENT, onTap);
}

Page({
  build() {
    const today = toDateKey(new Date());
    const currentSteps = Math.max(0, Math.floor(step.getCurrent() || 0));
    const result = settleSteps(loadProfile(today), today, currentSteps);
    let profile = result.profile;
    saveProfile(profile);

    createWidget(widget.FILL_RECT, { ...Common.SCREEN, color: 0x101111 });
    createWidget(widget.TEXT, { ...Styles.TITLE, text: "PET UNIVERSE" });
    const pet = getPetById(profile.selectedPetId);
    const petLabel = createWidget(widget.TEXT, {
      ...Styles.PET,
      text: pet.name.toUpperCase()
    });
    const petImage = createWidget(widget.IMG, {
      ...Styles.PET_IMAGE,
      src: getInteractionFrame(pet.id, "idle"),
      auto_scale: true
    });
    createWidget(widget.TEXT, { ...Styles.STEPS, text: `${currentSteps} STEPS` });
    const foodLabel = createWidget(widget.TEXT, { ...Styles.FOOD, text: `${profile.foodBalance} FOOD` });
    const growthLabel = createWidget(widget.TEXT, {
      ...Styles.GROWTH,
      text: `AFF ${profile.affinity}  EXP ${profile.experience}`
    });
    const note = createWidget(widget.TEXT, {
      ...Styles.NOTE,
      text: result.earnedFood > 0
        ? `WALK REWARD +${result.earnedFood}`
        : "Walk 1,000 steps to earn food"
    });

    const renderProfile = (action, message) => {
      const selectedPet = getPetById(profile.selectedPetId);
      setText(petLabel, selectedPet.name.toUpperCase());
      setText(foodLabel, `${profile.foodBalance} FOOD`);
      setText(growthLabel, `AFF ${profile.affinity}  EXP ${profile.experience}`);
      setText(note, message);
      setImage(petImage, getInteractionFrame(selectedPet.id, action));
    };

    createButton(Styles.FEED_BUTTON_BG, Styles.FEED_BUTTON, "FEED", () => {
      const next = feedPet(profile);
      profile = next.profile;
      saveProfile(profile);
      renderProfile(next.action, next.message);
    });
    createButton(Styles.PET_BUTTON_BG, Styles.PET_BUTTON, "PET", () => {
      const next = petPet(profile);
      profile = next.profile;
      saveProfile(profile);
      renderProfile(next.action, next.message);
    });
    createButton(Styles.PLAY_BUTTON_BG, Styles.PLAY_BUTTON, "PLAY", () => {
      const next = playPet(profile);
      profile = next.profile;
      saveProfile(profile);
      renderProfile(next.action, next.message);
    });
    createButton(Styles.NEXT_BUTTON_BG, Styles.NEXT_BUTTON, "NEXT", () => {
      profile = applyPetSwitch(profile, getNextPetId(profile.selectedPetId));
      saveProfile(profile);
      renderProfile("idle", `Selected ${getPetById(profile.selectedPetId).name}`);
    });
  }
});
