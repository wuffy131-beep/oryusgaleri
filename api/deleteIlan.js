import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).send("Method Not Allowed");

  const auth = req.headers.authorization;
  if (!auth) return res.status(401).send("Token gerekli");

  try {
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id } = req.query;

    await pool.query("DELETE FROM ilanlar WHERE id=$1", [id]);
    await pool.query(
      "INSERT INTO logs (admin_username, action, details) VALUES ($1,$2,$3)",
      [decoded.username, "ilan_delete", JSON.stringify({ id })]
    );

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
