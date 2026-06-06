const timeSensor = hmSensor.createSensor(hmSensor.id.TIME);
const stepSensor = hmSensor.createSensor(hmSensor.id.STEP);

function pad2(value) {
  return value < 10 ? "0" + value : String(value);
}

function sensorValue(value, fallback) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function formatTime() {
  const fallback = new Date();
  const hour = sensorValue(timeSensor.hour, fallback.getHours());
  const minute = sensorValue(timeSensor.minute, fallback.getMinutes());
  return pad2(hour) + ":" + pad2(minute);
}

function formatDate() {
  const fallback = new Date();
  const month = sensorValue(timeSensor.month, fallback.getMonth() + 1);
  const day = sensorValue(timeSensor.day, fallback.getDate());
  return pad2(month) + "/" + pad2(day);
}

function safeSteps() {
  return Math.max(0, Math.floor(stepSensor.current || 0));
}

function stepGoal() {
  return Math.max(1, Math.floor(stepSensor.target || 8000));
}

function foodFromSteps(steps) {
  return Math.min(10, Math.floor(steps / 1000));
}

function drawText(x, y, w, h, text, size, color, align) {
  return hmUI.createWidget(hmUI.widget.TEXT, {
    x,
    y,
    w,
    h,
    color,
    text_size: size,
    align_h: align || hmUI.align.LEFT,
    text
  });
}

Page({
  build() {
    const device = hmSetting.getDeviceInfo();
    const width = device.width;
    const height = device.height || width;
    const isRound = width >= 440;
    const isAod = hmSetting.getScreenType() === hmSetting.screen_type.AOD;
    const steps = safeSteps();
    const goal = stepGoal();
    const progress = Math.min(99, Math.floor((steps / goal) * 100));

    const petSize = isRound ? 138 : 126;
    const petX = isRound ? Math.round(width - petSize - 48) : Math.round(width - petSize - 22);
    const petY = isRound ? Math.round(height - petSize - 66) : Math.round(height - petSize - 42);
    const textX = isRound ? 54 : 26;
    const timeY = isRound ? 82 : 46;
    const statY = isRound ? 188 : 152;

    hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: width,
      h: height,
      color: 0x080b0d
    });

    if (isAod) {
      drawText(textX, timeY, width - textX * 2, 58, formatTime(), 42, 0xb7b8ac);
      drawText(textX + 4, timeY + 60, width - textX * 2, 28, formatDate(), 20, 0x64665f);
      hmUI.createWidget(hmUI.widget.IMG, {
        x: petX,
        y: petY,
        w: petSize,
        h: petSize,
        src: "pixel-cat/baby/aod.png",
        auto_scale: true
      });
      return;
    }

    drawText(textX, timeY, width - textX * 2, 70, formatTime(), isRound ? 58 : 52, 0xffffff);
    drawText(textX + 4, timeY + 72, width - textX * 2, 30, formatDate(), 22, 0x8fb7ff);
    drawText(textX + 4, statY, width - textX * 2, 30, steps + " STEPS", 24, 0x91d1b2);
    drawText(textX + 4, statY + 34, width - textX * 2, 28, progress + "% GOAL", 20, 0x9aa0a6);
    drawText(textX + 4, statY + 66, width - textX * 2, 28, foodFromSteps(steps) + " FOOD", 20, 0xffd276);

    const wakeAnimation = hmUI.createWidget(hmUI.widget.IMG_ANIM, {
      x: petX,
      y: petY,
      w: petSize,
      h: petSize,
      anim_path: "pixel-cat/baby",
      anim_prefix: "wake_",
      anim_ext: "png",
      anim_fps: 8,
      anim_size: 8,
      repeat_count: 1,
      display_on_restart: true,
      default_frame_index: 0,
      auto_scale: true
    });
    wakeAnimation.setProperty(hmUI.prop.ANIM_STATUS, hmUI.anim_status.START);

    const patAnimation = hmUI.createWidget(hmUI.widget.IMG_ANIM, {
      x: petX,
      y: petY,
      w: petSize,
      h: petSize,
      anim_path: "pixel-cat/baby",
      anim_prefix: "tap_",
      anim_ext: "png",
      anim_fps: 8,
      anim_size: 8,
      repeat_count: 1,
      display_on_restart: true,
      default_frame_index: 0,
      auto_scale: true
    });

    const petHitTarget = hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: petX,
      y: petY,
      w: petSize,
      h: petSize,
      color: 0xffffff,
      alpha: 0
    });
    petHitTarget.addEventListener(hmUI.event.CLICK_DOWN, function () {
      patAnimation.setProperty(hmUI.prop.ANIM_STATUS, hmUI.anim_status.START);
    });
  }
});
