import sanitizeHtml from "sanitize-html";

/* Blog bodies are authored in a rich-text editor and stored as HTML.
   Everything is re-sanitised on the server so stored content can never carry scripts. */
const options = {
  allowedTags: [
    "p", "br", "h2", "h3", "h4", "ul", "ol", "li", "blockquote", "strong", "b", "em", "i", "u", "s",
    "a", "img", "hr", "code", "pre", "figure", "figcaption",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height", "loading"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https"] },
  allowProtocolRelative: false,
  transformTags: {
    a: (tag, attribs) => {
      const href = attribs.href || "";
      const external = /^https?:/i.test(href);
      return {
        tagName: "a",
        attribs: { href, ...(external ? { target: "_blank", rel: "noopener noreferrer" } : {}) },
      };
    },
    img: (tag, attribs) => ({
      tagName: "img",
      attribs: { src: attribs.src || "", alt: attribs.alt || "", loading: "lazy" },
    }),
  },
};

export const cleanHtml = (html) => sanitizeHtml(String(html || ""), options);

export const plainText = (html) =>
  sanitizeHtml(String(html || ""), { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();

export const readMinutes = (html) => Math.max(1, Math.round(plainText(html).split(" ").filter(Boolean).length / 200));
