// Austo26 - Gerçekçi Demo Veri Seed Script (Node.js)
const BASE = "http://localhost:5202/api";

const ok  = (msg) => console.log(`\x1b[32m✓ ${msg}\x1b[0m`);
const err = (msg) => console.log(`\x1b[31m✗ ${msg}\x1b[0m`);

async function post(path, body, token) {
  const res = await fetch(`${BASE}/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`POST /${path} → ${res.status}: ${JSON.stringify(json)}`);
  return json;
}

// ── 1. LOGIN ──────────────────────────────────────────────
console.log("\n=== 1. Login ===");
const loginRes = await post("auth/login", { userNameOrEmail: "admin", password: "Admin123!" });
const TOKEN = loginRes.accessToken;
ok("Token alındı");
const p = (path, body) => post(path, body, TOKEN);
const id = (res) => res.id;

// ── 2. KATEGORİLER ───────────────────────────────────────
console.log("\n=== 2. Kategoriler ===");
const CAT_YUZUK   = id(await p("categories", { name: "Yüzük"   })); ok(`Yüzük: ${CAT_YUZUK}`);
const CAT_BILEZIK = id(await p("categories", { name: "Bilezik" })); ok(`Bilezik: ${CAT_BILEZIK}`);
const CAT_KOLYE   = id(await p("categories", { name: "Kolye"   })); ok(`Kolye: ${CAT_KOLYE}`);
const CAT_KUPE    = id(await p("categories", { name: "Küpe"    })); ok(`Küpe: ${CAT_KUPE}`);
const CAT_HALHAL  = id(await p("categories", { name: "Halhal"  })); ok(`Halhal: ${CAT_HALHAL}`);
const CAT_SET     = id(await p("categories", { name: "Set"     })); ok(`Set: ${CAT_SET}`);

// ── 3. KONUMLAR ───────────────────────────────────────────
console.log("\n=== 3. Konumlar ===");
const LOC_V1   = id(await p("locations", { name: "Vitrin 1", description: "Ana vitrin" }));       ok(`Vitrin 1: ${LOC_V1}`);
const LOC_V2   = id(await p("locations", { name: "Vitrin 2", description: "Yan vitrin" }));       ok(`Vitrin 2: ${LOC_V2}`);
const LOC_KASA = id(await p("locations", { name: "Kasa",     description: "Değerli ürünler" }));  ok(`Kasa: ${LOC_KASA}`);
const LOC_DEPO = id(await p("locations", { name: "Depo",     description: "Stok deposu" }));      ok(`Depo: ${LOC_DEPO}`);

// ── 4. TEDARİKÇİLER ──────────────────────────────────────
console.log("\n=== 4. Tedarikçiler ===");
const SUP1 = id(await p("suppliers", { companyName: "Kapalıçarşı Altın A.Ş.",   contactName: "Hasan Usta",  phone: "02125120034", email: "info@kapalicarsi-altin.com", taxNumber: "1234567890" })); ok(`Kapalıçarşı Altın: ${SUP1}`);
const SUP2 = id(await p("suppliers", { companyName: "İstanbul Kuyum Toptan",    contactName: "Recep Bey",   phone: "02123340099", email: "recep@ikuyum.com",            taxNumber: "9876543210" })); ok(`İstanbul Kuyum: ${SUP2}`);
const SUP3 = id(await p("suppliers", { companyName: "Ege Kuyumculuk Ltd. Şti.", contactName: "Selma Hanım", phone: "02326540012", email: "selma@egekuyum.com",           taxNumber: "4567890123" })); ok(`Ege Kuyumculuk: ${SUP3}`);

// ── 5. MÜŞTERİLER ────────────────────────────────────────
console.log("\n=== 5. Müşteriler ===");
const CUS1 = id(await p("customers", { fullName: "Ayşe Kaya",      phone: "05321234567", email: "ayse.kaya@gmail.com",    notes: "Düzenli müşteri, 14 ayar tercih ediyor" })); ok(`Ayşe Kaya: ${CUS1}`);
const CUS2 = id(await p("customers", { fullName: "Mehmet Yılmaz",  phone: "05334567890", email: "m.yilmaz@hotmail.com",   notes: "Nişan yüzüğü için geldi" }));              ok(`Mehmet Yılmaz: ${CUS2}`);
const CUS3 = id(await p("customers", { fullName: "Fatma Demir",    phone: "05459876543", email: "",                       notes: "Annesi için hediye alıyor" }));             ok(`Fatma Demir: ${CUS3}`);
const CUS4 = id(await p("customers", { fullName: "Ali Çelik",      phone: "05367654321", email: "ali.celik@gmail.com",    notes: "" }));                                      ok(`Ali Çelik: ${CUS4}`);
const CUS5 = id(await p("customers", { fullName: "Zeynep Arslan",  phone: "05411112233", email: "zeynep.arslan@outlook.com", notes: "22 ayar bilezik koleksiyonu yapıyor" })); ok(`Zeynep Arslan: ${CUS5}`);
const CUS6 = id(await p("customers", { fullName: "İbrahim Şahin",  phone: "05523344556", email: "",                       notes: "Hurda altın getirdi" }));                   ok(`İbrahim Şahin: ${CUS6}`);
const CUS7 = id(await p("customers", { fullName: "Emine Öztürk",   phone: "05389990011", email: "emine.ozturk@yandex.com", notes: "Kızının düğünü için hazırlık yapıyor" })); ok(`Emine Öztürk: ${CUS7}`);
const CUS8 = id(await p("customers", { fullName: "Hüseyin Aydın",  phone: "05445566778", email: "h.aydin@gmail.com",      notes: "" }));                                      ok(`Hüseyin Aydın: ${CUS8}`);

// ── 6. ÜRÜNLER ────────────────────────────────────────────
console.log("\n=== 6. Ürünler ===");

// Yüzükler
const P1  = id(await p("products", { name: "14 Ayar Taşlı Solitaire Yüzük",       categoryId: CAT_YUZUK,   weightGram: 3.50, purity: 14, purchasePrice: 14350.00, salePrice: 17200.00, stockQuantity: 4,  barcode: "YZ001" })); ok(`${P1} - Solitaire Yüzük`);
const P2  = id(await p("products", { name: "18 Ayar Pırlanta Montür Yüzük",       categoryId: CAT_YUZUK,   weightGram: 4.20, purity: 18, purchasePrice: 24500.00, salePrice: 29800.00, stockQuantity: 2,  barcode: "YZ002" })); ok(`${P2} - Pırlanta Montür`);
const P3  = id(await p("products", { name: "14 Ayar Sade Alyans (Çift)",           categoryId: CAT_YUZUK,   weightGram: 5.60, purity: 14, purchasePrice: 22960.00, salePrice: 27500.00, stockQuantity: 5,  barcode: "YZ003" })); ok(`${P3} - Alyans Çift`);
const P4  = id(await p("products", { name: "14 Ayar Çift Sıra Zirkon Yüzük",      categoryId: CAT_YUZUK,   weightGram: 4.80, purity: 14, purchasePrice: 19680.00, salePrice: 23500.00, stockQuantity: 3,  barcode: "YZ004" })); ok(`${P4} - Çift Sıra Zirkon`);
const P5  = id(await p("products", { name: "18 Ayar Söz Yüzüğü",                  categoryId: CAT_YUZUK,   weightGram: 3.80, purity: 18, purchasePrice: 22100.00, salePrice: 26800.00, stockQuantity: 3,  barcode: "YZ005" })); ok(`${P5} - Söz Yüzüğü`);

// Bilezikler
const P6  = id(await p("products", { name: "22 Ayar Hasır Bilezik (20cm)",         categoryId: CAT_BILEZIK, weightGram: 12.50, purity: 22, purchasePrice: 55000.00, salePrice: 63500.00, stockQuantity: 6, barcode: "BL001" })); ok(`${P6} - Hasır Bilezik`);
const P7  = id(await p("products", { name: "22 Ayar Burgu Bilezik",                categoryId: CAT_BILEZIK, weightGram: 10.20, purity: 22, purchasePrice: 44880.00, salePrice: 51900.00, stockQuantity: 4, barcode: "BL002" })); ok(`${P7} - Burgu Bilezik`);
const P8  = id(await p("products", { name: "14 Ayar Taşlı Kelepçe Bilezik",       categoryId: CAT_BILEZIK, weightGram: 8.90,  purity: 14, purchasePrice: 36490.00, salePrice: 43800.00, stockQuantity: 2, barcode: "BL003" })); ok(`${P8} - Kelepçe Bilezik`);
const P9  = id(await p("products", { name: "22 Ayar Düz İnce Bilezik",             categoryId: CAT_BILEZIK, weightGram: 7.80,  purity: 22, purchasePrice: 34320.00, salePrice: 39800.00, stockQuantity: 8, barcode: "BL004" })); ok(`${P9} - Düz İnce Bilezik`);

// Kolyeler
const P10 = id(await p("products", { name: "14 Ayar Kalp Kolye + Zincir",         categoryId: CAT_KOLYE,   weightGram: 3.20, purity: 14, purchasePrice: 13120.00, salePrice: 15800.00, stockQuantity: 5,  barcode: "KL001" })); ok(`${P10} - Kalp Kolye`);
const P11 = id(await p("products", { name: "18 Ayar Süslü Kolye Ucu + 50cm Zincir", categoryId: CAT_KOLYE, weightGram: 6.50, purity: 18, purchasePrice: 37700.00, salePrice: 45500.00, stockQuantity: 2,  barcode: "KL002" })); ok(`${P11} - Süslü Kolye`);
const P12 = id(await p("products", { name: "14 Ayar Burç Kolye (Aslan)",           categoryId: CAT_KOLYE,   weightGram: 2.80, purity: 14, purchasePrice: 11480.00, salePrice: 13900.00, stockQuantity: 3,  barcode: "KL003" })); ok(`${P12} - Burç Kolye`);
const P13 = id(await p("products", { name: "14 Ayar Figaro Zincir 45cm",           categoryId: CAT_KOLYE,   weightGram: 4.10, purity: 14, purchasePrice: 16810.00, salePrice: 20200.00, stockQuantity: 7,  barcode: "KL004" })); ok(`${P13} - Figaro Zincir`);

// Küpeler
const P14 = id(await p("products", { name: "14 Ayar Taşlı Küpe (Siyah Taş)",     categoryId: CAT_KUPE,    weightGram: 2.40, purity: 14, purchasePrice:  9840.00, salePrice: 11900.00, stockQuantity: 6,  barcode: "KP001" })); ok(`${P14} - Taşlı Küpe`);
const P15 = id(await p("products", { name: "18 Ayar Çember Küpe (3cm)",           categoryId: CAT_KUPE,    weightGram: 3.60, purity: 18, purchasePrice: 20880.00, salePrice: 25200.00, stockQuantity: 4,  barcode: "KP002" })); ok(`${P15} - Çember Küpe`);
const P16 = id(await p("products", { name: "14 Ayar Sade Halka Küpe (1.5cm)",     categoryId: CAT_KUPE,    weightGram: 1.80, purity: 14, purchasePrice:  7380.00, salePrice:  8900.00, stockQuantity: 10, barcode: "KP003" })); ok(`${P16} - Halka Küpe`);

// Halhal
const P17 = id(await p("products", { name: "22 Ayar Halhal (Tamalı)",              categoryId: CAT_HALHAL,  weightGram: 18.00, purity: 22, purchasePrice: 79200.00, salePrice: 91000.00, stockQuantity: 2, barcode: "HH001" })); ok(`${P17} - 22k Halhal`);

// Setler
const P18 = id(await p("products", { name: "14 Ayar Üçlü Set (Kolye+Küpe+Bileklik)", categoryId: CAT_SET,  weightGram: 9.50, purity: 14, purchasePrice: 38950.00, salePrice: 46800.00, stockQuantity: 2,  barcode: "ST001" })); ok(`${P18} - Üçlü Set`);
const P19 = id(await p("products", { name: "18 Ayar İkili Set (Kolye+Küpe)",       categoryId: CAT_SET,     weightGram: 7.20, purity: 18, purchasePrice: 41760.00, salePrice: 50000.00, stockQuantity: 1,  barcode: "ST002" })); ok(`${P19} - 18k İkili Set`);
const P20 = id(await p("products", { name: "14 Ayar Nişan Seti (Alyans+Söz)",      categoryId: CAT_SET,     weightGram: 8.40, purity: 14, purchasePrice: 34440.00, salePrice: 41500.00, stockQuantity: 3,  barcode: "ST003" })); ok(`${P20} - Nişan Seti`);

// ── 7. ALIŞLAR ────────────────────────────────────────────
console.log("\n=== 7. Alış İşlemleri ===");

const purchases = [
  { purchaseDate:"2026-01-08T09:00:00", totalAmountTRY:320000, weightGram:72.5,  purity:14, sourceType:1, supplierId:SUP1, notes:"Ocak ayı 14 ayar ürün alımı" },
  { purchaseDate:"2026-01-15T10:30:00", totalAmountTRY:198000, weightGram:44.0,  purity:22, sourceType:1, supplierId:SUP2, notes:"22 ayar bilezik stoğu" },
  { purchaseDate:"2026-02-03T09:15:00", totalAmountTRY:145000, weightGram:32.2,  purity:18, sourceType:1, supplierId:SUP1, notes:"18 ayar ürün takviyesi" },
  { purchaseDate:"2026-02-20T11:00:00", totalAmountTRY: 87000, weightGram:19.8,  purity:22, sourceType:1, supplierId:SUP3, notes:"Ege kuyum - halhal ve bilezik" },
  { purchaseDate:"2026-03-05T08:45:00", totalAmountTRY:410000, weightGram:92.0,  purity:14, sourceType:1, supplierId:SUP1, notes:"Mart bahar koleksiyonu alımı" },
  { purchaseDate:"2026-03-18T14:00:00", totalAmountTRY:234000, weightGram:52.0,  purity:22, sourceType:1, supplierId:SUP2, notes:"Düğün sezonu öncesi 22 ayar stok" },
  { purchaseDate:"2026-04-02T09:30:00", totalAmountTRY:168000, weightGram:37.5,  purity:18, sourceType:1, supplierId:SUP3, notes:"Nisan 18 ayar ürün" },
  { purchaseDate:"2026-02-10T16:00:00", totalAmountTRY: 38500, weightGram: 9.8,  purity:14, sourceType:2, customerId:CUS6, notes:"İbrahim Şahin'den eski 14 ayar bilezik" },
  { purchaseDate:"2026-03-25T15:30:00", totalAmountTRY: 22000, weightGram: 5.2,  purity:18, sourceType:2, customerId:CUS3, notes:"Fatma Demir - eski yüzük" },
  { purchaseDate:"2026-04-07T11:00:00", totalAmountTRY:112000, weightGram:25.5,  purity:22, sourceType:3, notes:"Hurda altın alımı (çeşitli)" },
];

for (const pur of purchases) {
  await p("purchases", pur);
  ok(`Alış: ${pur.notes}`);
}

// ── 8. SATIŞLAR ───────────────────────────────────────────
console.log("\n=== 8. Satış İşlemleri ===");

const sales = [
  // Ocak
  { customerId:CUS1, saleDate:"2026-01-10T14:30:00", items:[{productId:P10,quantity:1,unitPriceTRY:0},{productId:P16,quantity:1,unitPriceTRY:0}], notes:"Doğum günü hediyesi" },
  { customerId:CUS2, saleDate:"2026-01-18T11:00:00", items:[{productId:P3, quantity:1,unitPriceTRY:0}], notes:"Nişan alyansı" },
  { customerId:null, saleDate:"2026-01-22T16:15:00", items:[{productId:P9, quantity:1,unitPriceTRY:0},{productId:P14,quantity:1,unitPriceTRY:0}], notes:"Nakit satış" },
  { customerId:CUS5, saleDate:"2026-01-29T10:00:00", items:[{productId:P6, quantity:1,unitPriceTRY:0},{productId:P7,quantity:1,unitPriceTRY:0}], notes:"Zeynep Hanım - koleksiyon alımı" },
  // Şubat
  { customerId:CUS7, saleDate:"2026-02-08T13:00:00", items:[{productId:P17,quantity:1,unitPriceTRY:0}], notes:"Kızı için düğün çeyizi" },
  { customerId:CUS4, saleDate:"2026-02-14T15:30:00", items:[{productId:P1, quantity:1,unitPriceTRY:0}], notes:"Sevgililer Günü hediyesi" },
  { customerId:null, saleDate:"2026-02-19T12:00:00", items:[{productId:P12,quantity:1,unitPriceTRY:0},{productId:P16,quantity:2,unitPriceTRY:0}], notes:"" },
  { customerId:CUS8, saleDate:"2026-02-26T11:30:00", items:[{productId:P18,quantity:1,unitPriceTRY:0}], notes:"Annesi için üçlü set" },
  // Mart
  { customerId:CUS1, saleDate:"2026-03-08T14:00:00", items:[{productId:P15,quantity:1,unitPriceTRY:0}], notes:"Kadınlar Günü hediyesi" },
  { customerId:CUS3, saleDate:"2026-03-15T10:30:00", items:[{productId:P4, quantity:1,unitPriceTRY:0},{productId:P13,quantity:1,unitPriceTRY:0}], notes:"Annesi için yüzük ve zincir" },
  { customerId:CUS5, saleDate:"2026-03-22T16:00:00", items:[{productId:P9, quantity:2,unitPriceTRY:38500}], notes:"İkinci bilezik - indirimli" },
  { customerId:null, saleDate:"2026-03-28T13:15:00", items:[{productId:P2, quantity:1,unitPriceTRY:0}], notes:"Pırlanta montür - nakit" },
  { customerId:CUS7, saleDate:"2026-03-31T11:00:00", items:[{productId:P6, quantity:1,unitPriceTRY:0},{productId:P9,quantity:1,unitPriceTRY:0}], notes:"Düğün için ek alım" },
  // Nisan
  { customerId:CUS2, saleDate:"2026-04-03T10:00:00", items:[{productId:P5, quantity:1,unitPriceTRY:0}], notes:"Nişan yüzüğü - 18 ayar" },
  { customerId:CUS4, saleDate:"2026-04-05T15:00:00", items:[{productId:P11,quantity:1,unitPriceTRY:0}], notes:"" },
  { customerId:null, saleDate:"2026-04-08T12:30:00", items:[{productId:P14,quantity:2,unitPriceTRY:0},{productId:P16,quantity:2,unitPriceTRY:0}], notes:"Toplu küpe satışı - nakit" },
  { customerId:CUS1, saleDate:"2026-04-09T11:00:00", items:[{productId:P20,quantity:1,unitPriceTRY:0}], notes:"Nişan seti - Ayşe Hanım kızı için" },
];

for (const sale of sales) {
  await p("sales", sale);
  ok(`Satış: ${sale.notes || sale.saleDate.slice(0,10)}`);
}

console.log("\n\x1b[32m==================================================\x1b[0m");
console.log("\x1b[32m✓ Seed tamamlandı!\x1b[0m");
console.log(`  Kategoriler : 6`);
console.log(`  Konumlar    : 4`);
console.log(`  Tedarikçiler: 3`);
console.log(`  Müşteriler  : 8`);
console.log(`  Ürünler     : 20`);
console.log(`  Alışlar     : 10`);
console.log(`  Satışlar    : 17`);
console.log("\x1b[32m==================================================\x1b[0m\n");
