const DEFAULT_APP_TIMEZONE = "Asia/Kolkata";

export function getAppTimezone() {
  return process.env.APP_TIMEZONE || DEFAULT_APP_TIMEZONE;
}

export function initializeAppTimezone() {
  const timezone = getAppTimezone();
  process.env.TZ = timezone;
  return timezone;
}
