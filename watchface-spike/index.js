const stepSensor = hmSensor.createSensor(hmSensor.id.STEP);

Page({
  build() {
    const { width } = hmSetting.getDeviceInfo();
    const petSize = 160;
    const petX = Math.round((width - petSize) / 2);
    const isAod = hmSetting.getScreenType() === hmSetting.screen_type.AOD;

    /* ------------------------------------------------------------------ */
    /*  AOD branch                                                        */
    /* ------------------------------------------------------------------ */
    if (isAod) {
      hmUI.createWidget(hmUI.widget.IMG, {
        x: petX,
        y: 205,
        w: petSize,
        h: petSize,
        src: "pixel-cat/baby/aod.png",
        auto_scale: true
      });
      return;
    }

    /* ------------------------------------------------------------------ */
    /*  Title                                                             */
    /* ------------------------------------------------------------------ */
    hmUI.createWidget(hmUI.widget.TEXT, {
      x: 0,
      y: 92,
      w: width,
      h: 52,
      color: 0xffffff,
      text_size: 30,
      align_h: hmUI.align.CENTER_H,
      text: "PET UNIVERSE"
    });

    /* ------------------------------------------------------------------ */
    /*  Step readout via hmSensor STEP                                     */
    /* ------------------------------------------------------------------ */
    hmUI.createWidget(hmUI.widget.TEXT, {
      x: 0,
      y: 142,
      w: width,
      h: 44,
      color: 0x91d1b2,
      text_size: 24,
      align_h: hmUI.align.CENTER_H,
      text: stepSensor.current + " STEPS"
    });

    /* ------------------------------------------------------------------ */
    /*  Finite wake animation via IMG_ANIM                                 */
    /* ------------------------------------------------------------------ */
    const wakeAnimation = hmUI.createWidget(hmUI.widget.IMG_ANIM, {
      x: petX,
      y: 205,
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

    /* ------------------------------------------------------------------ */
    /*  Experimental tap target                                            */
    /*                                                                     */
    /*  Uses CLICK_DOWN (official documented event) rather than CLICK_UP   */
    /*  which is not shown in the watchface IMG widget docs.               */
    /* ------------------------------------------------------------------ */
    const petHitTarget = hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: petX,
      y: 205,
      w: petSize,
      h: petSize,
      color: 0xffffff,
      alpha: 0
    });
    petHitTarget.addEventListener(hmUI.event.CLICK_DOWN, function () {
      wakeAnimation.setProperty(hmUI.prop.ANIM_STATUS, hmUI.anim_status.START);
      console.log("pet tap reaction verified");
    });
  }
});
