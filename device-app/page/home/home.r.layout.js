import { px } from "@zos/utils";
import { align } from "@zos/ui";

const BUTTON_BG = 0x1c2528;
const BUTTON_TEXT = { color: 0xffffff, text_size: px(19), align_h: align.CENTER_H };

export const TITLE = { x: px(70), y: px(42), w: px(340), h: px(34), color: 0xffffff, text_size: px(27), align_h: align.CENTER_H };
export const PET = { x: px(72), y: px(78), w: px(336), h: px(30), color: 0x8bc8ff, text_size: px(20), align_h: align.CENTER_H };
export const PET_IMAGE = { x: px(160), y: px(106), w: px(160), h: px(160) };
export const STEPS = { x: px(70), y: px(266), w: px(340), h: px(30), color: 0x91d1b2, text_size: px(22), align_h: align.CENTER_H };
export const FOOD = { x: px(70), y: px(296), w: px(340), h: px(28), color: 0xffd276, text_size: px(21), align_h: align.CENTER_H };
export const GROWTH = { x: px(76), y: px(324), w: px(328), h: px(26), color: 0xcac2b5, text_size: px(17), align_h: align.CENTER_H };
export const NOTE = { x: px(72), y: px(350), w: px(336), h: px(24), color: 0xada79c, text_size: px(15), align_h: align.CENTER_H };
export const FEED_BUTTON_BG = { x: px(84), y: px(382), w: px(140), h: px(38), color: BUTTON_BG };
export const FEED_BUTTON = { x: px(84), y: px(390), w: px(140), h: px(22), ...BUTTON_TEXT };
export const PET_BUTTON_BG = { x: px(256), y: px(382), w: px(140), h: px(38), color: BUTTON_BG };
export const PET_BUTTON = { x: px(256), y: px(390), w: px(140), h: px(22), ...BUTTON_TEXT };
export const PLAY_BUTTON_BG = { x: px(84), y: px(426), w: px(140), h: px(38), color: BUTTON_BG };
export const PLAY_BUTTON = { x: px(84), y: px(434), w: px(140), h: px(22), ...BUTTON_TEXT };
export const NEXT_BUTTON_BG = { x: px(256), y: px(426), w: px(140), h: px(38), color: BUTTON_BG };
export const NEXT_BUTTON = { x: px(256), y: px(434), w: px(140), h: px(22), ...BUTTON_TEXT };
