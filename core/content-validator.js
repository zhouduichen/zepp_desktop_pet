const MAX_AOD_PIXEL_RATIO = 0.1;

export function validateSpriteDimensions(frames, expectedWidth, expectedHeight) {
  const errors = [];
  frames.forEach((frame, i) => {
    if (frame.width !== expectedWidth) {
      errors.push(`frame ${i}: width ${frame.width} != expected ${expectedWidth}`);
    }
    if (frame.height !== expectedHeight) {
      errors.push(`frame ${i}: height ${frame.height} != expected ${expectedHeight}`);
    }
  });
  return errors;
}

export function validateFrameCount(actual, expected, label) {
  const errors = [];
  if (actual !== expected) {
    errors.push(`${label}: expected ${expected} frames, got ${actual}`);
  }
  return errors;
}

export function validateAodPixelRatio(litPixels, totalPixels) {
  const errors = [];
  const ratio = totalPixels > 0 ? litPixels / totalPixels : 0;
  if (ratio > MAX_AOD_PIXEL_RATIO) {
    errors.push(`AOD lit-pixel ratio ${(ratio * 100).toFixed(1)}% exceeds ${(MAX_AOD_PIXEL_RATIO * 100)}%`);
  }
  return errors;
}
