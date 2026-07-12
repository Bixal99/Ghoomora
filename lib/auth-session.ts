const DAY_SECONDS = 24 * 60 * 60;

function parseDays(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

/** Persistent session length when "Remember me" is checked. Default: 30 days. */
export function getRememberMeMaxAgeSeconds() {
  return parseDays(process.env.AUTH_REMEMBER_ME_MAX_AGE_DAYS, 30) * DAY_SECONDS;
}

/** Short session length when "Remember me" is unchecked. Default: 1 day. */
export function getDefaultMaxAgeSeconds() {
  return parseDays(process.env.AUTH_DEFAULT_MAX_AGE_DAYS, 1) * DAY_SECONDS;
}
