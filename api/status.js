// api/status.js
import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Helper: read setting
async function getSetting(key) {
  const r = await pool.query("SELECT value FROM settings WHERE key=$1", [key]);
  return r.rowCount ? r.rows[0].value : null;
}

// Helper: set setting
async function setSetting(key, value) {
  await pool.query(
    `INSERT INTO settings(key, value) VALUES($1,$2)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [key, value]
  );
}

export default async function handler(req, res) {
  // GET -> herkese açık: döndür -> { manualClosed: true|false, nowHour: N, autoClosed: true|false, closed: true|false }
  if (req.method === "GET") {
    try {
      const manual = (await getSetting("site_manual_closed")) || "false";
      const manualClosed = manual === "true";

      const now = new Date();
      const hour = now.getHours(); // local browser/server time; server uses UTC unless env adjusted
      // We assume server time corresponds to site timezone (if not, convert or store TZ)
      const openHour = 15; // inclusive
      const closeHour = 22; // exclusive
      const autoClosed = !(hour >= openHour && hour < closeHour);

      const closed = manualClosed || autoClosed;

      return res.status(200).json({
        manualClosed,
        nowHour: hour,
        autoClosed,
        closed,
        openHour,
        closeHour,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }

  // POST -> sadece admin (JWT) -> body { manualClosed: true|false }
  if (req.method === "POST") {
    try {
      const auth = req.headers.authorization || "";
      const token = auth.split(" ")[1];
      if (!token) return res.status(401).json({ error: "Token gerekli" });

      const secret = process.env.JWT_SECRET;
      if (!secret) return res.status(500).json({ error: "Server misconfigured: no JWT_SECRET" });

      const decoded = jwt.verify(token, secret);
      if (!decoded) return res.status(401).json({ error: "Geçersiz token" });

      const body = req.body || {};
      const manualClosed = body.manualClosed === true || body.manualClosed === "true";

      await setSetting("site_manual_closed", manualClosed ? "true" : "false");

      // log could be added here (logs table) if you have logs table
      return res.status(200).json({ ok: true, manualClosed });
    } catch (err) {
      console.error("status POST error:", err);
      if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token geçersiz" });
      }
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader("Allow", "GET, POST");
  res.status(405).end("Method Not Allowed");
}
