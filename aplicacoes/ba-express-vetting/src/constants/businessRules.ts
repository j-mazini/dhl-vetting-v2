/**
 * Central place for static business rules and structural frontend constants.
 * Avoids “magic strings” and keeps maintenance in one place.
 */
export const BUSINESS_RULES = {
  /** Route maps for app navigation */
  ROUTE: {
    HOME: "/",
    ABOUT: "/about",
    FEATURES: "/features",
    CONTACT: "/contact",
  },
} as const;
