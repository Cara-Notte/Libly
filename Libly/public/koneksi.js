const mysql = require("mysql2");

const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "online_library"
});

conn.connect(err => {
  if (err) {
    console.error("❌ Koneksi database gagal:", err);
    return;
  }
  console.log("✅ Terkoneksi ke database online_library");
});

module.exports = conn;
