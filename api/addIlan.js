// api/addIlan.js
import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token gerekli" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { baslik, aciklama, resim, fiyat, instagram, tiktok } = req.body;

    if (!baslik || !aciklama)
      return res.status(400).json({ error: "Eksik bilgiler" });

    await pool.query(
      "INSERT INTO ilanlar (baslik, aciklama, resim, fiyat, instagram, tiktok) VALUES ($1,$2,$3,$4,$5,$6)",
      [baslik, aciklama, resim, fiyat || null, instagram, tiktok]
    );

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
