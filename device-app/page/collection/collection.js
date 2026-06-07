import { createWidget, event, widget } from "@zos/ui";
import { px } from "@zos/utils";
import { push } from "@zos/router";
import * as Common from "zosLoader:./../common.[pf].layout.js";
import * as Styles from "zosLoader:./collection.[pf].layout.js";
import { loadProfile, saveProfile } from "../../utils/storage.js";
import { toDateKey } from "../../core/date-key.js";
import { PET_ROSTER } from "../../core/pets.js";
import { ensureCollectionForPet } from "../../core/home-state.js";
import { loadCollections, saveCollections } from "../../utils/storage.js";
import { t } from "../../utils/i18n.js";

const TAP_EVENT = event.CLICK_DOWN;

Page({
  build() {
    const today = toDateKey(new Date());
    let profile = loadProfile(today);
    let collections = loadCollections();

    createWidget(widget.FILL_RECT, { ...Common.SCREEN, color: 0x101111 });
    createWidget(widget.TEXT, { ...Styles.TITLE, text: t("collection") });

    const backLabel = createWidget(widget.TEXT, { ...Styles.BACK, text: t("back") });
    backLabel.addEventListener(TAP_EVENT, () => {
      push({ url: "page/home/home" });
    });

    const cards = [];
    PET_ROSTER.forEach((pet, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const cx = Styles.GRID_X + col * (Styles.CARD_W + Styles.CARD_GAP);
      const cy = Styles.GRID_Y + row * (Styles.CARD_H + Styles.CARD_GAP);

      const collections2 = ensureCollectionForPet(collections, pet.id);
      const petCollection = collections2.find(c => c.petId === pet.id);
      const formCount = petCollection ? petCollection.unlockedFormIds.length : 1;
      const isSelected = profile.selectedPetId === pet.id;

      const bg = createWidget(widget.FILL_RECT, {
        x: cx, y: cy, w: Styles.CARD_W, h: Styles.CARD_H,
        color: isSelected ? 0x2a3a40 : Styles.BG_COLOR
      });

      const nameLabel = createWidget(widget.TEXT, {
        x: cx, y: cy + Styles.LABEL_Y, w: Styles.CARD_W, h: px(22),
        color: Styles.TEXT_COLOR, text_size: px(Styles.TEXT_SIZE_NAME),
        align_h: align.CENTER_H, text: pet.name
      });

      const petImg = createWidget(widget.IMG, {
        x: cx + (Styles.CARD_W - Styles.IMG_W) / 2,
        y: cy + Styles.IMG_Y,
        w: Styles.IMG_W, h: Styles.IMG_H,
        src: `pets/${pet.id}/baby/static.png`,
        auto_scale: true
      });

      const countLabel = createWidget(widget.TEXT, {
        x: cx, y: cy + Styles.COUNT_Y, w: Styles.CARD_W, h: px(20),
        color: Styles.COUNT_COLOR, text_size: px(Styles.TEXT_SIZE_COUNT),
        align_h: align.CENTER_H,
        text: `${formCount} ${t("forms")}`
      });

      const hit = createWidget(widget.FILL_RECT, {
        x: cx, y: cy, w: Styles.CARD_W, h: Styles.CARD_H,
        color: 0xffffff, alpha: 0
      });
      hit.addEventListener(TAP_EVENT, () => {
        profile.selectedPetId = pet.id;
        saveProfile(profile);
        push({ url: "page/detail/detail" });
      });
    });
  }
});
