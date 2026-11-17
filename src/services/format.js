/* SQLite stores UTC timestamps as "YYYY-MM-DD HH:MM:SS". */
export const toDate = (value) => (value ? new Date(`${String(value).replace(" ", "T")}Z`) : null);

export const formatDate = (value, options = { day: "numeric", month: "short", year: "numeric" }) => {
  const date = toDate(value);
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString("en-IN", options) : "";
};

export const formatDateTime = (value) =>
  formatDate(value, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
