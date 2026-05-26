// Ethiopian mobile: 09XXXXXXXX (10 digits) or +2519XXXXXXXX (13 chars)
export const ETHIOPIAN_PHONE_RE = /^(\+2519\d{8}|09\d{8})$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const EMAIL_MAX = 255;
export const NAME_MAX = 50;

export function validatePhone(raw: string, required = true): string | null {
  const v = raw.replace(/\s/g, "");
  if (!v) return required ? "Phone number is required" : null;
  if (!ETHIOPIAN_PHONE_RE.test(v))
    return "Use format 09XXXXXXXX or +2519XXXXXXXX";
  return null;
}

export function validateEmail(raw: string, required = true): string | null {
  const v = raw.trim();
  if (!v) return required ? "Email is required" : null;
  if (!EMAIL_RE.test(v)) return "Invalid email format";
  if (v.length > EMAIL_MAX) return "Email must be under 255 characters";
  return null;
}

export function validateUrl(raw: string, required = false): string | null {
  const v = raw.trim();
  if (!v) return required ? "Website URL is required" : null;
  try {
    const u = new URL(v);
    if (!["http:", "https:"].includes(u.protocol))
      return "URL must start with http:// or https://";
    return null;
  } catch {
    return "Invalid URL (e.g. https://example.com)";
  }
}

export function validatePassword(pw: string): string | null {
  if (!pw) return "Password is required";
  if (pw.length < 8) return "Must be at least 8 characters";
  if (!/[A-Z]/.test(pw)) return "Must include an uppercase letter";
  if (!/[a-z]/.test(pw)) return "Must include a lowercase letter";
  if (!/[0-9]/.test(pw)) return "Must include a number";
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw))
    return "Must include a special character";
  return null;
}

export function validateName(raw: string, label: string, required = true): string | null {
  const v = raw.trim();
  if (!v) return required ? `${label} is required` : null;
  if (v.length > NAME_MAX) return `${label} must be under ${NAME_MAX} characters`;
  return null;
}

// Ethiopian license plate: 2–3 uppercase letters + hyphen or space + 5 digits
// e.g. AA-12345, OR 54321, TGR-00001
export const ETHIOPIAN_PLATE_RE = /^[A-Z]{2,3}[\s-]\d{5}$/;

export function validateLicensePlate(raw: string): string | null {
  const v = raw.trim().toUpperCase();
  if (!v) return "License plate is required";
  if (!ETHIOPIAN_PLATE_RE.test(v))
    return 'Use format AA-12345 (2–3 letters, hyphen, 5 digits)';
  return null;
}
