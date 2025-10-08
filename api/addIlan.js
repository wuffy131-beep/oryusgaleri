// api/addIlan.js
import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  // CORS için OPTIONS metoduna izin ver
  if (req.method === "OPTIONS") {
    return res.status(200).setHeader("Access-Control-Allow-Origin", "*")
      .setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
      .setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
      .end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // CORS header’ları
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token gerekli" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) return res.status(401).json({ error: "Geçersiz token" });

    const { baslik, aciklama, fiyat, resim, instagram, tiktok } = req.body;

    if (!baslik || !aciklama) {
      return res.status(400).json({ error: "Eksik bilgiler" });
    }

    await pool.query(
      `INSERT INTO ilanlar (baslik, aciklama, fiyat, resim, instagram, tiktok)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [baslik, aciklama, fiyat || null, resim, instagram, tiktok]
    );

    return res.status(200).json({ ok: true, message: "İlan eklendi" });
  } catch (err) {
    console.error("addIlan error:", err);
    return res.status(500).json({ error: err.message });
  }
}
