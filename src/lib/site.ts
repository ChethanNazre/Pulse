/**
 * Public site details used by metadata, the footer and the legal pages.
 * Set these in .env.local and in your host's environment settings before launch.
 * `npm run launch-check` fails until they are set.
 */
export const SITE_NAME = "Pulse";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const OPERATOR_NAME = process.env.NEXT_PUBLIC_SITE_OPERATOR || SITE_NAME;
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";
export const LEGAL_UPDATED = "5 October 2026";
