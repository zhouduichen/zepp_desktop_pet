import { createWidget, event, prop, widget } from "@zos/ui";
import { px } from "@zos/utils";
import { push, replace } from "@zos/router";
import * as Common from "zosLoader:./../common.[pf].layout.js";
import * as Styles from "zosLoader:./detail.[pf].layout.js";
import { loadProfile, saveProfile } from "../../utils/storage.js";
import { toDateKey } from "../../core/date-key.js";
import { getPetById, getNextPetId, applyPetSwitch } from "../../core/pets.js";
import { getInteractionFrame, feedPet, petPet, playPet } from "../../core/interactions.js";
import { t } from "../../utils/i18n.js";

const TAP_EVENT = event.CLICK_DOWN;

function setText(target, text) {
  target.setProperty(prop.MORE, { text });
}

Page({
  state: { profile: null, note: "" },

  build() {
    const today = toDateKey(new Date());
    let profile = loadProfile(today);
    this.state.profile = profile;

    createWidget(widget.FILL_RECT, { ...Common.SCREEN, color: 0x101111 });

    const pet = getPetById(profile.selectedPetId);

    const backLabel = createWidget(widget.TEXT, { ...Styles.BACK, text: t("back") });
    backLabel.addEventListener(TAP_EVENT, () => {
      push({ url: "page/home/home" });
    });

    const formLabel = createWidget(widget.TEXT, {
      ...Styles.FORM_LABEL,
      text: `${pet.name} - ${profile.selectedFormId.toUpperCase()}`
    });

    const petImage = createWidget(widget.IMG, {
      ...Styles.PET_IMAGE,
      src: getInteractionFrame(pet.id, profile.selectedFormId, "idle"),
      auto_scale: true
    });

    const expLabel = createWidget(widget.TEXT, {
      ...Styles.STAT_EXP,
      text: `${t("exp")} ${profile.experience}`
    });

    const affLabel = createWidget(widget.TEXT, {
      ...Styles.STAT_AFF,
      text: `${t("aff")} ${profile.affinity}`
    });

    const foodLabel = createWidget(widget.TEXT, {
      ...Styles.STAT_FOOD,
      text: `${t("food_label")} ${profile.foodBalance}`
    });

    const note = createWidget(widget.TEXT, { ...Styles.NOTE, text: "" });

    function save() {
      saveProfile(this.state.profile);
    }

    function render() {
      setText(expLabel, `${t("exp")} ${this.state.profile.experience}`);
      setText(affLabel, `${t("aff")} ${this.state.profile.affinity}`);
      setText(foodLabel, `${t("food_label")} ${this.state.profile.foodBalance}`);
      setText(note, this.state.note);
    }

    function colX(index) {
      return px(62) + index * (Styles.BUTTON_W + Styles.BUTTON_GAP);
    }

    const buttons = [
      { label: t("feed"), fn: () => {
        const result = feedPet(this.state.profile);
        this.state.profile = result.profile;
        this.state.note = result.message;
        save();
        render();
      }},
      { label: t("pet"), fn: () => {
        const result = petPet(this.state.profile);
        this.state.profile = result.profile;
        this.state.note = result.message;
        save();
        render();
      }},
      { label: t("play"), fn: () => {
        const result = playPet(this.state.profile);
        this.state.profile = result.profile;
        this.state.note = result.message;
        save();
        render();
      }}
    ];

    buttons.forEach((btn, i) => {
      const x = colX(i);
      const bg = createWidget(widget.FILL_RECT, {
        x, y: Styles.BUTTON_ROW_Y, w: Styles.BUTTON_W, h: Styles.BUTTON_H,
        color: Styles.BUTTON_BG_COLOR
      });
      const label = createWidget(widget.TEXT, {
        x, y: Styles.BUTTON_ROW_Y + px(8), w: Styles.BUTTON_W, h: px(20),
        color: Styles.BUTTON_TEXT_COLOR, text_size: px(Styles.BUTTON_TEXT_SIZE),
        align_h: align.CENTER_H, text: btn.label
      });
      bg.addEventListener(TAP_EVENT, btn.fn);
      label.addEventListener(TAP_EVENT, btn.fn);
    });

    // Form switch button
    const formBg = createWidget(widget.FILL_RECT, {
      x: colX(0), y: Styles.BUTTON_ROW2_Y, w: Styles.BUTTON_W, h: Styles.BUTTON_H,
      color: Styles.BUTTON_BG_COLOR
    });
    const formLabel2 = createWidget(widget.TEXT, {
      x: colX(0), y: Styles.BUTTON_ROW2_Y + px(8), w: Styles.BUTTON_W, h: px(20),
      color: Styles.BUTTON_TEXT_COLOR, text_size: px(Styles.BUTTON_TEXT_SIZE),
      align_h: align.CENTER_H, text: t("form_switch")
    });
    const navForm = () => { push({ url: "page/form-switch/form-switch" }); };
    formBg.addEventListener(TAP_EVENT, navForm);
    formLabel2.addEventListener(TAP_EVENT, navForm);

    // Next pet button
    const nextBg = createWidget(widget.FILL_RECT, {
      x: colX(1), y: Styles.BUTTON_ROW2_Y, w: Styles.BUTTON_W, h: Styles.BUTTON_H,
      color: Styles.BUTTON_BG_COLOR
    });
    const nextLabel = createWidget(widget.TEXT, {
      x: colX(1), y: Styles.BUTTON_ROW2_Y + px(8), w: Styles.BUTTON_W, h: px(20),
      color: Styles.BUTTON_TEXT_COLOR, text_size: px(Styles.BUTTON_TEXT_SIZE),
      align_h: align.CENTER_H, text: t("next")
    });
    const navNext = () => {
      this.state.profile = applyPetSwitch(this.state.profile);
      save();
      replace({ url: "page/detail/detail" });
    };
    nextBg.addEventListener(TAP_EVENT, navNext);
    nextLabel.addEventListener(TAP_EVENT, navNext);
  }
});
