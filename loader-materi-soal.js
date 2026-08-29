/* ============================================================
   CONTOH LOADER — materi.json & soal.json
   ------------------------------------------------------------
   Cara pakai:
   1. Simpan materi.json & soal.json di folder yang sama dengan index.html
   2. Beri id pada container di HTML, misalnya:
        <div id="container-materi-utama" class="materi-list"></div>
        <div id="container-latihan-harian"></div>
   3. Panggil fetch di bawah ini sebelum </body>, atau taruh di file JS
      terpisah lalu <script src="loader-contoh.js" defer></script>
   ============================================================ */

async function muatJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Gagal memuat ${path}`);
  return res.json();
}

function formatTanggal(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

/* Render kategori bertipe "list-baca" (materi utama, tombol "Baca Materi") */
function renderListBaca(container, items) {
  container.innerHTML = items.map(item => `
    <div class="materi-item">
      <span class="materi-badge">${item.badge}</span>
      <a href="${item.link}" class="materi-btn">${item.label_tombol}</a>
      ${item.tanggal_update ? `<div style="font-size:0.75rem;color:var(--text-light);margin-top:0.3rem">Diperbarui: ${formatTanggal(item.tanggal_update)}</div>` : ""}
    </div>
  `).join("");
}

/* Render kategori bertipe "list-link" (kuis interaktif, ide praktik GTK) */
function renderListLink(container, items) {
  container.innerHTML = `<ul>${items.map(item => `
    <li><a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.judul}</a></li>
  `).join("")}</ul>`;
}

/* Render kategori bertipe "list-tombol" (evaluasi) atau "list-download-tombol" (media interaktif) */
function renderListTombol(container, items) {
  container.innerHTML = `<div style="display:flex;flex-direction:column;gap:0.75rem;max-width:320px;">${items.map(item => `
    ${item.deskripsi ? `<p class="materi-desc">${item.deskripsi}</p>` : ""}
    <a href="${item.link}" target="_blank" rel="noopener noreferrer"
       style="background:var(--primary);color:var(--white);padding:0.75rem 1rem;border-radius:var(--radius-sm);font-size:0.95rem;text-align:center;font-weight:600;text-decoration:none;box-shadow:var(--shadow-sm);">
       ${item.icon ? item.icon + " " : ""}${item.label_tombol || item.judul}
    </a>
  `).join("")}</div>`;
}

/* Render soal akordeon (latihan harian, pakai <details>) */
function renderAkordeon(container, soalList) {
  container.innerHTML = soalList.map((s, i) => `
    <details>
      <summary>Soal ${i + 1}: ${s.pertanyaan}</summary>
      <p><strong>Pembahasan:</strong><br>${s.pembahasan}</p>
    </details>
  `).join("");
}

/* ------------------------------------------------------------
   Jalankan semua loader saat halaman siap
   ------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const materi = await muatJSON("materi.json");
    const soal = await muatJSON("soal.json");

    // Contoh pemetaan id kategori -> id container di HTML
    materi.kategori.forEach(kat => {
      const el = document.getElementById(`container-${kat.id}`);
      if (!el) return; // lewati jika container belum ada di HTML
      if (kat.tipe === "list-baca") renderListBaca(el, kat.items);
      if (kat.tipe === "list-download-tombol" || kat.tipe === "list-tombol") renderListTombol(el, kat.items);
      if (kat.tipe === "list-link") renderListLink(el, kat.items);
    });

    soal.kategori.forEach(kat => {
      const el = document.getElementById(`container-${kat.id}`);
      if (!el) return;
      if (kat.tipe === "akordeon") renderAkordeon(el, kat.soal);
      if (kat.tipe === "list-link") renderListLink(el, kat.items);
      if (kat.tipe === "list-tombol") renderListTombol(el, kat.items);
    });
  } catch (err) {
    console.error("Gagal memuat data materi/soal:", err);
  }
});
