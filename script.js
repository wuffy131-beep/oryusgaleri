// =======================
// ORYUS GALERİ SCRIPT.JS
// =======================

// API URL base (Vercel kendi domaininde çalışır)
const API_BASE = "/api";

// =======================
// 🔐 ADMIN GİRİŞ
// =======================
async function adminLogin() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      alert("✅ Giriş başarılı!");
      window.location.href = "/admin.html";
    } else {
      alert("❌ Giriş başarısız: " + (data.error || "Bilinmeyen hata"));
    }
  } catch (err) {
    alert("❌ Sunucuya bağlanılamadı: " + err.message);
  }
}

// =======================
// 🚗 İLAN EKLEME
// =======================
async function ilanEkle() {
  const baslik = document.getElementById("baslik").value.trim();
  const aciklama = document.getElementById("aciklama").value.trim();
  const resim = document.getElementById("resim").value.trim();
  const instagram = document.getElementById("instagram").value.trim();
  const tiktok = document.getElementById("tiktok").value.trim();
  const token = localStorage.getItem("token");

  if (!baslik || !aciklama) {
    alert("⚠️ Başlık ve açıklama zorunludur!");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/addIlan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ baslik, aciklama, resim, instagram, tiktok }),
    });

    const data = await res.json();

    if (data.success) {
      alert("✅ İlan başarıyla eklendi!");
      loadIlanlar(); // listeyi yenile
    } else {
      alert("❌ Eklenemedi: " + (data.error || "Bilinmeyen hata"));
    }
  } catch (err) {
    alert("❌ Sunucu hatası: " + err.message);
  }
}

// =======================
// 🗑️ İLAN SİLME
// =======================
async function ilanSil(id) {
  const token = localStorage.getItem("token");
  if (!confirm("Bu ilanı silmek istediğine emin misin?")) return;

  try {
    const res = await fetch(`${API_BASE}/deleteIlan?id=${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    const data = await res.json();

    if (data.success) {
      alert("✅ İlan silindi!");
      loadIlanlar();
    } else {
      alert("❌ Silinemedi: " + (data.error || "Bilinmeyen hata"));
    }
  } catch (err) {
    alert("❌ Sunucu hatası: " + err.message);
  }
}

// =======================
// 📜 LOG GÖRÜNTÜLEME (sadece yetkili admin)
// =======================
async function loadLogs() {
  const token = localStorage.getItem("token");
  const container = document.getElementById("logs");

  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/logs`, {
      headers: { "Authorization": `Bearer ${token}` },
    });
    const data = await res.json();

    if (Array.isArray(data)) {
      container.innerHTML = data
        .map(
          (log) => `
          <div class="log-item">
            <b>${log.admin_username}</b> — ${log.action}<br>
            <small>${log.details}</small>
          </div>`
        )
        .join("");
    } else {
      container.innerHTML = `<p>❌ Log yüklenemedi: ${data.error || "Bilinmeyen hata"}</p>`;
    }
  } catch (err) {
    container.innerHTML = `<p>❌ Bağlantı hatası: ${err.message}</p>`;
  }
}

// =======================
// 🏠 ANA SAYFADA İLANLARI GÖSTERME
// =======================
async function loadIlanlar() {
  const container = document.getElementById("ilanlar");
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/ilanlar`);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = "<p>Henüz ilan bulunmuyor.</p>";
      return;
    }

    container.innerHTML = data
      .map(
        (ilan) => `
        <div class="ilan">
          <img src="${ilan.resim || "gorsel.png"}" alt="Araç Görseli">
          <h3>${ilan.baslik}</h3>
          <p>${ilan.aciklama}</p>
          <div class="contact">
            <a href="https://instagram.com/${ilan.instagram}" target="_blank">📸 Instagram</a>
            <a href="https://tiktok.com/@${ilan.tiktok}" target="_blank">🎵 TikTok</a>
          </div>
          ${
            localStorage.getItem("token")
              ? `<button onclick="ilanSil(${ilan.id})" class="sil">Sil</button>`
              : ""
          }
        </div>`
      )
      .join("");
  } catch (err) {
    container.innerHTML = `<p>❌ Veriler alınamadı: ${err.message}</p>`;
  }
}

// =======================
// SAYFA YÜKLENİNCE
// =======================
document.addEventListener("DOMContentLoaded", () => {
  loadIlanlar();
  loadLogs();
});
