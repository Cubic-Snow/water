const CSV_URL = "./data/shops.csv";

function $(id){ return document.getElementById(id); }
function esc(s){ return String(s ?? "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

function uniq(arr){
  return Array.from(new Set(arr.filter(v => v !== null && v !== undefined && String(v).trim() !== ""))).sort();
}

function loadCSV(){
  return new Promise((resolve, reject) => {
    Papa.parse(CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (err) => reject(err)
    });
  });
}

function toTelLink(phone){
  const p = String(phone ?? "").replace(/\s+/g,"");
  return p ? `tel:${p}` : "";
}

function renderIndex(rows){
  const qEl = $("q");
  const catEl = $("category");
  const listEl = $("list");
  const countEl = $("count");
  const clearEl = $("clear");

  const categories = uniq(rows.map(r => r.category));
  catEl.innerHTML = `<option value="">全部類別</option>` + categories.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join("");

  function match(r){
    const q = (qEl.value || "").trim().toLowerCase();
    const cat = (catEl.value || "").trim();
    if (cat && String(r.category || "").trim() !== cat) return false;
    if (!q) return true;

    const hay = [
      r.name, r.address, r.phone, r.category, r.status, r.hours_hint
    ].join(" ").toLowerCase();
    return hay.includes(q);
  }

  function draw(){
    const filtered = rows.filter(match);
    countEl.textContent = `目前顯示：${filtered.length} 筆`;
    listEl.innerHTML = filtered.map(r => {
      const id = encodeURIComponent(r.id);
      const name = esc(r.name || "(未命名)");
      const addr = esc(r.address || "");
      const phone = esc(r.phone || "");
      const rating = r.rating ? esc(r.rating) : "";
      const reviews = r.reviews ? esc(r.reviews) : "";
      const cat = esc(r.category || "");
      const gmaps = r.gmaps_url ? esc(r.gmaps_url) : "";

      const ratingLine = (rating || reviews) ? `<div class="line muted">⭐ ${rating || "-"} (${reviews || "0"}) · ${cat}</div>` : `<div class="line muted">${cat}</div>`;
      const addrLine = addr ? `<div class="line">地址：<a href="${gmaps || "#"}" target="_blank" rel="noreferrer">${addr}</a></div>` : "";
      const phoneLine = phone ? `<div class="line">電話：<a href="${toTelLink(phone)}">${phone}</a></div>` : "";

      return `
        <div class="item">
          <h3>${name}</h3>
          ${ratingLine}
          ${addrLine}
          ${phoneLine}
          <div class="line"><a href="./store.html?id=${id}">查看詳細 →</a></div>
        </div>
      `;
    }).join("");
  }

  qEl.addEventListener("input", draw);
  catEl.addEventListener("change", draw);
  clearEl.addEventListener("click", () => { qEl.value=""; catEl.value=""; draw(); });

  draw();
}

function renderStore(rows){
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const row = rows.find(r => String(r.id) === String(id));

  if (!row) {
    $("name").textContent = "找不到資料";
    $("meta").textContent = "";
    $("content").innerHTML = `<p>請回到 <a href="./index.html">總覽頁</a> 重新選擇。</p>`;
    return;
  }

  $("name").textContent = row.name || "水電行資訊";
  $("meta").textContent = `資料編號：${row.id || ""}`;

  const entries = [
    ["類別", row.category],
    ["評分", row.rating ? `${row.rating} (${row.reviews || 0})` : ""],
    ["地址", row.address ? `<a href="${esc(row.gmaps_url || "#")}" target="_blank" rel="noreferrer">${esc(row.address)}</a>` : ""],
    ["電話", row.phone ? `<a href="${toTelLink(row.phone)}">${esc(row.phone)}</a>` : ""],
    ["營業狀態", row.status],
    ["營業提示", row.hours_hint],
    ["Google 地圖", row.gmaps_url ? `<a href="${esc(row.gmaps_url)}" target="_blank" rel="noreferrer">開啟 Google Maps</a>` : ""],
  ].filter(([k,v]) => v && String(v).trim() !== "");

  $("content").innerHTML = `
    <div class="kv">
      ${entries.map(([k,v]) => `<div>${esc(k)}</div><div>${typeof v === "string" && v.includes("<a ") ? v : esc(v)}</div>`).join("")}
    </div>
  `;
}

(async function main(){
  const rows = await loadCSV();
  // Normalize: ensure keys exist
  const normalized = rows.map(r => ({
    id: r.id ?? "",
    name: r.name ?? "",
    rating: r.rating ?? "",
    reviews: r.reviews ?? "",
    category: r.category ?? "",
    address: r.address ?? "",
    status: r.status ?? "",
    hours_hint: r.hours_hint ?? "",
    phone: r.phone ?? "",
    gmaps_url: r.gmaps_url ?? ""
  }));

  if (document.getElementById("list")) renderIndex(normalized);
  if (document.getElementById("content")) renderStore(normalized);
})().catch(err => {
  console.error(err);
  const el = document.body;
  const box = document.createElement("div");
  box.className = "wrap";
  box.innerHTML = `<p>載入資料失敗：${esc(err?.message || err)}</p>`;
  el.prepend(box);
});
