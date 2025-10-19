// src/middleware/httpLogger.js
const morgan = require('morgan');
const logger = require('../logger');

// Morgan stream that forwards to Winston as "http" level
const stream = {
  write: (message) => {
    // message already includes method url status response-time etc.
    logger.http ? logger.http(message.trim()) : logger.info(message.trim());
  },
};

// Include reqId in each log line
morgan.token('reqid', (req) => req.id);

// Suggested format (dev vs prod)
const devFormat = ':method :url :status :res[content-length] - :response-time ms (:reqid)';
const prodFormat =
  ':remote-addr :method :url :status :res[content-length] - :response-time ms :req[content-type] :reqid';

module.exports = process.env.NODE_ENV === 'development'
  ? morgan(devFormat, { stream })
  : morgan(prodFormat, { stream });
