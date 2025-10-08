import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { username, password } = req.body;
  const { rows } = await pool.query(
    "SELECT * FROM admins WHERE username=$1 AND password=$2",
    [username, password]
  );

  if (rows.length === 0)
    return res.status(401).json({ error: "Geçersiz kullanıcı veya şifre" });

  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "4h" });
  res.status(200).json({ token });
}
