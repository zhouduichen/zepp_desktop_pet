export const REQUIRED_FORMS = ["baby", "teen", "active", "steady", "explorer", "rare", "secret"];
export const REQUIRED_ACTIONS = ["wakeIdle", "tapReact", "feed", "happy", "noFood"];

export function validatePetPack(pack) {
  const errors = [];

  if (pack?.schemaVersion !== 1) errors.push("schemaVersion must be 1");
  if (!pack?.id) errors.push("id is required");
  if (!pack?.name) errors.push("name is required");
  for (const formId of REQUIRED_FORMS) {
    const form = pack?.forms?.[formId];
    if (!form) {
      errors.push(`forms.${formId} is required`);
      continue;
    }

    if (!form.static) errors.push(`forms.${formId}.static is required`);
    if (!form.aod) errors.push(`forms.${formId}.aod is required`);
    for (const actionName of REQUIRED_ACTIONS) {
      const path = `forms.${formId}.actions.${actionName}`;
      const action = form?.actions?.[actionName];
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
  }

  return errors;
}
