// 🌙 Tema değiştirici
const themeButton = document.getElementById("themeButton");
themeButton?.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
});
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

// 🚗 İlanları çekme
async function ilanlariGetir() {
  const ilanListesi = document.getElementById("ilanListesi");
  ilanListesi.innerHTML = "<p>Yükleniyor...</p>";

  try {
    const res = await fetch("/api/ilanlar");
    if (!res.ok) throw new Error("Sunucudan yanıt alınamadı");
    const data = await res.json();

    if (data.length === 0) {
      ilanListesi.innerHTML = "<p>Henüz ilan eklenmemiş.</p>";
      return;
    }

    ilanListesi.innerHTML = "";
    data.forEach((ilan) => {
      const card = document.createElement("div");
      card.className = "ilan";
      card.innerHTML = `
        <img src="${ilan.resim || "https://via.placeholder.com/300"}" alt="${ilan.baslik}" />
        <h3>${ilan.baslik}</h3>
        <p>${ilan.aciklama}</p>
        <div class="ilan-links">
          ${
            ilan.instagram
              ? `<a href="https://instagram.com/${ilan.instagram.replace(
                  "@",
                  ""
                )}" target="_blank">📷 Instagram</a>`
              : ""
          }
          ${
            ilan.tiktok
              ? `<a href="https://tiktok.com/@${ilan.tiktok.replace(
                  "@",
                  ""
                )}" target="_blank">🎵 TikTok</a>`
              : ""
          }
        </div>
      `;
      ilanListesi.appendChild(card);
    });
  } catch (err) {
    ilanListesi.innerHTML = `<p style="color:red;">❌ Hata: ${err.message}</p>`;
  }
}

// Sayfa yüklendiğinde ilanları getir
ilanlariGetir();
