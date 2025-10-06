import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Kullanıcı adı veya şifre eksik" });

    const { rows } = await pool.query(
      "SELECT * FROM admins WHERE username=$1 AND password=$2",
      [username, password]
    );

    if (rows.length === 0)
      return res.status(401).json({ error: "Geçersiz kullanıcı veya şifre" });

    const token = jwt.sign(
      { username },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "2h" }
    );

    res.status(200).json({ token, username });
  } catch (err) {
    console.error("❌ login.js hata:", err);
    res.status(500).json({ error: err.message });
  }
}
