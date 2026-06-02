const pad2 = (value) => String(value).padStart(2, "0");

export function toDateKey(date) {
  return `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}`;
}
