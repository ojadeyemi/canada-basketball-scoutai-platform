export const MIN_SEARCH_LENGTH = 2;
export const SEARCH_DEBOUNCE_DELAY = 300;
export const SCROLL_THRESHOLD = 100;
export const SEARCH_RESULTS_MAX_HEIGHT = "400px";

export const APP_CONFIG = {
  BETA_BADGE_TEXT: "Research Preview",
  FEEDBACK_URL: "https://forms.gle/GYFRnofDUpDNJ6ySA",
  FEEDBACK_TOAST_INTERVAL: 5 * 60 * 1000, // 5 minutes
  WELCOME_TOAST_STORAGE_KEY: "cb-scout-welcome-shown",
  AUTHOR: {
    NAME: "OJ Adeyemi",
    EMAIL: "ojieadeyemi@gmail.com",
    WEBSITE: "https://ojadeyemi.github.io/",
    LINKEDIN: "https://www.linkedin.com/in/oj-adeyemi/",
    GITHUB: "https://github.com/ojadeyemi",
  },
} as const;

export * from "./leagues";
export * from "./positions";
