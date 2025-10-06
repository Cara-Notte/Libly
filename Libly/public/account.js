const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const conn = require("./koneksi"); // import koneksi.js

const app = express();
const PORT = 3000;

app.use(cors());              // biar bisa diakses dari frontend
app.use(bodyParser.json());   // supaya req.body bisa terbaca JSON

// 🔹 Ambil semua user
app.get("/users", (req, res) => {
  conn.query("SELECT id, username FROM users", (err, results) => {
    if (err) {
      console.error("❌ Error get users:", err);
      return res.status(500).send("Gagal ambil data user");
    }
    res.json(results); // kirim hasil ke frontend
  });
});

// 🔹 Update username user
app.post("/update-username", (req, res) => {
  const { id, username } = req.body;

  if (!id || !username) {
    return res.status(400).send("⚠️ Data tidak lengkap");
  }

  conn.query(
    "UPDATE users SET username = ? WHERE id = ?",
    [username, id],
    (err, result) => {
      if (err) {
        console.error("❌ Error update username:", err);
        return res.status(500).send("Gagal update username");
      }

      if (result.affectedRows === 0) {
        return res.status(404).send("⚠️ User tidak ditemukan");
      }

      res.send("✅ Username berhasil diupdate!");
    }
  );
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
