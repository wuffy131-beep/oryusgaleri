import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token gerekli" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) return res.status(401).json({ error: "Geçersiz token" });

    const { baslik, aciklama, resim, instagram, tiktok } = req.body;
    if (!baslik || !aciklama)
      return res.status(400).json({ error: "Eksik bilgiler" });

    const result = await pool.query(
      "INSERT INTO ilanlar (baslik, aciklama, resim, instagram, tiktok) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [baslik, aciklama, resim, instagram, tiktok]
    );

    await pool.query(
      "INSERT INTO logs (admin, action, detail) VALUES ($1, $2, $3)",
      [decoded.username, "Yeni ilan eklendi", baslik]
    );

    res.status(201).json({ success: true, ilan: result.rows[0] });
  } catch (err) {
    console.error("❌ addIlan.js hata:", err);
    res.status(500).json({ error: err.message });
  }
}
