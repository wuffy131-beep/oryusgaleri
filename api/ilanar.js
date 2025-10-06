import { Pool } from "pg";

// Veritabanı bağlantısı (her istekte tekrar bağlanmayı önlemek için global cache)
let cachedPool;

function getPool() {
  if (!cachedPool) {
    cachedPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // Neon için gerekli
    });
  }
  return cachedPool;
}

export default async function handler(req, res) {
  // Sadece GET isteklerine izin ver
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const pool = getPool();

  try {
    // Veritabanından ilanları çek
    const { rows } = await pool.query(`
      SELECT id, baslik, aciklama, resim, instagram, tiktok, created_at
      FROM ilanlar
      ORDER BY id DESC
    `);

    // Başarılı yanıt döndür
    res.status(200).json(rows);
  } catch (err) {
    console.error("❌ İlanlar çekilirken hata:", err);
    res.status(500).json({ error: err.message });
  }
}
