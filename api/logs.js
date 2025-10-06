import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token gerekli" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) return res.status(401).json({ error: "Geçersiz token" });

    const result = await pool.query(
      "SELECT admin, action, detail, created_at FROM logs ORDER BY created_at DESC LIMIT 100"
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ logs.js hata:", err);
    res.status(500).json({ error: err.message });
  }
}
