import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).send("Method Not Allowed");

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token gerekli" });

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    const { id } = req.query;

    await pool.query("DELETE FROM ilanlar WHERE id=$1", [id]);

    res.status(200).json({ success: true, message: "İlan silindi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
