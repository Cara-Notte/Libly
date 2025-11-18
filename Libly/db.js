const path = require("path");
const mysql = require("mysql2/promise");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: path.join(__dirname, ".env") });
}

let pool;

function getConfig() {
  const isProd = process.env.NODE_ENV === "production";

  const cfg = {
    host: process.env.DB_HOST || (isProd ? null : "127.0.0.1"),
    port: Number(process.env.DB_PORT || (isProd ? NaN : 3306)),
    user: process.env.DB_USER || (isProd ? null : "libly"),
    password: process.env.DB_PASSWORD || (isProd ? null : "password123"),
    database: process.env.DB_NAME || (isProd ? null : "libly_library"),
    connectionLimit: Number(process.env.DB_CONN_LIMIT || 10),
    sslRequired: (process.env.DB_SSL || "").toLowerCase() === "true"
  };

  if (isProd) {
    const missing = [];
    if (!cfg.host) missing.push("DB_HOST");
    if (!cfg.port || Number.isNaN(cfg.port)) missing.push("DB_PORT");
    if (!cfg.user) missing.push("DB_USER");
    if (!cfg.password) missing.push("DB_PASSWORD");
    if (!cfg.database) missing.push("DB_NAME");
    if (missing.length) {
      throw new Error(
        `[DB] Missing required env vars in production: ${missing.join(", ")}`
      );
    }
  }

  return cfg;
}

function getPool() {
  if (!pool) {
    const cfg = getConfig();

    const ssl = cfg.sslRequired ? { rejectUnauthorized: true } : undefined;

    console.log("[DB] connecting", {
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      database: cfg.database,
      connectionLimit: cfg.connectionLimit,
      ssl: !!ssl
    });

    pool = mysql.createPool({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: cfg.password,
      database: cfg.database,
      waitForConnections: true,
      connectionLimit: cfg.connectionLimit,
      queueLimit: 0,
      ssl
    });
  }
  return pool;
}

module.exports = { getPool };
