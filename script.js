// 🌙 Tema
const themeButton = document.getElementById("themeButton");
themeButton?.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
});
if (localStorage.getItem("theme") === "dark") document.body.classList.add("dark");

// 🔐 Admin Login
const loginBtn = document.getElementById("loginBtn");
const loginResult = document.getElementById("loginResult");

loginBtn?.addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    localStorage.setItem("token", data.token);
    localStorage.setItem("username", username);

    loginResult.textContent = "✅ Giriş başarılı!";
    document.getElementById("adminLogin").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";

    ilanlariGetir();
    if (username === "wuffymucuk") loglariGetir();
  } catch (err) {
    loginResult.textContent = "❌ Giriş başarısız: " + err.message;
  }
});

// 🚗 İlan Ekleme
const ilanEkleBtn = document.getElementById("ilanEkleBtn");
ilanEkleBtn?.addEventListener("click", async () => {
  const baslik = document.getElementById("baslik").value.trim();
  const aciklama = document.getElementById("aciklama").value.trim();
  const resimDosya = document.getElementById("resim").files[0];
  const instagram = document.getElementById("instagram").value.trim();
  const tiktok = document.getElementById("tiktok").value.trim();
  const ilanSonuc = document.getElementById("ilanSonuc");

  if (!baslik || !aciklama) {
    ilanSonuc.textContent = "❌ Lütfen başlık ve açıklama girin.";
    return;
  }

  let resimBase64 = "";
  if (resimDosya) {
    resimBase64 = await toBase64(resimDosya);
  }

  try {
    const res = await fetch("/api/addIlan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ baslik, aciklama, resim: resimBase64, instagram, tiktok }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    ilanSonuc.textContent = "✅ " + data.message;
    ilanlariGetir();
  } catch (err) {
    ilanSonuc.textContent = "❌ Hata: " + err.message;
  }
});

// 🔄 İlanları Listele
async function ilanlariGetir() {
  const ilanListesi = document.getElementById("ilanListesi");
  ilanListesi.innerHTML = "Yükleniyor...";
  try {
    const res = await fetch("/api/ilanlar");
    const data = await res.json();
    ilanListesi.innerHTML = "";
    data.forEach((ilan) => {
      const card = document.createElement("div");
      card.className = "ilan";
      card.innerHTML = `
        <img src="${ilan.resim || "https://via.placeholder.com/300"}" />
        <h3>${ilan.baslik}</h3>
        <p>${ilan.aciklama}</p>
        <div class="ilan-links">
          ${ilan.instagram ? `<a href="https://instagram.com/${ilan.instagram.replace("@","")}">📷</a>` : ""}
          ${ilan.tiktok ? `<a href="https://tiktok.com/@${ilan.tiktok.replace("@","")}">🎵</a>` : ""}
        </div>
        ${
          localStorage.getItem("username") === "AhmetYusufGencan" ||
          localStorage.getItem("username") === "wuffymucuk"
            ? `<button onclick="ilanSil(${ilan.id})">🗑️ Sil</button>`
            : ""
        }
      `;
      ilanListesi.appendChild(card);
    });
  } catch (err) {
    ilanListesi.innerHTML = `<p style="color:red;">❌ ${err.message}</p>`;
  }
}

// 🗑️ İlan Silme
async function ilanSil(id) {
  if (!confirm("Bu ilanı silmek istiyor musunuz?")) return;
  try {
    const res = await fetch(`/api/deleteIlan?id=${id}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    alert("✅ " + data.message);
    ilanlariGetir();
  } catch (err) {
    alert("❌ " + err.message);
  }
}

// 📜 Logları Görüntüleme (Sadece wuffymucuk)
async function loglariGetir() {
  const logSection = document.getElementById("logSection");
  const logListesi = document.getElementById("logListesi");
  logSection.style.display = "block";

  try {
    const res = await fetch("/api/logs", {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    });
    const data = await res.json();
    logListesi.innerHTML = "";
    data.forEach((log) => {
      const div = document.createElement("div");
      div.textContent = `🕒 ${log.created_at} | 👤 ${log.admin} | ${log.action} - ${log.detail}`;
      logListesi.appendChild(div);
    });
  } catch (err) {
    logListesi.innerHTML = "❌ Loglar yüklenemedi.";
  }
}

// 🔄 Yardımcı: Base64 dönüştür
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 🚪 Çıkış
document.getElementById("cikisBtn")?.addEventListener("click", () => {
  localStorage.clear();
  location.reload();
});
