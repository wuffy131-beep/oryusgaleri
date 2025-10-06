import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

export default async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).send("Method Not Allowed");

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token gerekli" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "ID gerekli" });

    const result = await pool.query(
      "DELETE FROM ilanlar WHERE id=$1 RETURNING *",
      [id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ error: "İlan bulunamadı" });

    await pool.query(
      "INSERT INTO logs (admin, action, detail) VALUES ($1, 'delete', $2)",
      [decoded.username, `İlan silindi: ${id}`]
    );

    res.status(200).json({ success: true, message: "İlan silindi" });
  } catch (err) {
    res.status(401).json({ error: "❌ Hata: " + err.message });
  }
}
