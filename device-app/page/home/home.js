import { createWidget, event, prop, widget } from "@zos/ui";
import { Step } from "@zos/sensor";
import { push } from "@zos/router";
import * as Common from "zosLoader:./../common.[pf].layout.js";
import * as Styles from "zosLoader:./home.[pf].layout.js";
import {
  applyChoiceAction,
  applyEvolutionAction,
  applyFormCycleAction,
  applyMilestoneUnlocks,
  applyPetCycleAction,
  createHomeView,
  ensureCollectionForPet
} from "../../core/home-state.js";
import { feedPet, getInteractionFrame, petPet, playPet } from "../../core/interactions.js";
import { getPetById } from "../../core/pets.js";
import { toDateKey } from "../../core/date-key.js";
import { settleSteps } from "../../core/settlement.js";
import { loadCollections, loadProfile, saveCollections, saveProfile } from "../../utils/storage.js";
import { t } from "../../utils/i18n.js";

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
  return { background, label };
}

Page({
  build() {
    const today = toDateKey(new Date());
    const currentSteps = Math.max(0, Math.floor(step.getCurrent() || 0));
    const result = settleSteps(loadProfile(today), today, currentSteps);
    let profile = result.profile;
    let collections = ensureCollectionForPet(loadCollections(), profile.selectedPetId);
    saveProfile(profile);
    saveCollections(collections);

    createWidget(widget.FILL_RECT, { ...Common.SCREEN, color: 0x101111 });
    createWidget(widget.TEXT, { ...Styles.TITLE, text: t("home_title") });
    const pet = getPetById(profile.selectedPetId);
    const petLabel = createWidget(widget.TEXT, {
      ...Styles.PET,
      text: pet.name.toUpperCase()
    });
    const petImage = createWidget(widget.IMG, {
      ...Styles.PET_IMAGE,
      src: getInteractionFrame(pet.id, profile.selectedFormId, "idle"),
      auto_scale: true
    });
    createWidget(widget.TEXT, { ...Styles.STEPS, text: `${currentSteps} ${t("steps_label")}` });
    const foodLabel = createWidget(widget.TEXT, { ...Styles.FOOD, text: `${profile.foodBalance} ${t("food_label")}` });
    const growthLabel = createWidget(widget.TEXT, {
      ...Styles.GROWTH,
      text: ""
    });
    const formLabel = createWidget(widget.TEXT, { ...Styles.FORM, text: "" });
    const collectionLabel = createWidget(widget.TEXT, { ...Styles.COLLECTION, text: "" });
    const note = createWidget(widget.TEXT, {
      ...Styles.NOTE,
      text: result.earnedFood > 0
        ? `WALK REWARD +${result.earnedFood}`
        : t("no_food")
    });

    const buttonSlots = [
      createButton(Styles.BUTTON_1_BG, Styles.BUTTON_1, "", () => handleAction(0)),
      createButton(Styles.BUTTON_2_BG, Styles.BUTTON_2, "", () => handleAction(1)),
      createButton(Styles.BUTTON_3_BG, Styles.BUTTON_3, "", () => handleAction(2)),
      createButton(Styles.BUTTON_4_BG, Styles.BUTTON_4, "", () => handleAction(3)),
      createButton(Styles.BUTTON_5_BG, Styles.BUTTON_5, "", () => handleAction(4)),
      createButton(Styles.BUTTON_6_BG, Styles.BUTTON_6, "", () => handleAction(5))
    ];
    let buttonActions = [];

    function saveState() {
      saveProfile(profile);
      saveCollections(collections);
    }

    function renderProfile(action, message) {
      const selectedPet = getPetById(profile.selectedPetId);
      const view = createHomeView({ profile, collections });
      setText(petLabel, selectedPet.name.toUpperCase());
      setText(foodLabel, `${profile.foodBalance} ${t("food_label")}`);
      setText(growthLabel, view.growthText);
      setText(formLabel, view.formText);
      setText(collectionLabel, view.collectionText);
      setText(note, message);
      setImage(petImage, getInteractionFrame(selectedPet.id, profile.selectedFormId, action));

      buttonActions = view.buttons.map((button) => button.action);
      view.buttons.forEach((button, index) => {
        setText(buttonSlots[index].label, button.label);
      });
    }

    function applyState(next, action = "idle") {
      profile = next.profile;
      collections = next.collections || collections;
      saveState();
      renderProfile(action, next.message);
    }

    function applyInteraction(next) {
      const milestone = applyMilestoneUnlocks({
        profile: next.profile,
        collections,
        message: next.message
      });
      applyState(milestone, next.action);
    }

    function handleAction(index) {
      const action = buttonActions[index];
      if (!action || action === "none") return;

      if (action === "feed") {
        const next = feedPet(profile);
        applyInteraction(next);
      } else if (action === "pet") {
        const next = petPet(profile);
        applyInteraction(next);
      } else if (action === "play") {
        const next = playPet(profile);
        applyInteraction(next);
      } else if (action === "evolve") {
        const next = applyEvolutionAction({ profile, collections });
        applyState(applyMilestoneUnlocks(next), "idle");
      } else if (action === "form") {
        applyState(applyFormCycleAction({ profile, collections }), "idle");
      } else if (action === "next") {
        applyState(applyPetCycleAction({ profile, collections }), "idle");
      } else if (action === "collection") {
        push({ url: "page/collection/collection" });
      } else if (action === "history") {
        push({ url: "page/history/history" });
      } else if (action.indexOf("choice:") === 0) {
        applyState(applyChoiceAction({ profile, collections }, action.slice(7)), "idle");
      }
    }

    renderProfile("idle", result.earnedFood > 0
      ? `WALK REWARD +${result.earnedFood}`
      : "Walk 1,000 steps to earn food");
  }
});
