const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const conn = require("./koneksi");

const app = express();
const PORT = 3000;

app.use(cors());              
app.use(bodyParser.json());  

app.get("/users", (req, res) => {
  conn.query("SELECT id, username FROM users", (err, results) => {
    if (err) {
      console.error("❌ Error get users:", err);
      return res.status(500).send("Gagal ambil data user");
    }
    res.json(results);
  });
});

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

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
