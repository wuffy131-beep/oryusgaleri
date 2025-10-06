import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || "default_secret"; // Fallback

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { username, password } = req.body;

  try {
    const { rows } = await pool.query(
      "SELECT * FROM admins WHERE username=$1 AND password=$2",
      [username, password]
    );

    if (rows.length === 0)
      return res.status(401).json({ error: "Geçersiz kullanıcı veya şifre" });

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "2h" });
    res.status(200).json({ success: true, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
