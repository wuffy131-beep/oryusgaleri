document.addEventListener("DOMContentLoaded", () => {
  ilanlariGetir();

  const temaBtn = document.getElementById("temaBtn");
  temaBtn.addEventListener("click", () => {
    const mevcut = document.body.getAttribute("data-theme");
    if (mevcut === "dark") {
      document.body.removeAttribute("data-theme");
      temaBtn.textContent = "🌞";
    } else {
      document.body.setAttribute("data-theme", "dark");
      temaBtn.textContent = "🌙";
    }
  });
});

async function ilanlariGetir() {
  const ilanListesi = document.getElementById("ilanListesi");
  ilanListesi.innerHTML = "<div class='loading'>🚗 Yükleniyor...</div>";

  try {
    const res = await fetch("https://oryusgaleri.vercel.app/api/ilanlar");
    console.log("API Durumu:", res.status);

    if (!res.ok) throw new Error("Sunucudan geçerli yanıt alınamadı.");

    const data = await res.json();
    console.log("API Verisi:", data);

    if (!data || data.length === 0) {
      ilanListesi.innerHTML = "<p style='text-align:center;'>Henüz ilan eklenmemiş.</p>";
      return;
    }

    ilanListesi.innerHTML = "";
    data.forEach((ilan) => {
      const card = document.createElement("div");
      card.className = "ilan";
      card.innerHTML = `
        <img src="${ilan.resim || "https://via.placeholder.com/300"}" alt="İlan Görseli">
        <h3>${ilan.baslik}</h3>
        <p>${ilan.aciklama}</p>
        <div class="sosyal">
          <a href="https://www.instagram.com/${ilan.instagram}" target="_blank">📸 Instagram</a>
          <a href="https://www.tiktok.com/@${ilan.tiktok}" target="_blank">🎵 Tiktok</a>
        </div>
      `;
      ilanListesi.appendChild(card);
    });
  } catch (err) {
    console.error("Hata:", err);
    ilanListesi.innerHTML = `<p style='color:red; text-align:center;'>❌ Hata: ${err.message}</p>`;
  }
}
