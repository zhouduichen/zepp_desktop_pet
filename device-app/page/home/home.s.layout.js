import { px } from "@zos/utils";
import { align } from "@zos/ui";

const BUTTON_BG = 0x1c2528;
const BUTTON_TEXT = { color: 0xffffff, text_size: px(18), align_h: align.CENTER_H };

export const TITLE = { x: px(40), y: px(24), w: px(310), h: px(34), color: 0xffffff, text_size: px(26), align_h: align.CENTER_H };
export const PET = { x: px(40), y: px(58), w: px(310), h: px(30), color: 0x8bc8ff, text_size: px(19), align_h: align.CENTER_H };
export const PET_IMAGE = { x: px(122), y: px(88), w: px(146), h: px(146) };
export const STEPS = { x: px(40), y: px(236), w: px(310), h: px(28), color: 0x91d1b2, text_size: px(21), align_h: align.CENTER_H };
export const FOOD = { x: px(40), y: px(264), w: px(310), h: px(28), color: 0xffd276, text_size: px(20), align_h: align.CENTER_H };
export const GROWTH = { x: px(40), y: px(292), w: px(310), h: px(24), color: 0xcac2b5, text_size: px(16), align_h: align.CENTER_H };
export const NOTE = { x: px(36), y: px(418), w: px(318), h: px(26), color: 0xada79c, text_size: px(15), align_h: align.CENTER_H };
export const FEED_BUTTON_BG = { x: px(38), y: px(322), w: px(140), h: px(40), color: BUTTON_BG };
export const FEED_BUTTON = { x: px(38), y: px(331), w: px(140), h: px(22), ...BUTTON_TEXT };
export const PET_BUTTON_BG = { x: px(212), y: px(322), w: px(140), h: px(40), color: BUTTON_BG };
export const PET_BUTTON = { x: px(212), y: px(331), w: px(140), h: px(22), ...BUTTON_TEXT };
export const PLAY_BUTTON_BG = { x: px(38), y: px(370), w: px(140), h: px(40), color: BUTTON_BG };
export const PLAY_BUTTON = { x: px(38), y: px(379), w: px(140), h: px(22), ...BUTTON_TEXT };
export const NEXT_BUTTON_BG = { x: px(212), y: px(370), w: px(140), h: px(40), color: BUTTON_BG };
export const NEXT_BUTTON = { x: px(212), y: px(379), w: px(140), h: px(22), ...BUTTON_TEXT };
