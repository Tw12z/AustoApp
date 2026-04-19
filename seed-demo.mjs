// ============================================================
// Austo26 — DEMO SEED (Sunum verisi)
// Çalıştır: node seed-demo.mjs
// Temizle :  node seed-clean.mjs
// ============================================================
import { writeFileSync } from "fs";
const BASE = "http://localhost:5202/api";
const ok  = (m) => console.log(`\x1b[32m✓ ${m}\x1b[0m`);
const err = (m) => console.error(`\x1b[31m✗ ${m}\x1b[0m`);

async function req(method, path, body, token) {
  const res = await fetch(`${BASE}/${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${method} /${path} → ${res.status}: ${JSON.stringify(json)}`);
  return json;
}

// ── LOGIN ──────────────────────────────────────────────────
console.log("\n\x1b[33m=== 1. Login ===\x1b[0m");
const { accessToken: TOKEN } = await req("POST", "auth/login", { userNameOrEmail: "admin", password: "Admin123!" });
ok("Token alındı");
const p = (path, body) => req("POST", path, body, TOKEN);
const id = (r) => r.id ?? r;

// IDs to save for cleanup
const SEED = { categories:[], locationCategories:[], locations:[], suppliers:[], customers:[], products:[], sales:[], purchases:[] };

// ── KATEGORİLER (ürün + lokasyon tipleri) ─────────────────
console.log("\n\x1b[33m=== 2. Kategoriler ===\x1b[0m");
const cats = ["Yüzük","Bilezik","Kolye","Küpe","Halhal","Set","Bileklik","Broş","Toka","Kolye Ucu","Zincir","Altın Sikke"];
for (const name of cats) {
  const r = await p("categories", { name }); SEED.categories.push(r.id); ok(name);
}
const [CAT_YUZUK,CAT_BILEZIK,CAT_KOLYE,CAT_KUPE,CAT_HALHAL,CAT_SET,CAT_BILEKLIK,CAT_BROS,CAT_TOKA,CAT_KOLYE_UCU,CAT_ZINCIR,CAT_SIKKE] = SEED.categories;

// Lokasyon tipi kategoriler (aynı Categories tablosu kullanılıyor)
console.log("\n\x1b[33m=== 3. Lokasyon Kategorileri ===\x1b[0m");
const locCatNames = ["Vitrin","Kasa","Depo","Tezgah"];
for (const name of locCatNames) {
  const r = await p("categories", { name }); SEED.categories.push(r.id); SEED.locationCategories.push(r.id); ok(name);
}
const [LCAT_VITRIN, LCAT_KASA, LCAT_DEPO, LCAT_TEZGAH] = SEED.locationCategories;

// ── KONUMLAR ──────────────────────────────────────────────
console.log("\n\x1b[33m=== 4. Konumlar ===\x1b[0m");
const locations = [
  { name:"Vitrin 1 – Yüzükler",     description:"Ön vitrin sol bölüm",         categoryId: LCAT_VITRIN },
  { name:"Vitrin 2 – Bilezikler",   description:"Ön vitrin sağ bölüm",         categoryId: LCAT_VITRIN },
  { name:"Vitrin 3 – Kolyeler",     description:"Orta vitrin",                 categoryId: LCAT_VITRIN },
  { name:"Vitrin 4 – Küpeler",      description:"Yan vitrin küpe bölümü",      categoryId: LCAT_VITRIN },
  { name:"Vitrin 5 – Setler",       description:"Set ve çeyiz ürünleri",       categoryId: LCAT_VITRIN },
  { name:"Ana Kasa",                description:"Değerli ürünler kasası",       categoryId: LCAT_KASA   },
  { name:"Yedek Kasa",              description:"İkinci emniyet kasası",        categoryId: LCAT_KASA   },
  { name:"Depo A",                  description:"Ana stok deposu",             categoryId: LCAT_DEPO   },
  { name:"Depo B",                  description:"Yedek stok rafı",             categoryId: LCAT_DEPO   },
  { name:"Tezgah 1",               description:"Sağ tezgah müşteri alanı",    categoryId: LCAT_TEZGAH },
  { name:"Tezgah 2",               description:"Sol tezgah müşteri alanı",    categoryId: LCAT_TEZGAH },
];
for (const loc of locations) {
  const r = await p("locations", loc); SEED.locations.push(r.id); ok(loc.name);
}

// ── TEDARİKÇİLER ──────────────────────────────────────────
console.log("\n\x1b[33m=== 5. Tedarikçiler ===\x1b[0m");
const suppliers = [
  { companyName:"Kapalıçarşı Altın A.Ş.",      contactName:"Hasan Usta",      phone:"02125120034", email:"info@kapalicarsi-altin.com",    taxNumber:"1234567890", address:"Kapalıçarşı, Kuyumcular Çarşısı No:45, Fatih/İstanbul" },
  { companyName:"İstanbul Kuyum Toptan Ltd.",  contactName:"Recep Kılıç",     phone:"02123340099", email:"recep@ikuyum.com",               taxNumber:"9876543210", address:"Mahmutpaşa Cad. No:12, Fatih/İstanbul" },
  { companyName:"Ege Kuyumculuk Ltd. Şti.",   contactName:"Selma Yıldırım",  phone:"02326540012", email:"selma@egekuyum.com",            taxNumber:"4567890123", address:"Kemeraltr Çarşısı No:88, Konak/İzmir" },
  { companyName:"Anadolu İnci Kuyum",          contactName:"Mustafa Güneş",   phone:"03122334455", email:"info@anadoluinci.com.tr",        taxNumber:"5678901234", address:"Ulus Çarşısı No:33, Altındağ/Ankara" },
  { companyName:"Bursa Kuyumcular Birliği",    contactName:"Nermin Arslan",   phone:"02244556677", email:"nermin@bursakuyum.org",         taxNumber:"6789012345", address:"Kapalı Çarşı, Bursa" },
  { companyName:"İAR – İstanbul Altın Rafinerisi", contactName:"Kurumsal Satış", phone:"02124441234", email:"satis@iar.com.tr",           taxNumber:"7890123456", address:"Altın Yol Cad. No:1, Bakırköy/İstanbul" },
];
for (const s of suppliers) {
  const r = await p("suppliers", s); SEED.suppliers.push(r.id); ok(s.companyName);
}
const [SUP1,SUP2,SUP3,SUP4,SUP5,SUP6] = SEED.suppliers;

// ── MÜŞTERİLER ────────────────────────────────────────────
console.log("\n\x1b[33m=== 6. Müşteriler ===\x1b[0m");
const customers = [
  { fullName:"Ayşe Kaya",          phone:"05321234567", email:"ayse.kaya@gmail.com",         notes:"Düzenli müşteri, 14 ayar tercih ediyor. Yılda 3-4 kez alışveriş yapıyor." },
  { fullName:"Mehmet Yılmaz",      phone:"05334567890", email:"m.yilmaz@hotmail.com",         notes:"Nişan yüzüğü için geldi, 18 ayar talep etti." },
  { fullName:"Fatma Demir",        phone:"05459876543", email:"fatma.demir@gmail.com",        notes:"Annesi için hediye alıyor, bütçe odaklı." },
  { fullName:"Ali Çelik",          phone:"05367654321", email:"ali.celik@gmail.com",          notes:"Eşine sürpriz yapmak için geldi." },
  { fullName:"Zeynep Arslan",      phone:"05411112233", email:"zeynep.arslan@outlook.com",    notes:"22 ayar bilezik koleksiyonu yapıyor. VIP müşteri." },
  { fullName:"İbrahim Şahin",      phone:"05523344556", email:"",                             notes:"Hurda altın getirdi. Güvenilir, tekrar geldi." },
  { fullName:"Emine Öztürk",       phone:"05389990011", email:"emine.ozturk@yandex.com",      notes:"Kızının düğünü için hazırlık yapıyor, çeyiz listesi çıkardı." },
  { fullName:"Hüseyin Aydın",      phone:"05445566778", email:"h.aydin@gmail.com",            notes:"Annesi için 22 ayar set aldı." },
  { fullName:"Seda Koç",           phone:"05312223344", email:"seda.koc@icloud.com",          notes:"Her ay düzenli alışveriş yapar. Yüzük koleksiyoncusu." },
  { fullName:"Tarık Yıldız",       phone:"05556677889", email:"tarik.yildiz@gmail.com",       notes:"İş yeri açılışı için altın sikke hediye alacak." },
  { fullName:"Merve Şimşek",       phone:"05438889900", email:"merve.simsek@hotmail.com",     notes:"Bebek küpesi arıyor, 14 ayar." },
  { fullName:"Okan Başaran",       phone:"05367788990", email:"okan.basaran@gmail.com",       notes:"Evlilik yıldönümü hediyesi." },
  { fullName:"Pınar Güler",        phone:"05321112223", email:"pinar.guler@outlook.com",      notes:"Kendisi için kolye aldı, tekrar gelecek." },
  { fullName:"Kemal Aktaş",        phone:"05509876543", email:"kemal.aktas@gmail.com",        notes:"Toplu halhal alımı yaptı." },
  { fullName:"Gülşen Mutlu",       phone:"05324433221", email:"gulsen.mutlu@gmail.com",       notes:"Kızı için çeyiz seti hazırlıyor." },
  { fullName:"Burak Doğan",        phone:"05556662211", email:"burak.dogan@gmail.com",        notes:"Nişan seti beğendi, 2 hafta içinde gelecek." },
  { fullName:"Hatice Erdoğan",     phone:"05387774455", email:"hatice.erdogan@hotmail.com",   notes:"Düzenli müşteri, yıllık 60K+ harcama yapar." },
  { fullName:"Serdar Kaplan",      phone:"05349993311", email:"serdar.kaplan@gmail.com",      notes:"Mücevher yatırımcısı, 22-24 ayar tercih eder." },
  { fullName:"Nilüfer Çetin",      phone:"05412223334", email:"nilufer.cetin@gmail.com",      notes:"Kız kardeşinin doğum günü için." },
  { fullName:"Enver Toprak",       phone:"05521113344", email:"enver.toprak@yandex.com",      notes:"Hurda ve sikke alımı için düzenli geliyor." },
];
for (const c of customers) {
  const r = await p("customers", c); SEED.customers.push(r.id); ok(c.fullName);
}
const [CUS1,CUS2,CUS3,CUS4,CUS5,CUS6,CUS7,CUS8,CUS9,CUS10,CUS11,CUS12,CUS13,CUS14,CUS15,CUS16,CUS17,CUS18,CUS19,CUS20] = SEED.customers;

// ── ÜRÜNLER ───────────────────────────────────────────────
console.log("\n\x1b[33m=== 7. Ürünler ===\x1b[0m");
const products = [
  // ── YÜZÜKLER (14k) ──
  { name:"14 Ayar Taşlı Solitaire Yüzük",          categoryId:CAT_YUZUK,    weightGram:3.50,  purity:14, purchasePrice:14350, salePrice:17200,  stockQuantity:4,  barcode:"YZ001" },
  { name:"14 Ayar Çift Sıra Zirkon Yüzük",         categoryId:CAT_YUZUK,    weightGram:4.80,  purity:14, purchasePrice:19680, salePrice:23500,  stockQuantity:3,  barcode:"YZ002" },
  { name:"14 Ayar Sade Alyans (Çift)",              categoryId:CAT_YUZUK,    weightGram:5.60,  purity:14, purchasePrice:22960, salePrice:27500,  stockQuantity:5,  barcode:"YZ003" },
  { name:"14 Ayar Burçlu Yüzük (Aslan)",           categoryId:CAT_YUZUK,    weightGram:3.20,  purity:14, purchasePrice:13120, salePrice:15800,  stockQuantity:4,  barcode:"YZ004" },
  { name:"14 Ayar Ajur Desenli Yüzük",             categoryId:CAT_YUZUK,    weightGram:4.10,  purity:14, purchasePrice:16810, salePrice:20200,  stockQuantity:3,  barcode:"YZ005" },
  { name:"14 Ayar Kelebek Motifli Yüzük",          categoryId:CAT_YUZUK,    weightGram:3.80,  purity:14, purchasePrice:15580, salePrice:18700,  stockQuantity:2,  barcode:"YZ006" },
  // ── YÜZÜKLER (18k) ──
  { name:"18 Ayar Pırlanta Montür Yüzük",          categoryId:CAT_YUZUK,    weightGram:4.20,  purity:18, purchasePrice:24500, salePrice:29800,  stockQuantity:2,  barcode:"YZ007" },
  { name:"18 Ayar Söz Yüzüğü",                     categoryId:CAT_YUZUK,    weightGram:3.80,  purity:18, purchasePrice:22100, salePrice:26800,  stockQuantity:3,  barcode:"YZ008" },
  { name:"18 Ayar İnce Alyans",                    categoryId:CAT_YUZUK,    weightGram:2.90,  purity:18, purchasePrice:16850, salePrice:20500,  stockQuantity:6,  barcode:"YZ009" },
  { name:"18 Ayar Oval Taşlı Cocktail Yüzük",      categoryId:CAT_YUZUK,    weightGram:5.40,  purity:18, purchasePrice:31350, salePrice:38200,  stockQuantity:1,  barcode:"YZ010" },
  // ── BİLEZİKLER ──
  { name:"22 Ayar Hasır Bilezik (20cm)",            categoryId:CAT_BILEZIK,  weightGram:12.50, purity:22, purchasePrice:55000, salePrice:63500,  stockQuantity:6,  barcode:"BL001" },
  { name:"22 Ayar Burgu Bilezik",                   categoryId:CAT_BILEZIK,  weightGram:10.20, purity:22, purchasePrice:44880, salePrice:51900,  stockQuantity:4,  barcode:"BL002" },
  { name:"22 Ayar Düz İnce Bilezik",                categoryId:CAT_BILEZIK,  weightGram:7.80,  purity:22, purchasePrice:34320, salePrice:39800,  stockQuantity:8,  barcode:"BL003" },
  { name:"22 Ayar Çiçek Motifli Bilezik",          categoryId:CAT_BILEZIK,  weightGram:11.40, purity:22, purchasePrice:50160, salePrice:58000,  stockQuantity:3,  barcode:"BL004" },
  { name:"22 Ayar Zincir Kelepçe Bilezik",         categoryId:CAT_BILEZIK,  weightGram:9.60,  purity:22, purchasePrice:42240, salePrice:48900,  stockQuantity:5,  barcode:"BL005" },
  { name:"14 Ayar Taşlı Kelepçe Bilezik",          categoryId:CAT_BILEZIK,  weightGram:8.90,  purity:14, purchasePrice:36490, salePrice:43800,  stockQuantity:2,  barcode:"BL006" },
  { name:"14 Ayar Altın-Gümüş Combo Bilezik",      categoryId:CAT_BILEZIK,  weightGram:6.50,  purity:14, purchasePrice:26650, salePrice:32000,  stockQuantity:4,  barcode:"BL007" },
  { name:"18 Ayar Döküm Bilezik",                  categoryId:CAT_BILEZIK,  weightGram:10.80, purity:18, purchasePrice:62640, salePrice:76000,  stockQuantity:2,  barcode:"BL008" },
  // ── KOLYELER ──
  { name:"14 Ayar Kalp Kolye + Zincir 45cm",       categoryId:CAT_KOLYE,    weightGram:3.20,  purity:14, purchasePrice:13120, salePrice:15800,  stockQuantity:5,  barcode:"KL001" },
  { name:"14 Ayar Figaro Zincir 45cm",             categoryId:CAT_KOLYE,    weightGram:4.10,  purity:14, purchasePrice:16810, salePrice:20200,  stockQuantity:7,  barcode:"KL002" },
  { name:"14 Ayar Burç Kolye (Terazi)",            categoryId:CAT_KOLYE,    weightGram:2.80,  purity:14, purchasePrice:11480, salePrice:13900,  stockQuantity:3,  barcode:"KL003" },
  { name:"14 Ayar İsim Yazılı Kolye",             categoryId:CAT_KOLYE,    weightGram:3.50,  purity:14, purchasePrice:14350, salePrice:17200,  stockQuantity:4,  barcode:"KL004" },
  { name:"18 Ayar Süslü Kolye Ucu + 50cm Zincir", categoryId:CAT_KOLYE,    weightGram:6.50,  purity:18, purchasePrice:37700, salePrice:45500,  stockQuantity:2,  barcode:"KL005" },
  { name:"18 Ayar Taşlı Kolye Ucu + Zincir",      categoryId:CAT_KOLYE,    weightGram:5.80,  purity:18, purchasePrice:33640, salePrice:41000,  stockQuantity:3,  barcode:"KL006" },
  { name:"22 Ayar Veneziyan Zincir 50cm",          categoryId:CAT_KOLYE,    weightGram:8.20,  purity:22, purchasePrice:36080, salePrice:41800,  stockQuantity:4,  barcode:"KL007" },
  // ── KÜPELER ──
  { name:"14 Ayar Taşlı Küpe (Siyah Taş)",        categoryId:CAT_KUPE,     weightGram:2.40,  purity:14, purchasePrice:9840,  salePrice:11900,  stockQuantity:6,  barcode:"KP001" },
  { name:"14 Ayar Sade Halka Küpe 1.5cm",          categoryId:CAT_KUPE,     weightGram:1.80,  purity:14, purchasePrice:7380,  salePrice:8900,   stockQuantity:10, barcode:"KP002" },
  { name:"14 Ayar Sade Halka Küpe 2cm",            categoryId:CAT_KUPE,     weightGram:2.20,  purity:14, purchasePrice:9020,  salePrice:10900,  stockQuantity:8,  barcode:"KP003" },
  { name:"14 Ayar Damla Küpe",                     categoryId:CAT_KUPE,     weightGram:2.60,  purity:14, purchasePrice:10660, salePrice:12900,  stockQuantity:5,  barcode:"KP004" },
  { name:"18 Ayar Çember Küpe 3cm",               categoryId:CAT_KUPE,     weightGram:3.60,  purity:18, purchasePrice:20880, salePrice:25200,  stockQuantity:4,  barcode:"KP005" },
  { name:"18 Ayar Taşlı Chandelier Küpe",          categoryId:CAT_KUPE,     weightGram:4.80,  purity:18, purchasePrice:27840, salePrice:33800,  stockQuantity:2,  barcode:"KP006" },
  { name:"14 Ayar Bebek Küpesi (Tıpa)",            categoryId:CAT_KUPE,     weightGram:0.80,  purity:14, purchasePrice:3280,  salePrice:4000,   stockQuantity:12, barcode:"KP007" },
  // ── HALHAL ──
  { name:"22 Ayar Halhal Düz (24cm)",              categoryId:CAT_HALHAL,   weightGram:14.00, purity:22, purchasePrice:61600, salePrice:71000,  stockQuantity:3,  barcode:"HH001" },
  { name:"22 Ayar Halhal Zincirli (24cm)",         categoryId:CAT_HALHAL,   weightGram:18.00, purity:22, purchasePrice:79200, salePrice:91500,  stockQuantity:2,  barcode:"HH002" },
  { name:"22 Ayar Halhal Çift (Çift Bileklik)",    categoryId:CAT_HALHAL,   weightGram:28.00, purity:22, purchasePrice:123200,salePrice:142000, stockQuantity:1,  barcode:"HH003" },
  // ── SETLER ──
  { name:"14 Ayar Üçlü Set (Kolye+Küpe+Bileklik)",categoryId:CAT_SET,      weightGram:9.50,  purity:14, purchasePrice:38950, salePrice:46800,  stockQuantity:2,  barcode:"ST001" },
  { name:"18 Ayar İkili Set (Kolye+Küpe)",         categoryId:CAT_SET,      weightGram:7.20,  purity:18, purchasePrice:41760, salePrice:50000,  stockQuantity:2,  barcode:"ST002" },
  { name:"14 Ayar Nişan Seti (Alyans+Söz)",        categoryId:CAT_SET,      weightGram:8.40,  purity:14, purchasePrice:34440, salePrice:41500,  stockQuantity:3,  barcode:"ST003" },
  { name:"22 Ayar Çeyiz Seti (Bilezik+Halhal)",   categoryId:CAT_SET,      weightGram:35.00, purity:22, purchasePrice:154000,salePrice:177000, stockQuantity:1,  barcode:"ST004" },
  { name:"18 Ayar Dörtlü Set (Komple Takı)",       categoryId:CAT_SET,      weightGram:18.60, purity:18, purchasePrice:107880,salePrice:130000, stockQuantity:1,  barcode:"ST005" },
  // ── BİLEKLİK ──
  { name:"14 Ayar İnce Bileklik 16cm",             categoryId:CAT_BILEKLIK, weightGram:2.40,  purity:14, purchasePrice:9840,  salePrice:11900,  stockQuantity:7,  barcode:"BK001" },
  { name:"14 Ayar Taşlı Bileklik",                 categoryId:CAT_BILEKLIK, weightGram:3.80,  purity:14, purchasePrice:15580, salePrice:18700,  stockQuantity:4,  barcode:"BK002" },
  { name:"18 Ayar Zincirli Bileklik",              categoryId:CAT_BILEKLIK, weightGram:4.50,  purity:18, purchasePrice:26100, salePrice:31800,  stockQuantity:3,  barcode:"BK003" },
  // ── ALTIN SİKKE ──
  { name:"Cumhuriyet Altın Sikke (Tam)",           categoryId:CAT_SIKKE,    weightGram:7.20,  purity:22, purchasePrice:31680, salePrice:36500,  stockQuantity:10, barcode:"SK001" },
  { name:"Cumhuriyet Altın Sikke (Yarım)",         categoryId:CAT_SIKKE,    weightGram:3.60,  purity:22, purchasePrice:15840, salePrice:18300,  stockQuantity:15, barcode:"SK002" },
  { name:"Cumhuriyet Altın Sikke (Çeyrek)",        categoryId:CAT_SIKKE,    weightGram:1.80,  purity:22, purchasePrice:7920,  salePrice:9200,   stockQuantity:20, barcode:"SK003" },
  { name:"Ata Altın (Tam)",                        categoryId:CAT_SIKKE,    weightGram:7.20,  purity:22, purchasePrice:33120, salePrice:38200,  stockQuantity:5,  barcode:"SK004" },
  // ── ZİNCİR / KOLYE UCU ──
  { name:"14 Ayar Bismark Zincir 50cm",            categoryId:CAT_ZINCIR,   weightGram:5.50,  purity:14, purchasePrice:22550, salePrice:27000,  stockQuantity:6,  barcode:"ZN001" },
  { name:"14 Ayar Rolo Zincir 45cm",               categoryId:CAT_ZINCIR,   weightGram:3.80,  purity:14, purchasePrice:15580, salePrice:18700,  stockQuantity:8,  barcode:"ZN002" },
  { name:"18 Ayar Gurmet Zincir 60cm",             categoryId:CAT_ZINCIR,   weightGram:7.20,  purity:18, purchasePrice:41760, salePrice:50500,  stockQuantity:4,  barcode:"ZN003" },
  { name:"14 Ayar Kalp Kolye Ucu",                 categoryId:CAT_KOLYE_UCU,weightGram:1.50,  purity:14, purchasePrice:6150,  salePrice:7500,   stockQuantity:9,  barcode:"KU001" },
  { name:"14 Ayar Sonsuzluk Kolye Ucu",            categoryId:CAT_KOLYE_UCU,weightGram:1.80,  purity:14, purchasePrice:7380,  salePrice:8900,   stockQuantity:7,  barcode:"KU002" },
];
for (const prod of products) {
  try {
    const r = await p("products", prod); SEED.products.push(r.id); ok(`${prod.name}`);
  } catch(e) { err(`${prod.name}: ${e.message}`); }
}
const [P1,P2,P3,P4,P5,P6,P7,P8,P9,P10,P11,P12,P13,P14,P15,P16,P17,P18,P19,P20,P21,P22,P23,P24,P25,P26,P27,P28,P29,P30,P31,P32,P33,P34,P35,P36,P37,P38,P39,P40,P41,P42,P43,P44,P45,P46,P47,P48,P49,P50,P51] = SEED.products;

// ── ALIŞLAR ───────────────────────────────────────────────
console.log("\n\x1b[33m=== 8. Alış İşlemleri ===\x1b[0m");
const purchases = [
  // Ocak 2026
  { purchaseDate:"2026-01-05T09:00:00", totalAmountTRY:420000, weightGram:88.0,  purity:14, sourceType:1, supplierId:SUP1, notes:"Ocak - 14 ayar büyük parti alımı, kolye ve yüzük" },
  { purchaseDate:"2026-01-08T11:00:00", totalAmountTRY:285000, weightGram:62.8,  purity:22, sourceType:1, supplierId:SUP2, notes:"Ocak - 22 ayar bilezik ve halhal stoğu" },
  { purchaseDate:"2026-01-15T10:30:00", totalAmountTRY:198000, weightGram:44.0,  purity:22, sourceType:1, supplierId:SUP3, notes:"Ocak - Ege kuyum 22 ayar ek alım" },
  { purchaseDate:"2026-01-20T14:00:00", totalAmountTRY:62000,  weightGram:14.2,  purity:18, sourceType:1, supplierId:SUP4, notes:"Ocak - 18 ayar seçme parçalar" },
  { purchaseDate:"2026-01-22T09:30:00", totalAmountTRY:41000,  weightGram:10.2,  purity:22, sourceType:2, customerId:CUS6, notes:"İbrahim Şahin - eski 22 ayar bilezik hurda" },
  // Şubat 2026
  { purchaseDate:"2026-02-03T09:15:00", totalAmountTRY:312000, weightGram:68.5,  purity:14, sourceType:1, supplierId:SUP1, notes:"Şubat - Sevgililer Günü öncesi 14 ayar stok" },
  { purchaseDate:"2026-02-07T10:00:00", totalAmountTRY:175000, weightGram:38.5,  purity:18, sourceType:1, supplierId:SUP5, notes:"Şubat - Bursa kuyum 18 ayar set ve kolye" },
  { purchaseDate:"2026-02-10T16:00:00", totalAmountTRY:38500,  weightGram:9.8,   purity:14, sourceType:2, customerId:CUS20, notes:"Enver Toprak - eski 14 ayar bilezik" },
  { purchaseDate:"2026-02-18T11:00:00", totalAmountTRY:92000,  weightGram:20.5,  purity:22, sourceType:3, notes:"Hurda altın alımı (çeşitli müşterilerden)" },
  { purchaseDate:"2026-02-24T09:00:00", totalAmountTRY:245000, weightGram:54.2,  purity:22, sourceType:1, supplierId:SUP2, notes:"Şubat sonu - 22 ayar sikke ve hasır bilezik" },
  // Mart 2026
  { purchaseDate:"2026-03-03T08:45:00", totalAmountTRY:510000, weightGram:112.5, purity:14, sourceType:1, supplierId:SUP1, notes:"Mart - Bahar koleksiyonu büyük alım" },
  { purchaseDate:"2026-03-10T10:00:00", totalAmountTRY:330000, weightGram:72.6,  purity:22, sourceType:1, supplierId:SUP3, notes:"Mart - 22 ayar düğün sezonu hazırlığı" },
  { purchaseDate:"2026-03-15T14:00:00", totalAmountTRY:143000, weightGram:31.5,  purity:18, sourceType:1, supplierId:SUP6, notes:"Mart - İAR 18 ayar özel parçalar" },
  { purchaseDate:"2026-03-20T11:30:00", totalAmountTRY:55000,  weightGram:13.0,  purity:14, sourceType:2, customerId:CUS3, notes:"Fatma Demir - eski kolye ve yüzük" },
  { purchaseDate:"2026-03-25T15:30:00", totalAmountTRY:165000, weightGram:36.4,  purity:22, sourceType:3, notes:"Hurda altın büyük parti - rafineri teslimatı" },
  { purchaseDate:"2026-03-28T09:00:00", totalAmountTRY:78000,  weightGram:17.2,  purity:22, sourceType:1, supplierId:SUP4, notes:"Mart sonu - Ankara kuyum sikke alımı" },
  // Nisan 2026
  { purchaseDate:"2026-04-02T09:30:00", totalAmountTRY:268000, weightGram:59.0,  purity:14, sourceType:1, supplierId:SUP1, notes:"Nisan - 14 ayar yaz koleksiyonu" },
  { purchaseDate:"2026-04-05T11:00:00", totalAmountTRY:190000, weightGram:41.8,  purity:18, sourceType:1, supplierId:SUP5, notes:"Nisan - Bursa kuyum 18 ayar set ağırlıklı" },
  { purchaseDate:"2026-04-09T14:00:00", totalAmountTRY:112000, weightGram:24.8,  purity:22, sourceType:3, notes:"Hurda altın alımı - Nisan" },
  { purchaseDate:"2026-04-11T10:00:00", totalAmountTRY:48000,  weightGram:10.5,  purity:22, sourceType:2, customerId:CUS6, notes:"İbrahim Şahin - 22 ayar hurda ikinci getiri" },
];
for (const pur of purchases) {
  try { await p("purchases", pur); SEED.purchases.push("ok"); ok(`Alış: ${pur.notes.slice(0,50)}`); }
  catch(e) { err(`Alış hatası: ${e.message}`); }
}

// ── SATIŞLAR ──────────────────────────────────────────────
console.log("\n\x1b[33m=== 9. Satış İşlemleri ===\x1b[0m");
const sales = [
  // Ocak 2026
  { customerId:CUS1,  saleDate:"2026-01-06T14:30:00", items:[{productId:P19,quantity:1,unitPriceTRY:0},{productId:P28,quantity:1,unitPriceTRY:0}], notes:"Ayşe Hanım - yeni yıl kolye ve küpe" },
  { customerId:CUS2,  saleDate:"2026-01-09T11:00:00", items:[{productId:P3, quantity:1,unitPriceTRY:0}], notes:"Nişan alyansı" },
  { customerId:null,  saleDate:"2026-01-12T16:15:00", items:[{productId:P13,quantity:1,unitPriceTRY:0},{productId:P29,quantity:1,unitPriceTRY:0}], notes:"Nakit satış" },
  { customerId:CUS5,  saleDate:"2026-01-16T10:00:00", items:[{productId:P11,quantity:1,unitPriceTRY:0},{productId:P12,quantity:1,unitPriceTRY:0}], notes:"Zeynep Hanım - 22 ayar koleksiyon" },
  { customerId:CUS10, saleDate:"2026-01-19T15:00:00", items:[{productId:P44,quantity:2,unitPriceTRY:0}], notes:"Tarık Bey - açılış için sikke" },
  { customerId:CUS9,  saleDate:"2026-01-23T13:30:00", items:[{productId:P1, quantity:1,unitPriceTRY:0},{productId:P5,quantity:1,unitPriceTRY:0}], notes:"Seda Hanım - yüzük çifti" },
  { customerId:CUS17, saleDate:"2026-01-27T11:00:00", items:[{productId:P35,quantity:1,unitPriceTRY:0}], notes:"Hatice Hanım - nişan seti" },
  // Şubat 2026
  { customerId:CUS4,  saleDate:"2026-02-06T15:30:00", items:[{productId:P1, quantity:1,unitPriceTRY:0}], notes:"Sevgililer Günü erken hediye" },
  { customerId:CUS12, saleDate:"2026-02-09T14:00:00", items:[{productId:P21,quantity:1,unitPriceTRY:0},{productId:P22,quantity:1,unitPriceTRY:0}], notes:"Okan Bey - evlilik yıldönümü" },
  { customerId:CUS7,  saleDate:"2026-02-12T13:00:00", items:[{productId:P34,quantity:1,unitPriceTRY:0}], notes:"Emine Hanım - kızı için halhal" },
  { customerId:CUS11, saleDate:"2026-02-14T11:30:00", items:[{productId:P33,quantity:1,unitPriceTRY:0}], notes:"Merve Hanım - bebek küpesi" },
  { customerId:null,  saleDate:"2026-02-17T16:00:00", items:[{productId:P27,quantity:2,unitPriceTRY:0},{productId:P28,quantity:2,unitPriceTRY:0}], notes:"Toplu küpe - nakit" },
  { customerId:CUS8,  saleDate:"2026-02-21T10:00:00", items:[{productId:P36,quantity:1,unitPriceTRY:0}], notes:"Hüseyin Bey - dörtlü set" },
  { customerId:CUS5,  saleDate:"2026-02-25T14:30:00", items:[{productId:P14,quantity:1,unitPriceTRY:0},{productId:P15,quantity:1,unitPriceTRY:0}], notes:"Zeynep Hanım - bilezik eki" },
  { customerId:CUS13, saleDate:"2026-02-27T11:00:00", items:[{productId:P24,quantity:1,unitPriceTRY:0}], notes:"Pınar Hanım - taşlı kolye" },
  // Mart 2026
  { customerId:CUS1,  saleDate:"2026-03-04T14:00:00", items:[{productId:P31,quantity:1,unitPriceTRY:0}], notes:"Ayşe Hanım - taşlı küpe" },
  { customerId:CUS15, saleDate:"2026-03-08T10:30:00", items:[{productId:P36,quantity:1,unitPriceTRY:0}], notes:"Gülşen Hanım - Kadınlar Günü dört takı" },
  { customerId:CUS3,  saleDate:"2026-03-11T11:00:00", items:[{productId:P4, quantity:1,unitPriceTRY:0},{productId:P20,quantity:1,unitPriceTRY:0}], notes:"Fatma Hanım - yüzük ve zincir" },
  { customerId:CUS18, saleDate:"2026-03-14T15:00:00", items:[{productId:P45,quantity:3,unitPriceTRY:36500}], notes:"Serdar Bey - yatırım amaçlı sikke" },
  { customerId:null,  saleDate:"2026-03-17T12:00:00", items:[{productId:P7, quantity:1,unitPriceTRY:0}], notes:"Pırlanta montür - nakit" },
  { customerId:CUS5,  saleDate:"2026-03-20T16:00:00", items:[{productId:P13,quantity:1,unitPriceTRY:38500}], notes:"Zeynep Hanım - indirimli bilezik" },
  { customerId:CUS7,  saleDate:"2026-03-24T11:00:00", items:[{productId:P11,quantity:1,unitPriceTRY:0},{productId:P12,quantity:1,unitPriceTRY:0}], notes:"Emine Hanım - düğün için 22 ayar" },
  { customerId:CUS14, saleDate:"2026-03-26T14:30:00", items:[{productId:P34,quantity:1,unitPriceTRY:0},{productId:P35,quantity:1,unitPriceTRY:0}], notes:"Kemal Bey - toplu halhal" },
  { customerId:CUS9,  saleDate:"2026-03-29T10:00:00", items:[{productId:P2, quantity:1,unitPriceTRY:0}], notes:"Seda Hanım - zirkon yüzük" },
  // Nisan 2026
  { customerId:CUS2,  saleDate:"2026-04-01T10:00:00", items:[{productId:P8, quantity:1,unitPriceTRY:0}], notes:"Nişan yüzüğü 18 ayar" },
  { customerId:CUS16, saleDate:"2026-04-03T15:00:00", items:[{productId:P35,quantity:1,unitPriceTRY:0}], notes:"Burak Bey - nişan seti" },
  { customerId:null,  saleDate:"2026-04-05T12:30:00", items:[{productId:P27,quantity:2,unitPriceTRY:0},{productId:P28,quantity:2,unitPriceTRY:0}], notes:"Toplu küpe satışı - nakit" },
  { customerId:CUS17, saleDate:"2026-04-07T11:00:00", items:[{productId:P38,quantity:1,unitPriceTRY:0}], notes:"Hatice Hanım - çeyiz seti" },
  { customerId:CUS4,  saleDate:"2026-04-08T14:00:00", items:[{productId:P25,quantity:1,unitPriceTRY:0}], notes:"Ali Bey - süslü kolye" },
  { customerId:CUS19, saleDate:"2026-04-09T13:00:00", items:[{productId:P31,quantity:1,unitPriceTRY:0},{productId:P42,quantity:1,unitPriceTRY:0}], notes:"Nilüfer Hanım - taşlı küpe ve bileklik" },
  { customerId:CUS1,  saleDate:"2026-04-10T11:00:00", items:[{productId:P37,quantity:1,unitPriceTRY:0}], notes:"Ayşe Hanım - dörtlü set" },
  { customerId:CUS10, saleDate:"2026-04-11T15:30:00", items:[{productId:P44,quantity:5,unitPriceTRY:35000}], notes:"Tarık Bey - iş hediyesi için beşli sikke" },
];
for (const sale of sales) {
  try { const r = await p("sales", sale); SEED.sales.push(r.id); ok(`Satış: ${sale.notes.slice(0,50)}`); }
  catch(e) { err(`Satış hatası: ${e.message}`); }
}

// ── FİNANS GEÇMİŞİ ───────────────────────────────────────
console.log("\n\x1b[33m=== 10. Finans Verileri ===\x1b[0m");
const financeEntries = [
  { recordedAt:"2026-01-02T09:00:00", gram:3420.50,  ceyrek:8550.25,  yarim:17100.50, tam:34200.00, cumhuriyet:36500.00, ata:38200.00, usd:32.85, eur:35.20, gbp:41.50 },
  { recordedAt:"2026-01-09T09:00:00", gram:3445.00,  ceyrek:8612.50,  yarim:17225.00, tam:34450.00, cumhuriyet:36800.00, ata:38500.00, usd:32.90, eur:35.30, gbp:41.65 },
  { recordedAt:"2026-01-16T09:00:00", gram:3388.75,  ceyrek:8471.87,  yarim:16943.75, tam:33887.50, cumhuriyet:36200.00, ata:37900.00, usd:33.10, eur:35.50, gbp:41.80 },
  { recordedAt:"2026-01-23T09:00:00", gram:3512.00,  ceyrek:8780.00,  yarim:17560.00, tam:35120.00, cumhuriyet:37500.00, ata:39200.00, usd:32.75, eur:35.10, gbp:41.30 },
  { recordedAt:"2026-01-30T09:00:00", gram:3478.50,  ceyrek:8696.25,  yarim:17392.50, tam:34785.00, cumhuriyet:37200.00, ata:38900.00, usd:33.20, eur:35.60, gbp:41.95 },
  { recordedAt:"2026-02-06T09:00:00", gram:3550.25,  ceyrek:8875.62,  yarim:17751.25, tam:35502.50, cumhuriyet:37900.00, ata:39700.00, usd:33.45, eur:35.85, gbp:42.20 },
  { recordedAt:"2026-02-13T09:00:00", gram:3620.00,  ceyrek:9050.00,  yarim:18100.00, tam:36200.00, cumhuriyet:38700.00, ata:40500.00, usd:33.60, eur:36.05, gbp:42.45 },
  { recordedAt:"2026-02-20T09:00:00", gram:3595.50,  ceyrek:8988.75,  yarim:17977.50, tam:35955.00, cumhuriyet:38400.00, ata:40200.00, usd:33.50, eur:35.90, gbp:42.30 },
  { recordedAt:"2026-02-27T09:00:00", gram:3680.75,  ceyrek:9201.87,  yarim:18403.75, tam:36807.50, cumhuriyet:39300.00, ata:41100.00, usd:33.75, eur:36.20, gbp:42.65 },
  { recordedAt:"2026-03-06T09:00:00", gram:3720.00,  ceyrek:9300.00,  yarim:18600.00, tam:37200.00, cumhuriyet:39700.00, ata:41600.00, usd:33.90, eur:36.40, gbp:42.85 },
  { recordedAt:"2026-03-13T09:00:00", gram:3698.25,  ceyrek:9245.62,  yarim:18491.25, tam:36982.50, cumhuriyet:39500.00, ata:41300.00, usd:34.10, eur:36.60, gbp:43.10 },
  { recordedAt:"2026-03-20T09:00:00", gram:3755.50,  ceyrek:9388.75,  yarim:18777.50, tam:37555.00, cumhuriyet:40100.00, ata:42000.00, usd:34.05, eur:36.55, gbp:43.00 },
  { recordedAt:"2026-03-27T09:00:00", gram:3812.00,  ceyrek:9530.00,  yarim:19060.00, tam:38120.00, cumhuriyet:40700.00, ata:42600.00, usd:34.30, eur:36.80, gbp:43.35 },
  { recordedAt:"2026-04-03T09:00:00", gram:3890.50,  ceyrek:9726.25,  yarim:19452.50, tam:38905.00, cumhuriyet:41500.00, ata:43500.00, usd:34.55, eur:37.05, gbp:43.65 },
  { recordedAt:"2026-04-10T09:00:00", gram:3945.00,  ceyrek:9862.50,  yarim:19725.00, tam:39450.00, cumhuriyet:42100.00, ata:44100.00, usd:34.70, eur:37.20, gbp:43.90 },
];
for (const entry of financeEntries) {
  try {
    await p("finance/gold-price", entry);
    ok(`Finans: ${entry.recordedAt.slice(0,10)} — Gram: ₺${entry.gram}`);
  } catch(e) { err(`Finans: ${e.message}`); }
}

// ── KAYDET ────────────────────────────────────────────────
writeFileSync("seed-demo-ids.json", JSON.stringify(SEED, null, 2));

console.log("\n\x1b[32m══════════════════════════════════════════════════════\x1b[0m");
console.log("\x1b[32m✓ DEMO SEED TAMAMLANDI!\x1b[0m");
console.log(`  Kategoriler (toplam): ${SEED.categories.length} (${SEED.categories.length - SEED.locationCategories.length} ürün + ${SEED.locationCategories.length} lokasyon tipi)`);
console.log(`  Konumlar            : ${SEED.locations.length}`);
console.log(`  Tedarikçiler        : ${SEED.suppliers.length}`);
console.log(`  Müşteriler          : ${SEED.customers.length}`);
console.log(`  Ürünler             : ${SEED.products.length}`);
console.log(`  Alışlar             : ${SEED.purchases.length}`);
console.log(`  Satışlar            : ${SEED.sales.length}`);
console.log(`  Finans kayıtları    : ${financeEntries.length}`);
console.log("\n  ID'ler seed-demo-ids.json dosyasına kaydedildi.");
console.log("  Temizlemek için: \x1b[33mnode seed-clean.mjs\x1b[0m");
console.log("\x1b[32m══════════════════════════════════════════════════════\x1b[0m\n");
