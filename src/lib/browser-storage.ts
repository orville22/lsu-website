// Browsers can deny storage in private or restricted contexts. Quiz server saves still work.
export function readDraft(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
export function writeDraft(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Server persistence remains available. */
  }
}
export function clearDraft(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* Nothing accessible to clear. */
  }
}
