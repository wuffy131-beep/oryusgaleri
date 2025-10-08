import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token gerekli" });

  try {
    jwt.verify(token, process.env.JWT_SECRET);

    const { baslik, aciklama, resim, instagram, tiktok } = req.body;

    await pool.query(
      "INSERT INTO ilanlar (baslik, aciklama, resim, instagram, tiktok) VALUES ($1, $2, $3, $4, $5)",
      [baslik, aciklama, resim, instagram, tiktok]
    );

    res.status(200).json({ success: true, message: "İlan eklendi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
