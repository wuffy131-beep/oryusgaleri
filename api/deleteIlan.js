import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token gerekli" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id } = req.query;

    if (!id) return res.status(400).json({ error: "ID gerekli" });

    const ilan = await pool.query("DELETE FROM ilanlar WHERE id=$1 RETURNING *", [id]);
    if (ilan.rowCount === 0)
      return res.status(404).json({ error: "İlan bulunamadı" });

    await pool.query(
      "INSERT INTO logs (admin, action, detail) VALUES ($1, $2, $3)",
      [decoded.username, "İlan silindi", ilan.rows[0].baslik]
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ deleteIlan.js hata:", err);
    res.status(500).json({ error: err.message });
  }
}
