// ============================================================
// Austo26 — DEMO TEMİZLEME (seed-demo.mjs verilerini siler)
// Çalıştır: node seed-clean.mjs
// ============================================================
import { readFileSync, existsSync } from "fs";

const BASE = "http://localhost:5202/api";
const ok  = (m) => console.log(`\x1b[32m✓ ${m}\x1b[0m`);
const warn = (m) => console.warn(`\x1b[33m⚠ ${m}\x1b[0m`);
const err = (m) => console.error(`\x1b[31m✗ ${m}\x1b[0m`);

if (!existsSync("seed-demo-ids.json")) {
  console.error("\x1b[31m✗ seed-demo-ids.json bulunamadı. Önce seed-demo.mjs çalıştırın.\x1b[0m");
  process.exit(1);
}

const SEED = JSON.parse(readFileSync("seed-demo-ids.json", "utf8"));

async function req(method, path, body, token) {
  const res = await fetch(`${BASE}/${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 404) return null; // zaten silinmiş
  const json = await res.json().catch(() => ({}));
  if (!res.ok && res.status !== 204) throw new Error(`${method} /${path} → ${res.status}: ${JSON.stringify(json)}`);
  return json;
}

// ── LOGIN ──────────────────────────────────────────────────
console.log("\n\x1b[33m=== 1. Login ===\x1b[0m");
const loginRes = await req("POST", "auth/login", { userNameOrEmail: "admin", password: "Admin123!" });
const TOKEN = loginRes.accessToken;
ok("Token alındı");
const del = (path) => req("DELETE", path, null, TOKEN);
const cancel = (path) => req("POST", path, null, TOKEN);

let deleted = 0, failed = 0;

async function safeDelete(label, path) {
  try {
    await del(path);
    ok(`Silindi: ${label}`);
    deleted++;
  } catch(e) {
    err(`Silinemedi: ${label} — ${e.message}`);
    failed++;
  }
}

async function safeCancel(label, path) {
  try {
    const r = await cancel(path);
    if (r === null) { warn(`Zaten iptal/silinmiş: ${label}`); return; }
    ok(`İptal edildi: ${label}`);
    deleted++;
  } catch(e) {
    warn(`İptal edilemedi: ${label} — ${e.message}`);
    failed++;
  }
}

// ── SATIŞLAR İPTAL ────────────────────────────────────────
console.log("\n\x1b[33m=== 2. Satışlar İptal ===\x1b[0m");
for (const id of SEED.sales ?? []) {
  await safeCancel(`Satış ${id.slice(0,8)}`, `sales/${id}/cancel`);
}

// ── ALIŞLAR İPTAL ─────────────────────────────────────────
console.log("\n\x1b[33m=== 3. Alışlar İptal ===\x1b[0m");
for (const id of SEED.purchases ?? []) {
  await safeCancel(`Alış ${id.slice(0,8)}`, `purchases/${id}/cancel`);
}

// ── ÜRÜNLER SİL ───────────────────────────────────────────
console.log("\n\x1b[33m=== 4. Ürünler ===\x1b[0m");
for (const id of SEED.products ?? []) {
  await safeDelete(`Ürün ${id.slice(0,8)}`, `products/${id}`);
}

// ── MÜŞTERİLER SİL ────────────────────────────────────────
console.log("\n\x1b[33m=== 5. Müşteriler ===\x1b[0m");
for (const id of SEED.customers ?? []) {
  await safeDelete(`Müşteri ${id.slice(0,8)}`, `customers/${id}`);
}

// ── TEDARİKÇİLER SİL ──────────────────────────────────────
console.log("\n\x1b[33m=== 6. Tedarikçiler ===\x1b[0m");
for (const id of SEED.suppliers ?? []) {
  await safeDelete(`Tedarikçi ${id.slice(0,8)}`, `suppliers/${id}`);
}

// ── KONUMLAR SİL ──────────────────────────────────────────
console.log("\n\x1b[33m=== 7. Konumlar ===\x1b[0m");
for (const id of SEED.locations ?? []) {
  await safeDelete(`Konum ${id.slice(0,8)}`, `locations/${id}`);
}

// ── KATEGORİLER SİL ───────────────────────────────────────
console.log("\n\x1b[33m=== 8. Kategoriler ===\x1b[0m");
for (const id of SEED.categories ?? []) {
  await safeDelete(`Kategori ${id.slice(0,8)}`, `categories/${id}`);
}

// ── ÖZET ──────────────────────────────────────────────────
console.log("\n\x1b[32m══════════════════════════════════════════════════════\x1b[0m");
if (failed === 0) {
  console.log("\x1b[32m✓ TÜM DEMO VERİLERİ TEMİZLENDİ!\x1b[0m");
} else {
  console.log(`\x1b[33m⚠ Tamamlandı: ${deleted} işlem başarılı, ${failed} başarısız.\x1b[0m`);
  console.log("  Not: Bazı kayıtlar silinemeyebilir (FK kısıtlaması vb.).");
}
console.log("\n  Not: Finans/altın fiyat geçmişi manuel olarak silinmeli.");
console.log("  Not: İptal edilen satış/alış kayıtları veritabanında 'iptal' olarak kalır.");
console.log("\x1b[32m══════════════════════════════════════════════════════\x1b[0m\n");
