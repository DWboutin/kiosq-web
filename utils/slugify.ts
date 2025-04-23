/**
 * Slugify and unslugify utilities for French and English strings
 */

/**
 * Converts a string to a URL-friendly slug
 * Handles French and English characters, removing accents
 */
export const slugify = (text: string) => {
  return text
    .toString()
    .normalize("NFD") // Split accented characters
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^\w-]+/g, "") // Remove non-word chars
    .replace(/--+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+/, "") // Trim hyphens from start
    .replace(/-+$/, ""); // Trim hyphens from end
};

/**
 * Converts a slug back to a readable string with spaces
 */
export const unslugify = (slug: string) => {
  return slug
    .replace(/-/g, " ") // Replace hyphens with spaces
    .replace(/\b\w/g, (c) => c.toUpperCase()); // Capitalize first letter of each word
};
