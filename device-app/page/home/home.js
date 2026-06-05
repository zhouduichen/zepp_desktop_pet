import { createWidget, event, prop, widget } from "@zos/ui";
import { Step } from "@zos/sensor";
import * as Common from "zosLoader:./../common.[pf].layout.js";
import * as Styles from "zosLoader:./home.[pf].layout.js";
import { applyPetSwitch, getNextPetId, getPetById } from "../../core/pets.js";
import { toDateKey } from "../../core/date-key.js";
import { settleSteps } from "../../core/settlement.js";
import { loadProfile, saveProfile } from "../../utils/storage.js";

const step = new Step();

Page({
  build() {
    const today = toDateKey(new Date());
    const currentSteps = Math.max(0, Math.floor(step.getCurrent() || 0));
    const result = settleSteps(loadProfile(today), today, currentSteps);
    let profile = result.profile;
    saveProfile(profile);

    createWidget(widget.FILL_RECT, { ...Common.SCREEN, color: 0x101111 });
    createWidget(widget.TEXT, { ...Styles.TITLE, text: "PET UNIVERSE" });
    const petLabel = createWidget(widget.TEXT, {
      ...Styles.PET,
      text: `PET ${getPetById(profile.selectedPetId).name.toUpperCase()}`
    });
    createWidget(widget.TEXT, { ...Styles.STEPS, text: `${currentSteps} STEPS` });
    createWidget(widget.TEXT, { ...Styles.FOOD, text: `${profile.foodBalance} FOOD` });
    const note = createWidget(widget.TEXT, {
      ...Styles.NOTE,
      text: result.earnedFood > 0
        ? `WALK REWARD +${result.earnedFood}`
        : "Walk 1,000 steps to earn food"
    });
    const nextPet = createWidget(widget.TEXT, { ...Styles.NEXT_PET, text: "NEXT PET" });
    nextPet.addEventListener(event.CLICK_UP, () => {
      profile = applyPetSwitch(profile, getNextPetId(profile.selectedPetId));
      saveProfile(profile);
      const pet = getPetById(profile.selectedPetId);
      petLabel.setProperty(prop.MORE, { text: `PET ${pet.name.toUpperCase()}` });
      note.setProperty(prop.MORE, { text: `Selected ${pet.name}` });
    });
  }
});
