import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { rows } = await pool.query("SELECT aktif FROM status WHERE id=1");
    return res.status(200).json(rows[0]);
  }

  if (req.method === "POST") {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ error: "Token gerekli" });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded) return res.status(401).json({ error: "Geçersiz token" });

      const { aktif } = req.body;
      await pool.query("UPDATE status SET aktif=$1 WHERE id=1", [aktif]);

      await pool.query(
        "INSERT INTO logs (admin, action, detail) VALUES ($1, 'Durum', $2)",
        [decoded.username, aktif ? 'Site açıldı' : 'Site kapatıldı']
      );

      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(405).send("Method Not Allowed");
}
