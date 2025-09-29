/*
 * Database connection helper for Libly
 *
 * This module loads environment variables from a .env file located in the
 * same directory as server.js and establishes a connection pool to a
 * MySQL/MariaDB database using mysql2/promise.  The pool is created
 * lazily to ensure that environment variables are loaded before we read
 * them.  A small connection limit is used by default to avoid
 * exhausting local resources during development; adjust DB_CONN_LIMIT
 * in your .env as needed for production.
 */

const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

// Load environment variables from .env in this directory.  If the file
// does not exist or variables are missing, sensible defaults defined
// below will be used.  You can override by specifying DB_HOST,
// DB_USER, DB_PASSWORD, DB_NAME, DB_PORT and DB_CONN_LIMIT in your
// environment or .env file.
dotenv.config({ path: path.join(__dirname, '.env') });

let pool = null;

function getPool() {
  if (!pool) {
    const {
      DB_HOST = '127.0.0.1',
      DB_PORT = '3306',
      DB_USER = 'root',
      DB_PASSWORD = '',
      DB_NAME = 'online_library',
      DB_CONN_LIMIT = '10'
    } = process.env;

    // Log which credentials are being used (without revealing password)
    console.log('[DB] connecting', { host: DB_HOST, port: DB_PORT, user: DB_USER, database: DB_NAME });

    pool = mysql.createPool({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: Number(DB_CONN_LIMIT),
      queueLimit: 0
    });
  }
  return pool;
}

module.exports = { getPool };