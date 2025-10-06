// 🔗 Npoint API bağlantısı
const NPOINT_URL = "https://api.npoint.io/f154cae0f6b12dca533f";

// 👨‍💼 Admin bilgileri
const ADMINS = [
  { username: "AhmetYusufGencan", password: "admin1234" },
  { username: "wuffymucuk", password: "654321" },
];

let currentAdmin = null;

// 🔍 Npoint’ten ilanları getir
async function getAllData() {
  try {
    const res = await fetch(NPOINT_URL);
    return await res.json();
  } catch (err) {
    console.error("Veri çekilemedi:", err);
    return { ilanlar: [], iletisim: {} };
  }
}

// 💾 İlanları kaydet (iletisim alanını koruyarak)
async function saveIlanlar(yeniIlanlar) {
  const data = await getAllData();

  const yeniVeri = {
    ilanlar: yeniIlanlar,
    iletisim: data.iletisim || {
      instagram: "@oryusgaleri",
      tiktok: "@oryusgaleri2",
    },
  };

  await fetch(NPOINT_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(yeniVeri),
  });
}

// 📄 İlanları ekrana yaz
async function renderIlanlar(container, adminMode = false) {
  const data = await getAllData();
  const ilanlar = data.ilanlar || [];

  container.innerHTML = "";
  if (!ilanlar.length) {
    container.innerHTML = "<p>Henüz ilan bulunmamaktadır.</p>";
    return;
  }

  ilanlar.forEach((ilan) => {
    const div = document.createElement("div");
    div.className = "ilan";
    div.innerHTML = `
      <img src="${ilan.resim}" alt="${ilan.baslik}">
      <h3>${ilan.baslik}</h3>
      <p>${ilan.aciklama}</p>
      <p>
        📸 <a href="https://instagram.com/${ilan.instagram}" target="_blank">${ilan.instagram}</a> |
        🎵 <a href="https://tiktok.com/@${ilan.tiktok}" target="_blank">${ilan.tiktok}</a>
      </p>
      ${adminMode ? `<button class="sil" data-id="${ilan.id}">Sil</button>` : ""}
    `;
    container.appendChild(div);
  });

  // 🔴 Silme işlemi
  if (adminMode) {
    document.querySelectorAll(".sil").forEach((btn) =>
      btn.addEventListener("click", async (e) => {
        const id = Number(e.target.dataset.id);
        if (!confirm("Bu ilanı silmek istiyor musunuz?")) return;

        const data = await getAllData();
        const yeni = data.ilanlar.filter((x) => x.id !== id);
        await saveIlanlar(yeni);
        renderIlanlar(container, true);
      })
    );
  }
}

// 🏠 Ana sayfa yükleniyorsa ilanları göster
const ilanlarContainer = document.getElementById("ilanlarContainer");
if (ilanlarContainer) renderIlanlar(ilanlarContainer);

// 🔐 Admin girişi
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const u = document.getElementById("username").value.trim();
    const p = document.getElementById("password").value.trim();
    const admin = ADMINS.find((a) => a.username === u && a.password === p);

    if (!admin) {
      document.getElementById("loginMessage").textContent =
        "❌ Kullanıcı adı veya şifre hatalı!";
      return;
    }

    currentAdmin = admin;
    document.getElementById("loginSection").classList.add("hidden");
    document.getElementById("panelSection").classList.remove("hidden");
    renderIlanlar(document.getElementById("ilanListesiAdmin"), true);
  });
}

// ➕ İlan ekleme
const addForm = document.getElementById("addForm");
if (addForm) {
  addForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const baslik = document.getElementById("ilanBaslik").value.trim();
    const aciklama = document.getElementById("ilanAciklama").value.trim();
    const file = document.getElementById("ilanResim").files[0];

    if (!file) {
      alert("Lütfen bir resim seçin!");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const data = await getAllData();
      const yeniIlanlar = data.ilanlar || [];

      yeniIlanlar.push({
        id: Date.now(),
        baslik,
        aciklama,
        resim: reader.result,
        instagram: "oyrusgaleri",
        tiktok: "oyrusgaleri2",
      });

      await saveIlanlar(yeniIlanlar);
      alert("✅ İlan başarıyla eklendi!");
      renderIlanlar(document.getElementById("ilanListesiAdmin"), true);
      addForm.reset();
    };
    reader.readAsDataURL(file);
  });
}
