import { createWidget, widget } from "@zos/ui";
import { Step } from "@zos/sensor";
import * as Common from "zosLoader:./../common.[pf].layout.js";
import * as Styles from "zosLoader:./home.[pf].layout.js";
import { toDateKey } from "../../core/date-key.js";
import { settleSteps } from "../../core/settlement.js";
import { loadProfile, saveProfile } from "../../utils/storage.js";

const step = new Step();

Page({
  build() {
    const today = toDateKey(new Date());
    const currentSteps = Math.max(0, Math.floor(step.getCurrent() || 0));
    const result = settleSteps(loadProfile(today), today, currentSteps);
    saveProfile(result.profile);

    createWidget(widget.FILL_RECT, { ...Common.SCREEN, color: 0x101111 });
    createWidget(widget.TEXT, { ...Styles.TITLE, text: "PET UNIVERSE" });
    createWidget(widget.TEXT, { ...Styles.STEPS, text: `${currentSteps} STEPS` });
    createWidget(widget.TEXT, { ...Styles.FOOD, text: `${result.profile.foodBalance} FOOD` });
    createWidget(widget.TEXT, {
      ...Styles.NOTE,
      text: result.earnedFood > 0
        ? `WALK REWARD +${result.earnedFood}`
        : "Walk 1,000 steps to earn food"
    });
  }
});
