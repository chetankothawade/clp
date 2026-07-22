import i18n from "i18n";
import path from "path";

import logger from "../utils/logger.js";

i18n.configure({
  locales: ["en"],
  directory: path.join(process.cwd(), "locales"),
  defaultLocale: "en",
  queryParameter: "lang",
  autoReload: true,
  syncFiles: true,
  logWarnFn: (msg) => logger.warn({ msg }, "i18n warning"),
  logErrorFn: (msg) => logger.error({ msg }, "i18n error"),
});

export default i18n.init;
