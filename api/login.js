import { Pool } from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { username, password } = req.body;

  try {
    const { rows } = await pool.query("SELECT * FROM admins WHERE username=$1", [username]);
    const admin = rows[0];
    if (!admin) return res.status(401).json({ error: "Kullanıcı bulunamadı" });

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) return res.status(401).json({ error: "Şifre hatalı" });

    const token = jwt.sign(
      { username: admin.username, can_view_logs: admin.can_view_logs },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
