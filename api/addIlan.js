import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token gerekli" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { baslik, aciklama, fiyat, resim, instagram, tiktok } = req.body;

    if (!baslik || !aciklama || !fiyat)
      return res.status(400).json({ error: "Eksik bilgi" });

    const result = await pool.query(
      "INSERT INTO ilanlar (baslik, aciklama, fiyat, resim, instagram, tiktok) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [baslik, aciklama, fiyat, resim, instagram, tiktok]
    );

    // 🧾 LOG EKLEME (detaylı içerik ile)
    await pool.query(
      "INSERT INTO logs (admin, action, detail) VALUES ($1, $2, $3)",
      [
        decoded.username,
        "İlan Eklendi",
        `Başlık: ${baslik} | Fiyat: ${fiyat} TL | Açıklama: ${aciklama}`,
      ]
    );

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
