import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).send("Method Not Allowed");

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token gerekli" });

    const decoded = jwt.verify(token, JWT_SECRET);

    const result = await pool.query(
      "SELECT admin, action, detail, created_at FROM logs ORDER BY created_at DESC LIMIT 100"
    );

    res.status(200).json(result.rows);
  } catch (err) {
    res.status(401).json({ error: "❌ Hata: " + err.message });
  }
}
