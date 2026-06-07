import { createWidget, event, prop, widget } from "@zos/ui";
import { px } from "@zos/utils";
import { push, back } from "@zos/router";
import * as Common from "zosLoader:./../common.[pf].layout.js";
import * as Styles from "zosLoader:./form-switch.[pf].layout.js";
import { loadProfile, saveProfile } from "../../utils/storage.js";
import { loadCollections, saveCollections } from "../../utils/storage.js";
import { toDateKey } from "../../core/date-key.js";
import { getPetById } from "../../core/pets.js";
import { ensureCollectionForPet } from "../../core/home-state.js";
import { getUnlockedForms, isFormUnlocked } from "../../core/collection.js";
import { applyFormSwitch } from "../../core/form-switch.js";
import { t } from "../../utils/i18n.js";

const TAP_EVENT = event.CLICK_DOWN;

const FORM_LABELS = {
  baby: "Baby",
  teen: "Teen",
  active: "Active",
  steady: "Steady",
  explorer: "Explorer",
  rare: "Rare",
  secret: "Secret"
};

Page({
  build() {
    const today = toDateKey(new Date());
    let profile = loadProfile(today);
    let collections = loadCollections();
    collections = ensureCollectionForPet(collections, profile.selectedPetId);
    const petCollection = collections.find(c => c.petId === profile.selectedPetId);
    const pet = getPetById(profile.selectedPetId);

    const allFormIds = ["baby", "teen", "active", "steady", "explorer", "rare", "secret"];

    createWidget(widget.FILL_RECT, { ...Common.SCREEN, color: 0x101111 });
    createWidget(widget.TEXT, {
      ...Styles.TITLE,
      text: `${pet.name} ${t("forms")}`
    });

    const backLabel = createWidget(widget.TEXT, { ...Styles.BACK, text: t("back") });
    backLabel.addEventListener(TAP_EVENT, () => { back(); });

    allFormIds.forEach((formId, index) => {
      const y = Styles.LIST_Y + index * Styles.ROW_H;
      const unlocked = petCollection && isFormUnlocked(petCollection, formId);
      const isSelected = profile.selectedFormId === formId;

      const label = FORM_LABELS[formId] || formId;
      const statusText = isSelected ? t("selected") : (unlocked ? t("unlocked") : t("locked"));
      const statusColor = isSelected ? Styles.STATUS_SELECTED_COLOR
        : unlocked ? Styles.STATUS_UNLOCKED_COLOR
        : Styles.STATUS_LOCKED_COLOR;

      createWidget(widget.TEXT, {
        x: Styles.LIST_X, y, w: Styles.FORM_NAME_W, h: px(24),
        color: Styles.FORM_NAME_COLOR, text_size: px(Styles.TEXT_SIZE_NAME),
        text: label
      });

      createWidget(widget.TEXT, {
        x: Styles.LIST_X + Styles.FORM_NAME_W, y, w: Styles.FORM_STATUS_W, h: px(24),
        color: statusColor, text_size: px(Styles.TEXT_SIZE_STATUS),
        text: statusText
      });

      if (unlocked && !isSelected) {
        const btnX = Styles.LIST_X + Styles.FORM_NAME_W + Styles.FORM_STATUS_W;
        const bg = createWidget(widget.FILL_RECT, {
          x: btnX, y, w: Styles.SELECT_BTN_W, h: px(28),
          color: 0x2a5a3a
        });
        const btnLabel = createWidget(widget.TEXT, {
          x: btnX, y: y + px(4), w: Styles.SELECT_BTN_W, h: px(20),
          color: 0xffffff, text_size: px(Styles.TEXT_SIZE_BTN),
          align_h: align.CENTER_H, text: t("use")
        });
        const applyFn = () => {
          const result = applyFormSwitch(profile, formId, petCollection);
          if (result) {
            profile = result;
            saveProfile(profile);
            saveCollections(collections);
            back();
          }
        };
        bg.addEventListener(TAP_EVENT, applyFn);
        btnLabel.addEventListener(TAP_EVENT, applyFn);
      }
    });
  }
});
