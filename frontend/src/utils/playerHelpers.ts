/**
 * Player-specific utility functions for biographical data and display
 */

/**
 * Extracts player initials from full name
 * @example "John Smith" → "JS"
 * @example "Jean-Pierre Dupont" → "JD"
 */
export const getPlayerInitials = (fullName: string): string => {
  if (!fullName) return "??";

  const names = fullName
    .trim()
    .split(/[\s-]+/) // Split on spaces and hyphens
    .filter((n) => n.length > 0);

  if (names.length === 0) return "??";
  if (names.length === 1) return names[0].substring(0, 2).toUpperCase();

  // First and last name initials
  return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
};

/**
 * Generates a consistent color for player initials based on name hash
 * Returns Tailwind color class
 */
export const getInitialsColor = (fullName: string): string => {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-cyan-500",
  ];

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fullName.length; i++) {
    hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

/**
 * Formats a delta value with +/- sign
 * @example 2.5 → "+2.5"
 * @example -1.2 → "-1.2"
 */
export const formatDelta = (delta: number | undefined): string => {
  if (delta === undefined || delta === null) return "—";
  if (delta === 0) return "0.0";
  return delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1);
};

/**
 * Gets color class based on delta value
 * Positive = green, Negative = red, Zero = gray
 */
export const getDeltaColor = (delta: number | undefined): string => {
  if (delta === undefined || delta === null) return "text-gray-500";
  if (delta > 0) return "text-green-600";
  if (delta < 0) return "text-red-600";
  return "text-gray-500";
};

/**
 * Gets Tailwind background class for percentile
 */
export const getPercentileBgClass = (percentile: number): string => {
  if (percentile >= 75) return "bg-blue-500";
  if (percentile >= 50) return "bg-green-500";
  if (percentile >= 25) return "bg-yellow-500";
  return "bg-red-500";
};

/**
 * Formats age with "years" suffix
 * @example 23 → "23 yrs"
 */
export const formatAge = (age: number | undefined): string => {
  if (!age) return "";
  return `${age} yrs`;
};

/**
 * Formats birth date to readable format
 * @example "1998-05-15" → "May 15, 1998"
 */
export const formatBirthDate = (birthDate: string | undefined): string => {
  if (!birthDate) return "";

  try {
    const date = new Date(birthDate);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return birthDate;
  }
};

/**
 * Gets country flag emoji from ISO country code
 * Falls back to code if flag not found
 */
export const getCountryFlag = (countryCode: string | undefined): string => {
  if (!countryCode) return "";

  const flags: Record<string, string> = {
    CANADA: "🇨🇦",
    "UNITED STATES": "🇺🇸",
    "GREAT BRITAIN": "🇬🇧",
    FRANCE: "🇫🇷",
    AUSTRALIA: "🇦🇺",
    NIGERIA: "🇳🇬",
    SENEGAL: "🇸🇳",
    GHANA: "🇬🇭",
    CAMEROON: "🇨🇲",
    JAMAICA: "🇯🇲",
    "TRINIDAD AND TOBAGO": "🇹🇹",
    BRAZIL: "🇧🇷",
    ARGENTINA: "🇦🇷",
    SPAIN: "🇪🇸",
    ITALY: "🇮🇹",
    GERMANY: "🇩🇪",
    CHINA: "🇨🇳",
    JAPAN: "🇯🇵",
    "SOUTH KOREA": "🇰🇷",
  };

  return flags[countryCode.toUpperCase()] || countryCode;
};

/**
 * Gets full country name from ISO code
 */
export const getCountryName = (countryCode: string | undefined): string => {
  if (!countryCode) return "";

  const names: Record<string, string> = {
    CAN: "Canada",
    USA: "United States",
    GBR: "Great Britain",
    FRA: "France",
    AUS: "Australia",
    NGA: "Nigeria",
    SEN: "Senegal",
    GHA: "Ghana",
    CMR: "Cameroon",
    JAM: "Jamaica",
    TTO: "Trinidad and Tobago",
    BRA: "Brazil",
    ARG: "Argentina",
    ESP: "Spain",
    ITA: "Italy",
    GER: "Germany",
    CHN: "China",
    JPN: "Japan",
    KOR: "South Korea",
  };

  return names[countryCode.toUpperCase()] || countryCode;
};

/**
 * Formats percentile as string with suffix
 * @example 85 → "85th"
 */
export const formatPercentile = (percentile: number): string => {
  const suffix =
    percentile === 11 || percentile === 12 || percentile === 13
      ? "th"
      : ["st", "nd", "rd"][(((percentile % 100) - 20) % 10) - 1 || 3] || "th";
  return `${Math.round(percentile)}${suffix}`;
};
