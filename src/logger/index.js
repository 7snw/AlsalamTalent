const fs = require('fs-extra');
const path = require('path');
const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), 'logs');
fs.ensureDirSync(LOG_DIR); 


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

 
    new DailyRotateFile({
      dirname: LOG_DIR,
      filename: 'combined-%DATE%.log',
      datePattern: 'YYYY-[W]WW', 
      zippedArchive: true,
      maxFiles: '8w', 
      level: process.env.LOG_LEVEL || 'info',
    }),

  
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
