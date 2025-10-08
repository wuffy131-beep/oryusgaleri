// api/login.js
import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  // OPTIONS için CORS
  if (req.method === "OPTIONS") {
    return res.status(200).setHeader("Access-Control-Allow-Origin", "*")
      .setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
      .setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
      .end();
  }
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  try {
    const { username, password } = req.body;
    const { rows } = await pool.query(
      "SELECT * FROM admins WHERE username=$1 AND password=$2",
      [username, password]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: "Geçersiz kullanıcı veya şifre" });
    }
    const token = jwt.sign({ username }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });
    return res.status(200).json({ token });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ error: err.message });
  }
}
