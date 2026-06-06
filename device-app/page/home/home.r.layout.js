import { px } from "@zos/utils";
import { align } from "@zos/ui";

const BUTTON_BG = 0x1c2528;
const BUTTON_TEXT = { color: 0xffffff, text_size: px(16), align_h: align.CENTER_H };

export const TITLE = { x: px(70), y: px(42), w: px(340), h: px(34), color: 0xffffff, text_size: px(27), align_h: align.CENTER_H };
export const PET = { x: px(72), y: px(78), w: px(336), h: px(30), color: 0x8bc8ff, text_size: px(20), align_h: align.CENTER_H };
export const PET_IMAGE = { x: px(164), y: px(106), w: px(152), h: px(152) };
export const STEPS = { x: px(70), y: px(260), w: px(340), h: px(28), color: 0x91d1b2, text_size: px(21), align_h: align.CENTER_H };
export const FOOD = { x: px(70), y: px(288), w: px(340), h: px(26), color: 0xffd276, text_size: px(20), align_h: align.CENTER_H };
export const GROWTH = { x: px(76), y: px(314), w: px(328), h: px(24), color: 0xcac2b5, text_size: px(16), align_h: align.CENTER_H };
export const FORM = { x: px(76), y: px(338), w: px(160), h: px(22), color: 0x8bc8ff, text_size: px(15), align_h: align.CENTER_H };
export const COLLECTION = { x: px(244), y: px(338), w: px(160), h: px(22), color: 0xffd276, text_size: px(15), align_h: align.CENTER_H };
export const NOTE = { x: px(62), y: px(360), w: px(356), h: px(22), color: 0xada79c, text_size: px(14), align_h: align.CENTER_H };
export const BUTTON_1_BG = { x: px(62), y: px(388), w: px(106), h: px(34), color: BUTTON_BG };
export const BUTTON_1 = { x: px(62), y: px(396), w: px(106), h: px(20), ...BUTTON_TEXT };
export const BUTTON_2_BG = { x: px(187), y: px(388), w: px(106), h: px(34), color: BUTTON_BG };
export const BUTTON_2 = { x: px(187), y: px(396), w: px(106), h: px(20), ...BUTTON_TEXT };
export const BUTTON_3_BG = { x: px(312), y: px(388), w: px(106), h: px(34), color: BUTTON_BG };
export const BUTTON_3 = { x: px(312), y: px(396), w: px(106), h: px(20), ...BUTTON_TEXT };
export const BUTTON_4_BG = { x: px(62), y: px(428), w: px(106), h: px(34), color: BUTTON_BG };
export const BUTTON_4 = { x: px(62), y: px(436), w: px(106), h: px(20), ...BUTTON_TEXT };
export const BUTTON_5_BG = { x: px(187), y: px(428), w: px(106), h: px(34), color: BUTTON_BG };
export const BUTTON_5 = { x: px(187), y: px(436), w: px(106), h: px(20), ...BUTTON_TEXT };
export const BUTTON_6_BG = { x: px(312), y: px(428), w: px(106), h: px(34), color: BUTTON_BG };
export const BUTTON_6 = { x: px(312), y: px(436), w: px(106), h: px(20), ...BUTTON_TEXT };
