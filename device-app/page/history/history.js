import { createWidget, event, prop, widget } from "@zos/ui";
import { px } from "@zos/utils";
import { push } from "@zos/router";
import * as Common from "zosLoader:./../common.[pf].layout.js";
import * as Styles from "zosLoader:./history.[pf].layout.js";
import { loadProfile } from "../../utils/storage.js";
import { toDateKey } from "../../core/date-key.js";
import { t } from "../../utils/i18n.js";

const TAP_EVENT = event.CLICK_DOWN;

Page({
  build() {
    const today = toDateKey(new Date());
    const profile = loadProfile(today);
    const activity = profile.dailyActivity || [];

    createWidget(widget.FILL_RECT, { ...Common.SCREEN, color: 0x101111 });
    createWidget(widget.TEXT, { ...Styles.TITLE, text: t("history") });

    const backLabel = createWidget(widget.TEXT, { ...Styles.BACK, text: t("back") });
    backLabel.addEventListener(TAP_EVENT, () => {
      push({ url: "page/home/home" });
    });

    // Header row
    const hdrY = Styles.LIST_Y;
    createWidget(widget.TEXT, {
      x: Styles.LIST_X, y: hdrY, w: Styles.COL_DATE_W, h: px(24),
      color: Styles.HEADER_COLOR, text_size: px(Styles.HEADER_SIZE), text: t("date")
    });
    createWidget(widget.TEXT, {
      x: Styles.LIST_X + Styles.COL_DATE_W, y: hdrY, w: Styles.COL_STEPS_W, h: px(24),
      color: Styles.HEADER_COLOR, text_size: px(Styles.HEADER_SIZE), text: t("steps")
    });
    createWidget(widget.TEXT, {
      x: Styles.LIST_X + Styles.COL_DATE_W + Styles.COL_STEPS_W, y: hdrY, w: Styles.COL_FOOD_W, h: px(24),
      color: Styles.HEADER_COLOR, text_size: px(Styles.HEADER_SIZE), text: t("food")
    });

    if (activity.length === 0) {
      createWidget(widget.TEXT, {
        x: Styles.LIST_X, y: hdrY + px(40), w: px(400), h: px(30),
        color: Styles.EMPTY_COLOR, text_size: px(Styles.ROW_SIZE),
        align_h: align.CENTER_H, text: t("no_activity")
      });
      return;
    }

    // Show newest first, max 14 rows
    const sorted = [...activity].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14);
    sorted.forEach((entry, i) => {
      const y = hdrY + px(30) + i * Styles.ROW_H;
      const dateStr = entry.date.slice(4); // MMDD
      createWidget(widget.TEXT, {
        x: Styles.LIST_X, y, w: Styles.COL_DATE_W, h: px(22),
        color: Styles.ROW_COLOR, text_size: px(Styles.ROW_SIZE),
        text: dateStr
      });
      createWidget(widget.TEXT, {
        x: Styles.LIST_X + Styles.COL_DATE_W, y, w: Styles.COL_STEPS_W, h: px(22),
        color: Styles.ROW_COLOR, text_size: px(Styles.ROW_SIZE),
        text: `${entry.settledSteps}`
      });
      createWidget(widget.TEXT, {
        x: Styles.LIST_X + Styles.COL_DATE_W + Styles.COL_STEPS_W, y, w: Styles.COL_FOOD_W, h: px(22),
        color: Styles.ROW_COLOR, text_size: px(Styles.ROW_SIZE),
        text: `${entry.earnedFood}`
      });
    });
  }
});
