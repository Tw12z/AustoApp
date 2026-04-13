// Austo26 - Satış Seed (Mevcut verileri kullanarak)
const BASE = "http://localhost:5202/api";
const ok  = (msg) => console.log(`\x1b[32m✓ ${msg}\x1b[0m`);
const err = (msg) => console.log(`\x1b[31m✗ ${msg}\x1b[0m`);

async function req(method, path, body, token) {
  const res = await fetch(`${BASE}/${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return res;
}

// ── Login ──────────────────────────────────────────────────
const loginRes = await req("POST", "auth/login", { userNameOrEmail: "admin", password: "Admin123!" });
const { accessToken: TOKEN } = await loginRes.json();
ok("Token alındı");

const get  = (path) => req("GET",  path, null, TOKEN).then(r => r.json());
const post = async (path, body) => {
  const res = await req("POST", path, body, TOKEN);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`POST /${path} → ${res.status}: ${JSON.stringify(json)}`);
  return json;
};

// ── Mevcut verileri çek ve ID'ye çevir ────────────────────
console.log("\n=== Mevcut veriler yükleniyor ===");

const [products, customers] = await Promise.all([
  get("products"),
  get("customers"),
]);

const byName = (arr, name) => arr.find(x => x.name === name)?.id || arr.find(x => x.fullName === name)?.id;

// Ürün ID'leri
const P = {};
const productMap = {
  P1:  "14 Ayar Taşlı Solitaire Yüzük",
  P2:  "18 Ayar Pırlanta Montür Yüzük",
  P3:  "14 Ayar Sade Alyans (Çift)",
  P4:  "14 Ayar Çift Sıra Zirkon Yüzük",
  P5:  "18 Ayar Söz Yüzüğü",
  P6:  "22 Ayar Hasır Bilezik (20cm)",
  P7:  "22 Ayar Burgu Bilezik",
  P8:  "14 Ayar Taşlı Kelepçe Bilezik",
  P9:  "22 Ayar Düz İnce Bilezik",
  P10: "14 Ayar Kalp Kolye + Zincir",
  P11: "18 Ayar Süslü Kolye Ucu + 50cm Zincir",
  P12: "14 Ayar Burç Kolye (Aslan)",
  P13: "14 Ayar Figaro Zincir 45cm",
  P14: "14 Ayar Taşlı Küpe (Siyah Taş)",
  P15: "18 Ayar Çember Küpe (3cm)",
  P16: "14 Ayar Sade Halka Küpe (1.5cm)",
  P17: "22 Ayar Halhal (Tamalı)",
  P18: "14 Ayar Üçlü Set (Kolye+Küpe+Bileklik)",
  P19: "18 Ayar İkili Set (Kolye+Küpe)",
  P20: "14 Ayar Nişan Seti (Alyans+Söz)",
};
for (const [key, name] of Object.entries(productMap)) {
  P[key] = products.find(p => p.name === name)?.id;
  if (!P[key]) err(`Ürün bulunamadı: ${name}`);
}
ok(`${products.length} ürün yüklendi`);

// Müşteri ID'leri
const C = {};
const customerMap = {
  CUS1: "Ayşe Kaya",
  CUS2: "Mehmet Yılmaz",
  CUS3: "Fatma Demir",
  CUS4: "Ali Çelik",
  CUS5: "Zeynep Arslan",
  CUS7: "Emine Öztürk",
  CUS8: "Hüseyin Aydın",
};
for (const [key, name] of Object.entries(customerMap)) {
  C[key] = customers.find(c => c.fullName === name)?.id;
  if (!C[key]) err(`Müşteri bulunamadı: ${name}`);
}
ok(`${customers.length} müşteri yüklendi`);

// ── Satışları oluştur ──────────────────────────────────────
console.log("\n=== Satışlar oluşturuluyor ===");

const sales = [
  // Ocak
  { customerId:C.CUS1, saleDate:"2026-01-10T14:30:00", items:[{productId:P.P10,quantity:1,unitPriceTRY:0},{productId:P.P16,quantity:1,unitPriceTRY:0}], notes:"Doğum günü hediyesi" },
  { customerId:C.CUS2, saleDate:"2026-01-18T11:00:00", items:[{productId:P.P3, quantity:1,unitPriceTRY:0}], notes:"Nişan alyansı" },
  { customerId:null,   saleDate:"2026-01-22T16:15:00", items:[{productId:P.P9, quantity:1,unitPriceTRY:0},{productId:P.P14,quantity:1,unitPriceTRY:0}], notes:"Nakit satış" },
  { customerId:C.CUS5, saleDate:"2026-01-29T10:00:00", items:[{productId:P.P6, quantity:1,unitPriceTRY:0},{productId:P.P7, quantity:1,unitPriceTRY:0}], notes:"Zeynep Hanım - koleksiyon alımı" },
  // Şubat
  { customerId:C.CUS7, saleDate:"2026-02-08T13:00:00", items:[{productId:P.P17,quantity:1,unitPriceTRY:0}], notes:"Kızı için düğün çeyizi" },
  { customerId:C.CUS4, saleDate:"2026-02-14T15:30:00", items:[{productId:P.P1, quantity:1,unitPriceTRY:0}], notes:"Sevgililer Günü hediyesi" },
  { customerId:null,   saleDate:"2026-02-19T12:00:00", items:[{productId:P.P12,quantity:1,unitPriceTRY:0},{productId:P.P16,quantity:2,unitPriceTRY:0}], notes:"" },
  { customerId:C.CUS8, saleDate:"2026-02-26T11:30:00", items:[{productId:P.P18,quantity:1,unitPriceTRY:0}], notes:"Annesi için üçlü set" },
  // Mart
  { customerId:C.CUS1, saleDate:"2026-03-08T14:00:00", items:[{productId:P.P15,quantity:1,unitPriceTRY:0}], notes:"Kadınlar Günü hediyesi" },
  { customerId:C.CUS3, saleDate:"2026-03-15T10:30:00", items:[{productId:P.P4, quantity:1,unitPriceTRY:0},{productId:P.P13,quantity:1,unitPriceTRY:0}], notes:"Annesi için yüzük ve zincir" },
  { customerId:C.CUS5, saleDate:"2026-03-22T16:00:00", items:[{productId:P.P9, quantity:2,unitPriceTRY:38500}], notes:"İkinci bilezik - indirimli" },
  { customerId:null,   saleDate:"2026-03-28T13:15:00", items:[{productId:P.P2, quantity:1,unitPriceTRY:0}], notes:"Pırlanta montür - nakit" },
  { customerId:C.CUS7, saleDate:"2026-03-31T11:00:00", items:[{productId:P.P6, quantity:1,unitPriceTRY:0},{productId:P.P9, quantity:1,unitPriceTRY:0}], notes:"Düğün için ek alım" },
  // Nisan
  { customerId:C.CUS2, saleDate:"2026-04-03T10:00:00", items:[{productId:P.P5, quantity:1,unitPriceTRY:0}], notes:"Nişan yüzüğü - 18 ayar" },
  { customerId:C.CUS4, saleDate:"2026-04-05T15:00:00", items:[{productId:P.P11,quantity:1,unitPriceTRY:0}], notes:"" },
  { customerId:null,   saleDate:"2026-04-08T12:30:00", items:[{productId:P.P14,quantity:2,unitPriceTRY:0},{productId:P.P16,quantity:2,unitPriceTRY:0}], notes:"Toplu küpe satışı - nakit" },
  { customerId:C.CUS1, saleDate:"2026-04-09T11:00:00", items:[{productId:P.P20,quantity:1,unitPriceTRY:0}], notes:"Nişan seti - Ayşe Hanım kızı için" },
];

let success = 0;
for (const sale of sales) {
  try {
    await post("sales", sale);
    ok(`Satış: ${sale.notes || sale.saleDate.slice(0,10)}`);
    success++;
  } catch(e) {
    err(`HATA: ${e.message}`);
  }
}

console.log(`\n\x1b[32m✓ ${success}/${sales.length} satış oluşturuldu.\x1b[0m\n`);
