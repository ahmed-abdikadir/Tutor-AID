export const SUIT_TYPES = ["Two-piece suit", "Three-piece suit", "Double-breasted suit", "Wedding suit", "Tuxedo", "Blazer / Sport coat", "Wedding Suits", "Evening Suits", "Business Suits", "Tailored Pants", "Linen", "Casual", "Premium Luxury Wool Suits", "Alterations"];
export const TIMES = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];
export const MEASUREMENTS = ["chest", "waist", "shoulder", "sleeve", "inseam", "height"] as const;
export const REQUIRED = ["name", "phone", "suitType", "date", "time"] as const;
export const FIELDS = [...REQUIRED, "email", "occasion", ...MEASUREMENTS, "notes"] as const;

export type Booking = Record<(typeof FIELDS)[number], string> & { id: string; createdAt: string };

export const isKenyanPhone = (v: string) => /^(\+?254|0)[17]\d{8}$/.test(v.replace(/[\s-]/g, ""));

export function normalizeKenyanPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("254") ? digits : `254${digits.slice(1)}`;
}

export function validateBooking(input: Record<string, unknown>): string | null {
  const missing = REQUIRED.filter((f) => !String(input[f] ?? "").trim());
  if (missing.length) return "Please fill in all required fields.";
  if (!isKenyanPhone(String(input.phone))) return "Please enter a valid Kenyan phone number (e.g. 0712 345 678).";
  return null;
}
