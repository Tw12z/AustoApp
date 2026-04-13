#!/usr/bin/env bash
# Austo26 - Gerçekçi Demo Veri Seed Script
set -e

BASE="http://localhost:5202/api"
COLOR_OK="\033[32m"
COLOR_ERR="\033[31m"
RESET="\033[0m"

ok()  { echo -e "${COLOR_OK}✓ $1${RESET}"; }
err() { echo -e "${COLOR_ERR}✗ $1${RESET}"; }

# ── 1. LOGIN ──────────────────────────────────────────────
echo ""
echo "=== 1. Login ==="
LOGIN=$(curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"userNameOrEmail":"admin","password":"Admin123!"}')
TOKEN=$(echo "$LOGIN" | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])")
AUTH="Authorization: Bearer $TOKEN"
ok "Token alındı"

post() {
  local endpoint=$1
  local body=$2
  curl -s -X POST "$BASE/$endpoint" \
    -H "Content-Type: application/json" \
    -H "$AUTH" \
    -d "$body"
}

# ── 2. KATEGORİLER ───────────────────────────────────────
echo ""
echo "=== 2. Kategoriler ==="
CAT_YUZUK=$(post "categories"  '{"name":"Yüzük"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "Yüzük: $CAT_YUZUK"
CAT_BILEZIK=$(post "categories" '{"name":"Bilezik"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "Bilezik: $CAT_BILEZIK"
CAT_KOLYE=$(post "categories"  '{"name":"Kolye"}'   | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "Kolye: $CAT_KOLYE"
CAT_KUPE=$(post "categories"   '{"name":"Küpe"}'    | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "Küpe: $CAT_KUPE"
CAT_HALHAL=$(post "categories" '{"name":"Halhal"}'  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "Halhal: $CAT_HALHAL"
CAT_SET=$(post "categories"    '{"name":"Set"}'     | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "Set: $CAT_SET"

# ── 3. KONUMLAR ───────────────────────────────────────────
echo ""
echo "=== 3. Konumlar ==="
LOC_V1=$(post "locations" '{"name":"Vitrin 1","description":"Ana vitrin"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "Vitrin 1: $LOC_V1"
LOC_V2=$(post "locations" '{"name":"Vitrin 2","description":"Yan vitrin"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "Vitrin 2: $LOC_V2"
LOC_KASA=$(post "locations" '{"name":"Kasa","description":"Nakit kasa ve değerli ürünler"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "Kasa: $LOC_KASA"
LOC_DEPO=$(post "locations" '{"name":"Depo","description":"Stok deposu"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "Depo: $LOC_DEPO"

# ── 4. TEDARİKÇİLER ──────────────────────────────────────
echo ""
echo "=== 4. Tedarikçiler ==="
SUP1=$(post "suppliers" '{"companyName":"Kapalıçarşı Altın A.Ş.","contactName":"Hasan Usta","phone":"02125120034","email":"info@kapalicarsi-altin.com","taxNumber":"1234567890"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "Kapalıçarşı Altın A.Ş.: $SUP1"
SUP2=$(post "suppliers" '{"companyName":"İstanbul Kuyum Toptan","contactName":"Recep Bey","phone":"02123340099","email":"recep@ikuyum.com","taxNumber":"9876543210"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "İstanbul Kuyum Toptan: $SUP2"
SUP3=$(post "suppliers" '{"companyName":"Ege Kuyumculuk Ltd.","contactName":"Selma Hanım","phone":"02326540012","email":"selma@egekuyum.com","taxNumber":"4567890123"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "Ege Kuyumculuk Ltd.: $SUP3"

# ── 5. MÜŞTERİLER ────────────────────────────────────────
echo ""
echo "=== 5. Müşteriler ==="
CUS1=$(post "customers" '{"fullName":"Ayşe Kaya","phone":"05321234567","email":"ayse.kaya@gmail.com","notes":"Düzenli müşteri, 14 ayar tercih ediyor"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "Ayşe Kaya: $CUS1"
CUS2=$(post "customers" '{"fullName":"Mehmet Yılmaz","phone":"05334567890","email":"m.yilmaz@hotmail.com","notes":"Nişan yüzüğü için geldi"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "Mehmet Yılmaz: $CUS2"
CUS3=$(post "customers" '{"fullName":"Fatma Demir","phone":"05459876543","email":"","notes":"Annesi için hediye alıyor"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "Fatma Demir: $CUS3"
CUS4=$(post "customers" '{"fullName":"Ali Çelik","phone":"05367654321","email":"ali.celik@gmail.com","notes":""}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "Ali Çelik: $CUS4"
CUS5=$(post "customers" '{"fullName":"Zeynep Arslan","phone":"05411112233","email":"zeynep.arslan@outlook.com","notes":"22 ayar bilezik koleksiyonu yapıyor"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "Zeynep Arslan: $CUS5"
CUS6=$(post "customers" '{"fullName":"İbrahim Şahin","phone":"05523344556","email":"","notes":"Hurda altın getirdi"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "İbrahim Şahin: $CUS6"
CUS7=$(post "customers" '{"fullName":"Emine Öztürk","phone":"05389990011","email":"emine.ozturk@yandex.com","notes":"Kızının düğünü için hazırlık yapıyor"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "Emine Öztürk: $CUS7"
CUS8=$(post "customers" '{"fullName":"Hüseyin Aydın","phone":"05445566778","email":"h.aydin@gmail.com","notes":""}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "Hüseyin Aydın: $CUS8"

# ── 6. ÜRÜNLER ────────────────────────────────────────────
echo ""
echo "=== 6. Ürünler ==="

# Yüzükler
P1=$(post "products" "{\"name\":\"14 Ayar Taşlı Solitaire Yüzük\",\"categoryId\":\"$CAT_YUZUK\",\"weightGram\":3.50,\"purity\":14,\"purchasePrice\":14350.00,\"salePrice\":17200.00,\"stockQuantity\":4,\"barcode\":\"YZ001\"}" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "14 Ayar Solitaire Yüzük: $P1"

P2=$(post "products" "{\"name\":\"18 Ayar Pırlanta Montür Yüzük\",\"categoryId\":\"$CAT_YUZUK\",\"weightGram\":4.20,\"purity\":18,\"purchasePrice\":24500.00,\"salePrice\":29800.00,\"stockQuantity\":2,\"barcode\":\"YZ002\"}" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "18 Ayar Pırlanta Montür Yüzük: $P2"

P3=$(post "products" "{\"name\":\"14 Ayar Sade Alyans (Çift)\",\"categoryId\":\"$CAT_YUZUK\",\"weightGram\":5.60,\"purity\":14,\"purchasePrice\":22960.00,\"salePrice\":27500.00,\"stockQuantity\":5,\"barcode\":\"YZ003\"}" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "14 Ayar Alyans Çift: $P3"

P4=$(post "products" "{\"name\":\"14 Ayar Çift Sıra Zirkon Yüzük\",\"categoryId\":\"$CAT_YUZUK\",\"weightGram\":4.80,\"purity\":14,\"purchasePrice\":19680.00,\"salePrice\":23500.00,\"stockQuantity\":3,\"barcode\":\"YZ004\"}" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "14 Ayar Çift Sıra Zirkon Yüzük: $P4"

P5=$(post "products" "{\"name\":\"18 Ayar Söz Yüzüğü\",\"categoryId\":\"$CAT_YUZUK\",\"weightGram\":3.80,\"purity\":18,\"purchasePrice\":22100.00,\"salePrice\":26800.00,\"stockQuantity\":3,\"barcode\":\"YZ005\"}" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "18 Ayar Söz Yüzüğü: $P5"

# Bilezikler
P6=$(post "products" "{\"name\":\"22 Ayar Hasır Bilezik (20cm)\",\"categoryId\":\"$CAT_BILEZIK\",\"weightGram\":12.50,\"purity\":22,\"purchasePrice\":55000.00,\"salePrice\":63500.00,\"stockQuantity\":6,\"barcode\":\"BL001\"}" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "22 Ayar Hasır Bilezik: $P6"

P7=$(post "products" "{\"name\":\"22 Ayar Burgu Bilezik\",\"categoryId\":\"$CAT_BILEZIK\",\"weightGram\":10.20,\"purity\":22,\"purchasePrice\":44880.00,\"salePrice\":51900.00,\"stockQuantity\":4,\"barcode\":\"BL002\"}" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "22 Ayar Burgu Bilezik: $P7"

P8=$(post "products" "{\"name\":\"14 Ayar Taşlı Kelepçe Bilezik\",\"categoryId\":\"$CAT_BILEZIK\",\"weightGram\":8.90,\"purity\":14,\"purchasePrice\":36490.00,\"salePrice\":43800.00,\"stockQuantity\":2,\"barcode\":\"BL003\"}" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "14 Ayar Taşlı Kelepçe Bilezik: $P8"

P9=$(post "products" "{\"name\":\"22 Ayar Düz Bilezik (Ince)\",\"categoryId\":\"$CAT_BILEZIK\",\"weightGram\":7.80,\"purity\":22,\"purchasePrice\":34320.00,\"salePrice\":39800.00,\"stockQuantity\":8,\"barcode\":\"BL004\"}" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "22 Ayar Düz İnce Bilezik: $P9"

# Kolyeler
P10=$(post "products" "{\"name\":\"14 Ayar Kalp Kolye + Zincir\",\"categoryId\":\"$CAT_KOLYE\",\"weightGram\":3.20,\"purity\":14,\"purchasePrice\":13120.00,\"salePrice\":15800.00,\"stockQuantity\":5,\"barcode\":\"KL001\"}" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "14 Ayar Kalp Kolye: $P10"

P11=$(post "products" "{\"name\":\"18 Ayar Süslü Kolye Ucu + 50cm Zincir\",\"categoryId\":\"$CAT_KOLYE\",\"weightGram\":6.50,\"purity\":18,\"purchasePrice\":37700.00,\"salePrice\":45500.00,\"stockQuantity\":2,\"barcode\":\"KL002\"}" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "18 Ayar Süslü Kolye: $P11"

P12=$(post "products" "{\"name\":\"14 Ayar Burç Kolye (Aslan)\",\"categoryId\":\"$CAT_KOLYE\",\"weightGram\":2.80,\"purity\":14,\"purchasePrice\":11480.00,\"salePrice\":13900.00,\"stockQuantity\":3,\"barcode\":\"KL003\"}" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "14 Ayar Burç Kolye: $P12"

P13=$(post "products" "{\"name\":\"14 Ayar Figaro Zincir 45cm\",\"categoryId\":\"$CAT_KOLYE\",\"weightGram\":4.10,\"purity\":14,\"purchasePrice\":16810.00,\"salePrice\":20200.00,\"stockQuantity\":7,\"barcode\":\"KL004\"}" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "14 Ayar Figaro Zincir: $P13"

# Küpeler
P14=$(post "products" "{\"name\":\"14 Ayar Taşlı Küpe (Siyah Taş)\",\"categoryId\":\"$CAT_KUPE\",\"weightGram\":2.40,\"purity\":14,\"purchasePrice\":9840.00,\"salePrice\":11900.00,\"stockQuantity\":6,\"barcode\":\"KP001\"}" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "14 Ayar Taşlı Küpe: $P14"

P15=$(post "products" "{\"name\":\"18 Ayar Çember Küpe (3cm)\",\"categoryId\":\"$CAT_KUPE\",\"weightGram\":3.60,\"purity\":18,\"purchasePrice\":20880.00,\"salePrice\":25200.00,\"stockQuantity\":4,\"barcode\":\"KP002\"}" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "18 Ayar Çember Küpe: $P15"

P16=$(post "products" "{\"name\":\"14 Ayar Sade Halka Küpe (1.5cm)\",\"categoryId\":\"$CAT_KUPE\",\"weightGram\":1.80,\"purity\":14,\"purchasePrice\":7380.00,\"salePrice\":8900.00,\"stockQuantity\":10,\"barcode\":\"KP003\"}" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "14 Ayar Halka Küpe: $P16"

# Halhal
P17=$(post "products" "{\"name\":\"22 Ayar Halhal (Tamalı)\",\"categoryId\":\"$CAT_HALHAL\",\"weightGram\":18.00,\"purity\":22,\"purchasePrice\":79200.00,\"salePrice\":91000.00,\"stockQuantity\":2,\"barcode\":\"HH001\"}" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "22 Ayar Halhal: $P17"

# Set
P18=$(post "products" "{\"name\":\"14 Ayar Üçlü Set (Kolye+Küpe+Bileklik)\",\"categoryId\":\"$CAT_SET\",\"weightGram\":9.50,\"purity\":14,\"purchasePrice\":38950.00,\"salePrice\":46800.00,\"stockQuantity\":2,\"barcode\":\"ST001\"}" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "14 Ayar Üçlü Set: $P18"

P19=$(post "products" "{\"name\":\"18 Ayar İkili Set (Kolye+Küpe)\",\"categoryId\":\"$CAT_SET\",\"weightGram\":7.20,\"purity\":18,\"purchasePrice\":41760.00,\"salePrice\":50000.00,\"stockQuantity\":1,\"barcode\":\"ST002\"}" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "18 Ayar İkili Set: $P19"

P20=$(post "products" "{\"name\":\"14 Ayar Nişan Seti (Alyans Çift + Söz)\",\"categoryId\":\"$CAT_SET\",\"weightGram\":8.40,\"purity\":14,\"purchasePrice\":34440.00,\"salePrice\":41500.00,\"stockQuantity\":3,\"barcode\":\"ST003\"}" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
ok "14 Ayar Nişan Seti: $P20"

# ── 7. ALIŞLAR ────────────────────────────────────────────
echo ""
echo "=== 7. Alış İşlemleri ==="

# Tedarikçiden alışlar (son 3 ay)
post "purchases" "{\"purchaseDate\":\"2026-01-08T09:00:00\",\"totalAmountTRY\":320000.00,\"weightGram\":72.50,\"purity\":14,\"sourceType\":1,\"supplierId\":\"$SUP1\",\"notes\":\"Ocak ayı 14 ayar ürün alımı\"}" > /dev/null && ok "Alış 1 - Kapalıçarşı 72.5gr 14k"
post "purchases" "{\"purchaseDate\":\"2026-01-15T10:30:00\",\"totalAmountTRY\":198000.00,\"weightGram\":44.00,\"purity\":22,\"sourceType\":1,\"supplierId\":\"$SUP2\",\"notes\":\"22 ayar bilezik stoğu\"}" > /dev/null && ok "Alış 2 - İst.Kuyum 44gr 22k"
post "purchases" "{\"purchaseDate\":\"2026-02-03T09:15:00\",\"totalAmountTRY\":145000.00,\"weightGram\":32.20,\"purity\":18,\"sourceType\":1,\"supplierId\":\"$SUP1\",\"notes\":\"18 ayar ürün takviyesi\"}" > /dev/null && ok "Alış 3 - Kapalıçarşı 32.2gr 18k"
post "purchases" "{\"purchaseDate\":\"2026-02-20T11:00:00\",\"totalAmountTRY\":87000.00,\"weightGram\":19.80,\"purity\":22,\"sourceType\":1,\"supplierId\":\"$SUP3\",\"notes\":\"Ege kuyum - halhal ve bilezik\"}" > /dev/null && ok "Alış 4 - Ege Kuyum 19.8gr 22k"
post "purchases" "{\"purchaseDate\":\"2026-03-05T08:45:00\",\"totalAmountTRY\":410000.00,\"weightGram\":92.00,\"purity\":14,\"sourceType\":1,\"supplierId\":\"$SUP1\",\"notes\":\"Mart bahar koleksiyonu alımı\"}" > /dev/null && ok "Alış 5 - Kapalıçarşı 92gr 14k"
post "purchases" "{\"purchaseDate\":\"2026-03-18T14:00:00\",\"totalAmountTRY\":234000.00,\"weightGram\":52.00,\"purity\":22,\"sourceType\":1,\"supplierId\":\"$SUP2\",\"notes\":\"Düğün sezonu öncesi 22 ayar stok\"}" > /dev/null && ok "Alış 6 - İst.Kuyum 52gr 22k"
post "purchases" "{\"purchaseDate\":\"2026-04-02T09:30:00\",\"totalAmountTRY\":168000.00,\"weightGram\":37.50,\"purity\":18,\"sourceType\":1,\"supplierId\":\"$SUP3\",\"notes\":\"Nisan 18 ayar ürün\"}" > /dev/null && ok "Alış 7 - Ege Kuyum 37.5gr 18k"

# Müşteriden hurda alışlar
post "purchases" "{\"purchaseDate\":\"2026-02-10T16:00:00\",\"totalAmountTRY\":38500.00,\"weightGram\":9.80,\"purity\":14,\"sourceType\":2,\"customerId\":\"$CUS6\",\"notes\":\"İbrahim Şahin'den eski 14 ayar bilezik\"}" > /dev/null && ok "Alış 8 - İbr.Şahin hurda 9.8gr"
post "purchases" "{\"purchaseDate\":\"2026-03-25T15:30:00\",\"totalAmountTRY\":22000.00,\"weightGram\":5.20,\"purity\":18,\"sourceType\":2,\"customerId\":\"$CUS3\",\"notes\":\"Fatma Demir - eski yüzük\"}" > /dev/null && ok "Alış 9 - Fatma Demir hurda 5.2gr"
post "purchases" "{\"purchaseDate\":\"2026-04-07T11:00:00\",\"totalAmountTRY\":112000.00,\"weightGram\":25.50,\"purity\":22,\"sourceType\":3,\"notes\":\"Hurda altın alımı (çeşitli)\"}" > /dev/null && ok "Alış 10 - Hurda 25.5gr 22k"

# ── 8. SATIŞLAR ───────────────────────────────────────────
echo ""
echo "=== 8. Satış İşlemleri ==="

# Ocak satışları
post "sales" "{\"customerId\":\"$CUS1\",\"saleDate\":\"2026-01-10T14:30:00\",\"items\":[{\"productId\":\"$P10\",\"quantity\":1,\"unitPriceTRY\":0},{\"productId\":\"$P16\",\"quantity\":1,\"unitPriceTRY\":0}],\"notes\":\"Doğum günü hediyesi\"}" > /dev/null && ok "Satış 1 - Ayşe Kaya: Kalp Kolye + Halka Küpe"
post "sales" "{\"customerId\":\"$CUS2\",\"saleDate\":\"2026-01-18T11:00:00\",\"items\":[{\"productId\":\"$P3\",\"quantity\":1,\"unitPriceTRY\":0}],\"notes\":\"Nişan alyansı\"}" > /dev/null && ok "Satış 2 - Mehmet Yılmaz: Alyans Çift"
post "sales" "{\"customerId\":null,\"saleDate\":\"2026-01-22T16:15:00\",\"items\":[{\"productId\":\"$P9\",\"quantity\":1,\"unitPriceTRY\":0},{\"productId\":\"$P14\",\"quantity\":1,\"unitPriceTRY\":0}],\"notes\":\"Nakit satış\"}" > /dev/null && ok "Satış 3 - Nakit: 22k Bilezik + Taşlı Küpe"
post "sales" "{\"customerId\":\"$CUS5\",\"saleDate\":\"2026-01-29T10:00:00\",\"items\":[{\"productId\":\"$P6\",\"quantity\":1,\"unitPriceTRY\":0},{\"productId\":\"$P7\",\"quantity\":1,\"unitPriceTRY\":0}],\"notes\":\"Zeynep Hanım - koleksiyon alımı\"}" > /dev/null && ok "Satış 4 - Zeynep Arslan: 2x Bilezik"

# Şubat satışları
post "sales" "{\"customerId\":\"$CUS7\",\"saleDate\":\"2026-02-08T13:00:00\",\"items\":[{\"productId\":\"$P17\",\"quantity\":1,\"unitPriceTRY\":0}],\"notes\":\"Kızı için düğün çeyizi\"}" > /dev/null && ok "Satış 5 - Emine Öztürk: 22k Halhal"
post "sales" "{\"customerId\":\"$CUS4\",\"saleDate\":\"2026-02-14T15:30:00\",\"items\":[{\"productId\":\"$P1\",\"quantity\":1,\"unitPriceTRY\":0}],\"notes\":\"Sevgililer Günü hediyesi\"}" > /dev/null && ok "Satış 6 - Ali Çelik: Solitaire Yüzük (14 Şubat)"
post "sales" "{\"customerId\":null,\"saleDate\":\"2026-02-19T12:00:00\",\"items\":[{\"productId\":\"$P12\",\"quantity\":1,\"unitPriceTRY\":0},{\"productId\":\"$P16\",\"quantity\":2,\"unitPriceTRY\":0}],\"notes\":\"\"}" > /dev/null && ok "Satış 7 - Nakit: Burç Kolye + 2 Halka Küpe"
post "sales" "{\"customerId\":\"$CUS8\",\"saleDate\":\"2026-02-26T11:30:00\",\"items\":[{\"productId\":\"$P18\",\"quantity\":1,\"unitPriceTRY\":0}],\"notes\":\"Annesi için üçlü set\"}" > /dev/null && ok "Satış 8 - Hüseyin Aydın: 14k Üçlü Set"

# Mart satışları
post "sales" "{\"customerId\":\"$CUS1\",\"saleDate\":\"2026-03-08T14:00:00\",\"items\":[{\"productId\":\"$P15\",\"quantity\":1,\"unitPriceTRY\":0}],\"notes\":\"Kadınlar Günü hediyesi\"}" > /dev/null && ok "Satış 9 - Ayşe Kaya: 18k Çember Küpe (8 Mart)"
post "sales" "{\"customerId\":\"$CUS3\",\"saleDate\":\"2026-03-15T10:30:00\",\"items\":[{\"productId\":\"$P4\",\"quantity\":1,\"unitPriceTRY\":0},{\"productId\":\"$P13\",\"quantity\":1,\"unitPriceTRY\":0}],\"notes\":\"Annesi için yüzük ve zincir\"}" > /dev/null && ok "Satış 10 - Fatma Demir: Yüzük + Zincir"
post "sales" "{\"customerId\":\"$CUS5\",\"saleDate\":\"2026-03-22T16:00:00\",\"items\":[{\"productId\":\"$P9\",\"quantity\":2,\"unitPriceTRY\":38500.00}],\"notes\":\"İkinci bilezik - indirimli\"}" > /dev/null && ok "Satış 11 - Zeynep Arslan: 2x İnce Bilezik (indirimli)"
post "sales" "{\"customerId\":null,\"saleDate\":\"2026-03-28T13:15:00\",\"items\":[{\"productId\":\"$P2\",\"quantity\":1,\"unitPriceTRY\":0}],\"notes\":\"Pırlanta montür - nakit\"}" > /dev/null && ok "Satış 12 - Nakit: 18k Pırlanta Yüzük"
post "sales" "{\"customerId\":\"$CUS7\",\"saleDate\":\"2026-03-31T11:00:00\",\"items\":[{\"productId\":\"$P6\",\"quantity\":1,\"unitPriceTRY\":0},{\"productId\":\"$P9\",\"quantity\":1,\"unitPriceTRY\":0}],\"notes\":\"Düğün için ek alım\"}" > /dev/null && ok "Satış 13 - Emine Öztürk: 2x Bilezik"

# Nisan satışları (bu hafta)
post "sales" "{\"customerId\":\"$CUS2\",\"saleDate\":\"2026-04-03T10:00:00\",\"items\":[{\"productId\":\"$P5\",\"quantity\":1,\"unitPriceTRY\":0}],\"notes\":\"Nişan yüzüğü - 18 ayar\"}" > /dev/null && ok "Satış 14 - Mehmet Yılmaz: 18k Söz Yüzüğü"
post "sales" "{\"customerId\":\"$CUS4\",\"saleDate\":\"2026-04-05T15:00:00\",\"items\":[{\"productId\":\"$P11\",\"quantity\":1,\"unitPriceTRY\":0}],\"notes\":\"\"}" > /dev/null && ok "Satış 15 - Ali Çelik: 18k Süslü Kolye"
post "sales" "{\"customerId\":null,\"saleDate\":\"2026-04-08T12:30:00\",\"items\":[{\"productId\":\"$P14\",\"quantity\":2,\"unitPriceTRY\":0},{\"productId\":\"$P16\",\"quantity\":2,\"unitPriceTRY\":0}],\"notes\":\"Toplu küpe satışı - nakit\"}" > /dev/null && ok "Satış 16 - Nakit: 4x Küpe"
post "sales" "{\"customerId\":\"$CUS1\",\"saleDate\":\"2026-04-09T11:00:00\",\"items\":[{\"productId\":\"$P20\",\"quantity\":1,\"unitPriceTRY\":0}],\"notes\":\"Nişan seti - Ayşe Hanım kızı için\"}" > /dev/null && ok "Satış 17 - Ayşe Kaya: Nişan Seti"

echo ""
echo "=================================================="
echo -e "${COLOR_OK}✓ Seed tamamlandı!${RESET}"
echo "  Kategoriler : 6"
echo "  Konumlar    : 4"
echo "  Tedarikçiler: 3"
echo "  Müşteriler  : 8"
echo "  Ürünler     : 20"
echo "  Alışlar     : 10"
echo "  Satışlar    : 17"
echo "=================================================="
