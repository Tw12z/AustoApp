# Austo Proje Kararları ve Canlı Ortam Notları

Bu dosya `DEPLOYMENT.md`, `README.md`, `docker-compose.yml`, `Dockerfile` ve git geçmişinden (71 commit, 2026-04-09 – 2026-09-11) derlendi. Eski geliştirme konuşmasına ulaşılamadığı için tasarım ve iş kararlarının "neden"i çoğunlukla yoktur. Kodda ya da commit mesajında açıkça yazan şeyler yazıldı; olmayanlar `[belirsiz]` olarak bırakıldı.

## Canlı ortam

Uygulama canlıda (kullanıcı bildirdi). Aşağıdaki alanlar repoda yoktur ve bilinmiyor; sahibi doldurmalıdır. **Parola, anahtar ve bağlantı dizesi buraya yazılmaz.**

| Konu | Bilgi |
|---|---|
| Alan adı (arayüz / API) | [belirsiz] |
| API'nin çalıştığı sunucu | [belirsiz] (hedeflenen: Oracle Cloud Always Free Ampere A1, yedek: Hetzner CX22) |
| Arayüz barındırma | [belirsiz] (Vercel / Netlify / Cloudflare Pages / nginx seçenekleri belgelendi) |
| TLS / ters vekil | [belirsiz] (nginx veya Caddy önerildi) |
| SMTP sağlayıcısı | [belirsiz] (kodda MailKit kullanılıyor; bir commit "gmail mail entegrasyonu" diyor) |
| `ALLOW_REGISTRATION` şu anki değeri | [belirsiz] |
| Yedekleme | [belirsiz] (repoda yedekleme tanımı yok) |
| İzleme / log | [belirsiz] |

## Mimari ve teknik kararlar

- **İki bağımsız parça:** .NET 10 Web API (`Presentation/Austo26.API`, Docker ile) ve Vite/React statik arayüz (`austo-ui`, `dist/` herhangi bir statik barındırmaya konur). `DEPLOYMENT.md`.
- **Onion Architecture:** `Core/Austo26.Domain`, `Core/Austo26.Application`, `Infrastructure/Austo26.Infrastructure` (JWT, Mail, QR, altın fiyat servisleri), `Infrastructure/Austo26.Persistence` (DbContext, repository, migration), `Presentation/Austo26.API`. `README.md`.
- **PostgreSQL:** SQL Server'dan geçildi (commit "Migrate to PostgreSQL so the app can run free on Oracle Cloud's ARM tier"). Neden: Microsoft'un SQL Server Linux imajının arm64 sürümü yok, `postgres:18` var. Geçiş temiz bir provider değişimiydi, ham SQL yoktu. `README.md` hâlâ SQL Server yazıyor; **bu eski bilgidir**.
- **Npgsql ve `DateTime.Kind`:** Npgsql varsayılanda `timestamp with time zone` için `Kind=Utc` ister; uygulama `DateTime.UtcNow`, `DateTime.Today` ve `[FromQuery] DateTime` (Kind=Unspecified) karışımını kullandığı için yazma hatası verdi. Çözüm iki parça: `AppDbContext.ConfigureConventions` tüm `DateTime` sütunlarını `timestamp without time zone` yapar ve `Presentation/Austo26.API/Program.cs` içinde `AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true)` vardır. "Cannot write DateTime with Kind=..." hatası görülürse ilk bakılacak yer burası.
- **Postgres 18 volume yolu:** `docker-compose.yml` içinde veri `/var/lib/postgresql` yoluna bağlanır (`austo_pgdata`). `/var/lib/postgresql/data` yoluna bağlamak konteynerin "unhealthy" kalmasına yol açtı (commit "Fix postgres:18 volume mount path").
- **Migration otomatik uygulanır:** API açılışında bekleyen EF Core migration'ları uygulanır (commit "Apply pending EF Core migrations automatically at API startup"). Bu yüzden `DEPLOYMENT.md` bölüm 4'teki elle `dotnet ef database update` adımı **eskidir**; ayrıca runtime imajı `aspnet:10.0` olduğu için SDK içermez ve konteynerde `dotnet ef` büyük olasılıkla çalışmaz.
- **Gizli bilgiler ortam değişkeniyle verilir,** `appsettings.json` içine gerçek değer yazılmaz. ASP.NET Core `Section:Key` değerini `Section__Key` olarak okur. Dockerfile bunları imajın içine gömmez. İmza anahtarı (`Token__SecurityKey`) önceki sürümde repoda açık kaldığı için "yanmış" sayılır ve yeniden üretilmelidir. `DEPLOYMENT.md`.
- **API ortam değişkenleri:** `ConnectionStrings__DefaultConnection`, `Token__SecurityKey`, `MailSettings__UserName` / `MailSettings__Password`, `Cors__AllowedOrigins__0` (birden fazla için `__1`, `__2`…), `ClientUrl`, `ASPNETCORE_ENVIRONMENT` (Dockerfile'da `Production`; `/scalar` API dokümanını kapatır, HTTPS yönlendirmesini açar), `Auth__AllowRegistration`.
- **Compose değişkenleri (`.env.docker`, gitignore'da):** `DB_PASSWORD`, `TOKEN_SECURITY_KEY`, `FRONTEND_URL`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `ALLOW_REGISTRATION`. Şablon: `.env.docker.example`.
- **API düz HTTP 8080'de dinler** (`ASPNETCORE_URLS=http://+:8080`), TLS API'nin önündeki ters vekilde sonlanır.
- **CORS:** `Cors:AllowedOrigins` ayarlı değilse yerel geliştirme kaynaklarına döner (`Presentation/Austo26.API/Program.cs`).
- **Mail ayarsızsa:** `MailSettings` boşsa doğrulama ve şifre sıfırlama e-postaları sessizce gönderilmez; API bunun yerine geliştirme amaçlı bir token döndürür (`devVerifyToken`). Canlıda `ClientUrl` `localhost` kalırsa e-postadaki bağlantılar çalışmaz.
- **Arayüz API adresi:** `VITE_API_URL` (örn. `https://api.alanadi.com/api`) Vite tarafından **derleme anında** gömülür; deploy sonrası dosya düzenlemekle değişmez, yeniden build gerekir. Ayarlı değilse `client.ts` `http://localhost:5202/api` adresine döner. `austo-ui/.env.example`.
- **SPA yönlendirmesi:** Arayüz istemci tarafı yönlendirmeli olduğu için barındırmanın bilinmeyen yollarda `index.html` döndürmesi gerekir (nginx: `try_files $uri /index.html;`).
- **Kayıt kapatma anahtarı:** `Auth:AllowRegistration` (`Auth__AllowRegistration`). Değer ayarlı değil ya da çözümlenemezse kayıt **açık** sayılır. Girişler ve mevcut hesaplar etkilenmez. Commit "Temporarily disable public registration" bu anahtarı kapatmak için kullanıldı. `Infrastructure/Austo26.Persistence/Services/AuthService.cs`, `docker-compose.yml`.
- **Yasal belgeler ve onay kaydı:** Kayıtta kullanıcının koşulları kabul ettiği ve hangi sürümü kabul ettiği saklanır (`User.TermsAcceptedAt`, `RecordTermsAcceptance`, migration `AddTermsAcceptance`). `Core/Austo26.Domain/Users/User.cs`, `AuthService.cs` (`CurrentLegalVersion`).
- **Günlük altın fiyatı kaydı:** Arka plan servisi günlük fiyatı otomatik kaydeder (`GoldPriceLog`); sonradan döviz ve tam altın türleri de fiyat geçmişine eklendi. Canlı fiyat kaynağı `finans.truncgil.com` API'sidir.
- **QR takibi:** Her ürün kalemi için ayrı QR (`StockItem` entity'si, commit 2026-04-18).
- **Raporlar:** Günlük / haftalık / aylık / yıllık satış raporları PDF olarak indirilir. Türkçe karakter ve ₺ bozulması düzeltildi, gerçek logo kullanıldı.
- **Rol modeli:** Admin ve Personel rolleri, JWT Bearer kimlik doğrulama. İlk admin kullanıcı API'nin kayıt ve e-posta doğrulama uçlarıyla oluşturulur; veritabanında hazır veri yoktur.

## Tasarım ve UI tercihleri

Kodda ve commit'lerde görünenler (nedenleri bilinmiyor):

- Açılış sayfası: altın külçeleri ve gösterge paneli yansıması olan hero, hareketli demo panelleri, "How It Works" bağlantılı yol tasarımı, tek satır "ticker" bandı. Özellik bölümü birkaç kez yeniden tasarlanıp (carousel, bento, 3D halka, düz grid) sonunda dört öne çıkan özelliğin demosuna yerleşti; "CardSwap" denemesi geri alındı (revert).
- Çok dilli arayüz (tr/en), kompakt dil değiştirici tek boyut olarak bırakıldı. `austo-ui/src/i18n/locales`.
- Hesap makinesi önce köşede yüzen düğme olarak eklendi, sonra saatin yanında küçük bir açılır menüye taşındı.
- Stat kartlarında Austo logosu filigran olarak ve neon parıltıyla kullanılıyor; konum ve kalınlık birçok kez ince ayarlandı. Tasarım dili için `DESIGN.md` ve `PRODUCT.md` dosyalarına bak.
- Mobil: gerçek cihaz görüntü alanıyla test edilerek iki hata düzeltildi; üst bilgideki dokunma hedefleri büyütüldü, ürün tablosunun yeniden boyutlanırken dağılması düzeltildi.
- Finans grafiği: değişim yüzdesine normalize edilir, küçük büyüklüklü enstrümanlarda ondalık gösterilir.

## İş kuralları

- **Altın saflık dereceleri:** K8, K14, K18, K21, K22, K24 ve Diğer (`GoldPurity`).
- **Alış türleri:** tedarikçiden, müşteriden ve hurdadan alış desteklenir (`PurchaseTransaction`).
- **Çoklu lokasyon:** vitrin, kasa, kasa altı gibi konumlar arasında stok transferi (`Location`, `StockMovement`).
- **Raporlar:** günlük özet, stok değerleme ve kâr/zarar.
- Fiyatlandırma, işçilik/milyem hesabı ve KDV kuralları gibi iş kuralları için repoda açık bir belge yok [belirsiz].

## Denenip vazgeçilenler

- Özellik bölümünde "3D CardSwap stack" denendi ve geri alındı (revert). Başka denemeler için nedenler bilinmiyor.
- SQL Server: ilk sürümde kullanıldı, PostgreSQL'e geçildi (ücretsiz ARM barındırma nedeniyle).

## Yarım kalan işler / bilinen eksikler

- Otomatik test yok. `DEPLOYMENT.md` bölüm 7.
- CI/CD yok, deploy elle yapılıyor.
- `Microsoft.IdentityModel.Tokens`, `System.IdentityModel.Tokens.Jwt` ve `Scalar.AspNetCore` paketleri `.csproj` içinde sabitlenenden birkaç küçük sürüm üstüne çözülüyor (kozmetik `NU1603` uyarısı). Lansmandan önce test edilmemiş bir kimlik doğrulama kütüphanesi güncellemesinden kaçınmak için bilerek bırakıldı.
- `README.md` eskidir: SQL Server ve elle migration anlatır. Güncellenmeli.
- `DEPLOYMENT.md` bölüm 4: elle `dotnet ef database update` adımı eskidir (yukarıya bak).
- Repo kökünde `Austo26/` adında ayrı bir proje klasörü ve kaydedilmiş bir web sayfası (`Austo — Kuyumcu Yönetim Sistemi.html` ve `_files` klasörü) duruyor; ikisi de uygulamayla ilgisiz görünüyor [doğrulanmadı].
- `DEPLOYMENT.md` bölüm 3'teki yerel geliştirme örneği zayıf bir admin parolası içerir; canlıda kullanılmamalı.
- Yedekleme, izleme, TLS sertifikası yenileme ve alan adı bilgileri belgelenmemiş.
