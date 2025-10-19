// src/logger/index.js
const fs = require('fs-extra');
const path = require('path');
const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
// Optional Mongo transport
// const { MongoDB } = require('winston-mongodb');

const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), 'logs');
fs.ensureDirSync(LOG_DIR); // make sure /logs exists

// Helpful: include request-id if present
const requestIdFormat = format((info) => {
  if (info.reqId) {
    info.message = `[reqId=${info.reqId}] ${info.message}`;
  }
  return info;
});

const baseFormat = format.combine(
  requestIdFormat(),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  format.errors({ stack: true }),
  // JSON in prod; pretty in dev
  process.env.NODE_ENV === 'development'
    ? format.combine(
        format.colorize(),
        format.printf(({ level, message, timestamp, stack }) =>
          stack
            ? `${timestamp} ${level}: ${message}\n${stack}`
            : `${timestamp} ${level}: ${message}`
        )
      )
    : format.json()
);

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: baseFormat,
  defaultMeta: { service: 'ctrlz-api' },
  transports: [
    new transports.Console(),

    // Combined rotating log (weekly)
    new DailyRotateFile({
      dirname: LOG_DIR,
      filename: 'combined-%DATE%.log',
      datePattern: 'YYYY-[W]WW', // ISO week number => weekly files
      zippedArchive: true,
      maxFiles: '8w', // keep ~8 weeks
      level: process.env.LOG_LEVEL || 'info',
    }),

    // Errors rotating log (weekly)
    new DailyRotateFile({
      dirname: LOG_DIR,
      filename: 'errors-%DATE%.log',
      datePattern: 'YYYY-[W]WW',
      zippedArchive: true,
      maxFiles: '12w',
      level: 'error',
    }),
  ],
});

// OPTIONAL: also ship errors to MongoDB (uncomment + set MONGO_URI)
// logger.add(new MongoDB({
//   db: process.env.MONGO_URI,
//   options: { useUnifiedTopology: true },
//   collection: 'system_logs',
//   level: 'error',
//   tryReconnect: true,
//   decolorize: true,
//   metaKey: 'meta',
// }));

// Graceful handling for fatal errors
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection', { reason });
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { err });
  // Optional: process.exit(1) after flushing logs if you use a supervisor like PM2
});

module.exports = logger;
