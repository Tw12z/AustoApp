# Austo — Kuyumcu Yönetim Sistemi

> **AU** (Altın element sembolü) + **Stok** = **Austo**  
> Kuyumcular için uçtan uca dijital yönetim platformu.

---

## Hakkında

Austo, kuyumcu işletmelerinin tüm süreçlerini tek bir platformdan yönetmesini sağlayan modern bir stok ve işlem yönetim sistemidir. Canlı altın fiyatlarından satış takibine, QR kod entegrasyonundan çoklu lokasyon yönetimine kadar kuyumculuk sektörüne özel ihtiyaçlar göz önünde bulundurularak geliştirilmiştir.

---

## Özellikler

- **Canlı Altın Fiyatları** — Gram, çeyrek, yarım ve tam altın fiyatlarını anlık takip edin. USD, EUR, GBP kurları otomatik güncellenir.
- **Stok Yönetimi** — Ürünleri ayar bazında kategorize edin. K8'den K24'e kadar tüm saflık derecelerini yönetin.
- **Satış & Alış Takibi** — Müşteri ve tedarikçi işlemlerini kolayca kaydedin. Hurdadan alımlara kadar her senaryoyu destekler.
- **Gelişmiş Raporlar** — Günlük özet, stok değerleme ve kar/zarar raporlarını anında görüntüleyin.
- **QR Kod Entegrasyonu** — Her ürün için otomatik QR kod oluşturun. Barkod ile hızlı ürün takibi yapın.
- **Çoklu Lokasyon** — Vitrin, kasa, kasa altı gibi farklı konumlar arasında stok transferini kolayca yönetin.
- **Güvenli & Rol Bazlı Erişim** — JWT kimlik doğrulama ile verileriniz güvende. Admin ve personel rolleri ile erişim kontrolü.
- **E-posta Doğrulama** — Kayıt ve şifre sıfırlama süreçlerinde e-posta doğrulaması.

---

## Teknoloji Yığını

### Backend
| Katman | Teknoloji |
|---|---|
| Framework | .NET 10 |
| Mimari | Onion Architecture |
| Veritabanı | SQL Server + Entity Framework Core |
| Kimlik Doğrulama | JWT Bearer Token |
| API Dokümantasyonu | Scalar (OpenAPI) |
| E-posta | MailKit / MimeKit |
| QR Kod | QRCoder |
| Canlı Altın Fiyatı | finans.truncgil.com API |

### Frontend
| Katman | Teknoloji |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite |
| Stil | Tailwind CSS |
| Animasyon | Framer Motion |
| HTTP İstemcisi | Axios |
| İkonlar | Lucide React |

---

## Proje Yapısı

```
Austo26/
├── Core/
│   ├── Austo26.Domain/          # Entity'ler, Enum'lar
│   └── Austo26.Application/     # Arayüzler, DTO'lar, Servis Sözleşmeleri
├── Infrastructure/
│   ├── Austo26.Infrastructure/  # JWT, Mail, QR, Altın Fiyat Servisleri
│   └── Austo26.Persistence/     # DbContext, Repository'ler, Migrations
├── Presentation/
│   └── Austo26.API/             # Controller'lar, Program.cs
└── austo-ui/                    # React Frontend
```

---

## Domain Modelleri

| Model | Açıklama |
|---|---|
| `Product` | Ürün (gram, ayar, kategori, lokasyon) |
| `Category` | Ürün kategorisi |
| `Location` | Depolama lokasyonu (vitrin, kasa vb.) |
| `StockMovement` | Stok hareketi kaydı |
| `SaleTransaction` | Satış işlemi |
| `SaleTransactionItem` | Satış kalemi |
| `PurchaseTransaction` | Alış işlemi (tedarikçi, müşteri, hurda) |
| `GoldPriceLog` | Günlük altın fiyat kaydı |
| `Customer` | Müşteri |
| `Supplier` | Tedarikçi |
| `User` | Kullanıcı (Admin / Personel) |

### Altın Saflık Dereceleri (`GoldPurity`)
`K8 · K14 · K18 · K21 · K22 · K24 · Diğer`

---

## Kurulum

### Gereksinimler
- .NET 10 SDK
- Node.js 20+
- SQL Server

### Backend

```bash
# Bağlantı dizesini ayarlayın
# appsettings.json → ConnectionStrings:DefaultConnection

# Veritabanı migration'ını çalıştırın
cd Presentation/Austo26.API
dotnet ef database update --project ../../Infrastructure/Austo26.Persistence

# API'yi başlatın
dotnet run
```

API varsayılan olarak `http://localhost:5202` adresinde çalışır.  
Dokümantasyon: `http://localhost:5202/scalar`

### Frontend

```bash
cd austo-ui
npm install
npm run dev
```

Uygulama varsayılan olarak `http://localhost:5173` adresinde çalışır.

---

## API Endpointleri

| Controller | Prefix | Açıklama |
|---|---|---|
| AuthController | `/api/auth` | Giriş, kayıt, e-posta doğrulama |
| CategoriesController | `/api/categories` | Kategori CRUD |
| LocationsController | `/api/locations` | Lokasyon CRUD |
| ProductsController | `/api/products` | Ürün yönetimi |
| CustomersController | `/api/customers` | Müşteri yönetimi |
| SuppliersController | `/api/suppliers` | Tedarikçi yönetimi |
| SalesController | `/api/sales` | Satış işlemleri |
| PurchasesController | `/api/purchases` | Alış işlemleri |
| StockController | `/api/stock` | Stok hareketleri |
| FinanceController | `/api/finance` | Canlı altın fiyatları |
| ReportsController | `/api/reports` | Raporlar |

---

## Lisans

Bu proje özel kullanım amaçlı geliştirilmiştir.

---

<p align="center">
  Kuyumculuk sektörü için ❤️ ile geliştirildi
</p>
