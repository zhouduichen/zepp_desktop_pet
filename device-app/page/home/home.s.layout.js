import { px } from "@zos/utils";
import { align } from "@zos/ui";

const BUTTON_BG = 0x1c2528;
const BUTTON_TEXT = { color: 0xffffff, text_size: px(15), align_h: align.CENTER_H };

export const TITLE = { x: px(40), y: px(24), w: px(310), h: px(34), color: 0xffffff, text_size: px(26), align_h: align.CENTER_H };
export const PET = { x: px(40), y: px(58), w: px(310), h: px(30), color: 0x8bc8ff, text_size: px(19), align_h: align.CENTER_H };
export const PET_IMAGE = { x: px(126), y: px(86), w: px(138), h: px(138) };
export const STEPS = { x: px(40), y: px(226), w: px(310), h: px(26), color: 0x91d1b2, text_size: px(20), align_h: align.CENTER_H };
export const FOOD = { x: px(40), y: px(252), w: px(310), h: px(26), color: 0xffd276, text_size: px(19), align_h: align.CENTER_H };
export const GROWTH = { x: px(40), y: px(278), w: px(310), h: px(22), color: 0xcac2b5, text_size: px(15), align_h: align.CENTER_H };
export const FORM = { x: px(42), y: px(300), w: px(146), h: px(20), color: 0x8bc8ff, text_size: px(14), align_h: align.CENTER_H };
export const COLLECTION = { x: px(202), y: px(300), w: px(146), h: px(20), color: 0xffd276, text_size: px(14), align_h: align.CENTER_H };
export const NOTE = { x: px(34), y: px(420), w: px(322), h: px(24), color: 0xada79c, text_size: px(14), align_h: align.CENTER_H };
export const BUTTON_1_BG = { x: px(26), y: px(326), w: px(100), h: px(36), color: BUTTON_BG };
export const BUTTON_1 = { x: px(26), y: px(334), w: px(100), h: px(20), ...BUTTON_TEXT };
export const BUTTON_2_BG = { x: px(145), y: px(326), w: px(100), h: px(36), color: BUTTON_BG };
export const BUTTON_2 = { x: px(145), y: px(334), w: px(100), h: px(20), ...BUTTON_TEXT };
export const BUTTON_3_BG = { x: px(264), y: px(326), w: px(100), h: px(36), color: BUTTON_BG };
export const BUTTON_3 = { x: px(264), y: px(334), w: px(100), h: px(20), ...BUTTON_TEXT };
export const BUTTON_4_BG = { x: px(26), y: px(372), w: px(100), h: px(36), color: BUTTON_BG };
export const BUTTON_4 = { x: px(26), y: px(380), w: px(100), h: px(20), ...BUTTON_TEXT };
export const BUTTON_5_BG = { x: px(145), y: px(372), w: px(100), h: px(36), color: BUTTON_BG };
export const BUTTON_5 = { x: px(145), y: px(380), w: px(100), h: px(20), ...BUTTON_TEXT };
export const BUTTON_6_BG = { x: px(264), y: px(372), w: px(100), h: px(36), color: BUTTON_BG };
export const BUTTON_6 = { x: px(264), y: px(380), w: px(100), h: px(20), ...BUTTON_TEXT };
