const REQUIRED_ACTIONS = ["wakeIdle", "tapReact", "feed", "happy", "noFood"];

export function validatePetPack(pack) {
  const errors = [];

  if (pack?.schemaVersion !== 1) errors.push("schemaVersion must be 1");
  if (!pack?.id) errors.push("id is required");
  if (!pack?.name) errors.push("name is required");
  if (!pack?.forms?.baby) errors.push("forms.baby is required");

  const baby = pack?.forms?.baby;
  if (baby && !baby.static) errors.push("forms.baby.static is required");
  if (baby && !baby.aod) errors.push("forms.baby.aod is required");
  for (const actionName of REQUIRED_ACTIONS) {
    const path = `forms.baby.actions.${actionName}`;
    const action = baby?.actions?.[actionName];
    if (!action) {
      errors.push(`${path} is required`);
      continue;
    }
    if (!action.prefix) {
      errors.push(`${path}.prefix is required`);
    }
    if (!Number.isInteger(action.frames) || action.frames < 8 || action.frames > 20) {
      errors.push(`${path}.frames must be between 8 and 20`);
    }
    if (!Number.isInteger(action.fps) || action.fps < 8 || action.fps > 12) {
      errors.push(`${path}.fps must be between 8 and 12`);
    }
  }

  return errors;
}
