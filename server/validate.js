/* Small, dependency-free input cleaning helpers. */

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
export const badRequest = (message) => new HttpError(400, message);

export const text = (value, max = 200) =>
  typeof value === "string" ? value.replace(/\u0000/g, "").trim().slice(0, max) : "";

export const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

/* Only http(s), mailto, tel, same-site paths and our own "default:<id>" image tokens. */
export const safeUrl = (value, max = 500) => {
  const v = text(value, max);
  if (!v) return "";
  if (/^default:[a-z0-9-]+$/.test(v)) return v;
  if (v.startsWith("/") && !v.startsWith("//")) return v;
  if (/^(https?:\/\/|mailto:|tel:)/i.test(v)) return v;
  throw badRequest(`Invalid link: "${v.slice(0, 40)}"`);
};

/* Tiny schema cleaner used for site-content sections. */
export const S = {
  str: (max = 200) => ({ t: "s", max }),
  url: (max = 500) => ({ t: "u", max }),
  arr: (item, max = 50) => ({ t: "a", item, max }),
  obj: (fields) => ({ t: "o", fields }),
};

export function clean(spec, value) {
  switch (spec.t) {
    case "s":
      return text(value, spec.max);
    case "u":
      return safeUrl(value, spec.max);
    case "a": {
      if (!Array.isArray(value)) throw badRequest("Expected a list.");
      if (value.length > spec.max) throw badRequest(`Too many items (max ${spec.max}).`);
      return value.map((item) => clean(spec.item, item));
    }
    case "o": {
      if (!value || typeof value !== "object" || Array.isArray(value)) throw badRequest("Expected an object.");
      const out = {};
      for (const [key, sub] of Object.entries(spec.fields)) out[key] = clean(sub, value[key]);
      return out;
    }
    default:
      throw badRequest("Unsupported field type.");
  }
}
