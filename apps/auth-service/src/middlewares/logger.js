import morgan from "morgan";

import logger from "../utils/logger.js";

morgan.token("request-id", (req) => req.id || "-");

const requestLogger = morgan(
  ":method :url :status :res[content-length] - :response-time ms request_id=:request-id",
  {
    stream: {
      write: (message) => {
        logger.info({ type: "http" }, message.trim());
      },
    },
  }
);

export default requestLogger;
