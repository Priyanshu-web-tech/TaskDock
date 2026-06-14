const { env } = require("process");

const allowedOrigins = env.ALLOWED_ORIGINS
  ? env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:5174", "http://localhost:3001"];

module.exports = {
  development: {
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
    host: env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    allowedOrigins,
    serverRedirectURI: env.SERVER_REDIRECT_URI || "http://localhost:3001",
  },
  production: {
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
    host: env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    allowedOrigins,
    serverRedirectURI: env.SERVER_REDIRECT_URI || "http://localhost:3001",
  },
};
