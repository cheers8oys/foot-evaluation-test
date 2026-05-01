export function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function validatePhone(normalized: string): boolean {
  return /^010\d{8}$/.test(normalized);
}

export function validateName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 1 && trimmed.length <= 30;
}
