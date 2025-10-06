const API_BASE = "/api";
let token = localStorage.getItem("token");

// Sayfa yüklendiğinde giriş kontrolü
document.addEventListener("DOMContentLoaded", () => {
  const loginSection = document.getElementById("loginSection");
  const adminPanel = document.getElementById("adminPanel");
  const logoutBtn = document.getElementById("logoutBtn");

  if (token) {
    loginSection.style.display = "none";
    adminPanel.style.display = "block";
    logoutBtn.style.display = "block";
    ilanlariGetir();
  }

  // Giriş işlemi
  document.getElementById("loginBtn")?.addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    const msg = document.getElementById("loginMessage");

    if (data.token) {
      localStorage.setItem("token", data.token);
      msg.textContent = "✅ Giriş başarılı!";
      setTimeout(() => location.reload(), 1000);
    } else {
      msg.textContent = `❌ Giriş başarısız: ${data.error || "Bilinmeyen hata"}`;
    }
  });

  // Çıkış yap
  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("token");
    location.reload();
  });

  // İlan ekle
  document.getElementById("ekleBtn")?.addEventListener("click", async () => {
    const baslik = document.getElementById("baslik").value.trim();
    const aciklama = document.getElementById("aciklama").value.trim();
    const instagram = document.getElementById("instagram").value.trim();
    const tiktok = document.getElementById("tiktok").value.trim();
    const file = document.getElementById("resim").files[0];
    const msg = document.getElementById("ekleMessage");

    if (!baslik || !aciklama) {
      msg.textContent = "⚠️ Başlık ve açıklama zorunludur.";
      return;
    }

    let resimBase64 = "";
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        resimBase64 = reader.result;
        await ilanEkle(baslik, aciklama, resimBase64, instagram, tiktok, msg);
      };
      reader.readAsDataURL(file);
    } else {
      await ilanEkle(baslik, aciklama, "", instagram, tiktok, msg);
    }
  });

  // Logları göster
  document.getElementById("loglariGoster")?.addEventListener("click", async () => {
    const res = await fetch(`${API_BASE}/logs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const logs = await res.json();
    const ul = document.getElementById("logListesi");
    ul.innerHTML = "";
    logs.forEach(l => {
      const li = document.createElement("li");
      li.textContent = `${l.created_at} - ${l.admin}: ${l.action} (${l.detail})`;
      ul.appendChild(li);
    });
  });
});

// 🔧 Yardımcı fonksiyonlar
async function ilanlariGetir() {
  const res = await fetch(`${API_BASE}/ilanlar`);
  const ilanlar = await res.json();
  const container = document.getElementById("ilanListesi");
  container.innerHTML = "";

  ilanlar.forEach(i => {
    const div = document.createElement("div");
    div.className = "ilan";
    div.innerHTML = `
      <h3>${i.baslik}</h3>
      <p>${i.aciklama}</p>
      ${i.resim ? `<img src="${i.resim}" width="200"/>` : ""}
      <p>📸 Instagram: ${i.instagram || "-"} | 🎬 TikTok: ${i.tiktok || "-"}</p>
      <button onclick="ilanSil(${i.id})">Sil</button>
    `;
    container.appendChild(div);
  });
}

async function ilanEkle(baslik, aciklama, resim, instagram, tiktok, msg) {
  try {
    const res = await fetch(`${API_BASE}/addIlan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ baslik, aciklama, resim, instagram, tiktok }),
    });

    const data = await res.json();
    if (data.success) {
      msg.textContent = "✅ İlan başarıyla eklendi!";
      ilanlariGetir();
    } else {
      msg.textContent = `❌ Hata: ${data.error || "Eklenemedi"}`;
    }
  } catch (err) {
    msg.textContent = "❌ Sunucuya bağlanılamadı.";
  }
}

async function ilanSil(id) {
  if (!confirm("Bu ilanı silmek istediğine emin misin?")) return;

  try {
    const res = await fetch(`${API_BASE}/deleteIlan?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) {
      alert("✅ İlan silindi!");
      ilanlariGetir();
    } else {
      alert(`❌ Silinemedi: ${data.error}`);
    }
  } catch {
    alert("❌ Sunucuya bağlanılamadı.");
  }
}
