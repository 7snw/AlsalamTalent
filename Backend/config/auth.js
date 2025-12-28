// Backend/config/auth.js
const AUTH = {
  ACCESS_TOKEN_TTL_SEC: parseInt(process.env.ACCESS_TOKEN_TTL_SEC || "900", 10),       // 15m
  REFRESH_TOKEN_TTL_SEC: parseInt(process.env.REFRESH_TOKEN_TTL_SEC || "604800", 10),  // 7d
  IDLE_TIMEOUT_SEC:      parseInt(process.env.SESSION_IDLE_TIMEOUT_SEC || "1800", 10), // 30m
  ABSOLUTE_TIMEOUT_SEC:  parseInt(process.env.SESSION_ABSOLUTE_TIMEOUT_SEC || "28800", 10), // 8h
  JWT_SECRET: process.env.JWT_SECRET, // required
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || undefined,
  IS_PROD: process.env.NODE_ENV === "production",
};

module.exports = { AUTH };
