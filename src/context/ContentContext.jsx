import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { company as defaultCompany, openLocations as defaultLocations } from "../data/company";
import { projects as defaultProjects } from "../data/projects";
import { amenities, faqs, hero, testimonials, values } from "../data/content";

/* Everything below is the content that ships with the website.
   Anything saved from the admin panel is layered on top of it. */
export const DEFAULTS = {
  company: defaultCompany,
  hero,
  projects: defaultProjects,
  amenities,
  values,
  testimonials,
  faqs,
  openLocations: defaultLocations,
};

const ContentContext = createContext(null);

/* Bundled photos get a new URL on every build, so the database stores "default:<id>" for them. */
const resolveImage = (image, id) => {
  if (typeof image === "string" && image.startsWith("default:")) {
    const original = defaultProjects.find((p) => p.id === image.slice(8) || p.id === id);
    return original?.image || "";
  }
  return image;
};

export const toStoredImage = (image) => {
  const original = defaultProjects.find((p) => p.image === image);
  return original ? `default:${original.id}` : image;
};

function merge(overrides) {
  const o = overrides || {};
  return {
    company: {
      ...DEFAULTS.company,
      ...(o.company || {}),
      socials: { ...DEFAULTS.company.socials, ...(o.company?.socials || {}) },
    },
    hero: { ...DEFAULTS.hero, ...(o.hero || {}) },
    projects: (o.projects || DEFAULTS.projects).map((p) => ({ ...p, image: resolveImage(p.image, p.id) })),
    amenities: o.amenities || DEFAULTS.amenities,
    values: o.values || DEFAULTS.values,
    testimonials: o.testimonials || DEFAULTS.testimonials,
    faqs: o.faqs || DEFAULTS.faqs,
    openLocations: o.openLocations || DEFAULTS.openLocations,
  };
}

export function ContentProvider({ children }) {
  const [overrides, setOverrides] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setOverrides(await api.get("/content"));
    } catch {
      /* API unreachable: the site keeps running on its built-in content */
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ ...merge(overrides), overrides: overrides || {}, refresh }),
    [overrides, refresh]
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used inside ContentProvider");
  return ctx;
}
