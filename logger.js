// logger.js
const { createLogger, transports, format } = require("winston");

const logger = createLogger({
  level: "info", // default logging level
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }), 
    format.printf(
      (info) =>
        `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`
    )
  ),
  transports: [
    new transports.Console(), // log in terminal
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/combined.log" })
  ],
  exceptionHandlers: [
    new transports.File({ filename: "logs/exceptions.log" })
  ]
});

module.exports = logger;
