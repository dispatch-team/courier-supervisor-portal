export interface NormalizedCourierProfile {
  id: number;
  company_name: string;
  company_address: string;
  status: string;
  company_logo_id: string | null;
  phone_number: string;
  email: string;
  website_url: string;
  rating_aggregate: number;
  rating_count: number;
  max_weight: number;
  base_price: number;
  weight_rate: number;
  distance_rate: number;
  time_rate: number;
  owner_supervisor_id: number;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function pickStr(obj: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (v === null || v === undefined) continue;
    const s = String(v).trim();
    if (s !== "") return s;
  }
  return "";
}

function pickNum(obj: Record<string, unknown>, ...keys: string[]): number {
  for (const k of keys) {
    const v = obj[k];
    if (v === null || v === undefined) continue;
    const n = Number(v);
    if (!isNaN(n)) return n;
  }
  return 0;
}

function pickBoolOrNull(obj: Record<string, unknown>, key: string): string | null {
  const v = obj[key];
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s || null;
}

export function courierApiErrorMessage(body: unknown): string {
  if (!isPlainObject(body)) return "Request failed";

  const msg =
    body.message ??
    body.error ??
    body.error_description ??
    body.detail;

  if (typeof msg === "string" && msg.trim()) return msg;
  if (Array.isArray(msg)) {
    const parts = msg
      .map((x) => (typeof x === "string" ? x : JSON.stringify(x)))
      .filter(Boolean);
    if (parts.length) return parts.join(", ");
  }

  if (isPlainObject(msg) && typeof msg.message === "string") return msg.message;

  return "Request failed";
}

export function isProfileIncomplete(profile: NormalizedCourierProfile): boolean {
  const required = [
    profile.company_name,
    profile.company_address,
    profile.phone_number,
    profile.email,
  ];
  return required.some((v) => !v || v.trim() === "");
}

function profileLooksLikeCourier(o: Record<string, unknown>): boolean {
  return (
    "company_name" in o ||
    "company_address" in o ||
    "phone_number" in o ||
    "email" in o ||
    "id" in o
  );
}

function extractProfilePayload(raw: unknown): Record<string, unknown> | null {
  if (!isPlainObject(raw)) return null;

  const candidates = ["data", "profile", "courier", "result", "payload"] as const;
  for (const key of candidates) {
    const inner = raw[key];
    if (isPlainObject(inner) && profileLooksLikeCourier(inner)) {
      return inner;
    }
  }

  if (profileLooksLikeCourier(raw)) return raw;

  const data = raw.data;
  if (isPlainObject(data)) return data;

  return raw;
}

export function normalizeCourierProfile(raw: unknown): NormalizedCourierProfile | null {
  const obj = extractProfilePayload(raw);
  if (!obj || !profileLooksLikeCourier(obj)) return null;

  return {
    id: pickNum(obj, "id"),
    company_name: pickStr(obj, "company_name", "companyName"),
    company_address: pickStr(obj, "company_address", "companyAddress"),
    status: pickStr(obj, "status"),
    company_logo_id: pickBoolOrNull(obj, "company_logo_id"),
    phone_number: pickStr(obj, "phone_number", "phoneNumber"),
    email: pickStr(obj, "email"),
    website_url: pickStr(obj, "website_url", "websiteUrl"),
    rating_aggregate: pickNum(obj, "rating_aggregate", "ratingAggregate"),
    rating_count: pickNum(obj, "rating_count", "ratingCount"),
    max_weight: pickNum(obj, "max_weight", "maxWeight"),
    base_price: pickNum(obj, "base_price", "basePrice"),
    weight_rate: pickNum(obj, "weight_rate", "weightRate"),
    distance_rate: pickNum(obj, "distance_rate", "distanceRate"),
    time_rate: pickNum(obj, "time_rate", "timeRate"),
    owner_supervisor_id: pickNum(obj, "owner_supervisor_id", "ownerSupervisorId"),
  };
}
