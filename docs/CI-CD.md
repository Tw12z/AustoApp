# CI/CD kurulumu

Bu depoda iki iş akışı var:

| Dosya | Ne zaman çalışır | Ne yapar |
|---|---|---|
| `.github/workflows/ci.yml` | master'a push, her pull request, elle | Derler ve testleri çalıştırır. Hiçbir şey deploy etmez. |
| `.github/workflows/deploy.yml` | **sadece elle**, onay kutusu + ortam onayı ile | CI'ı baştan çalıştırır, sonra onay bekler, sonra sunucuya çıkar. |

Ayrım kasıtlı: CI her değişiklikte çalışıp hatayı erken yakalar, deploy ise
siz istemeden hiç çalışmaz. Testler büyüdükçe deploy'u tam otomatiğe
(master'a her merge'de) çevirmek tek satırlık bir değişiklik olacak; o güne
kadar iki kapılı kalması daha güvenli.

## CI ne kontrol ediyor?

- **Backend**: `dotnet build` (Release) ve `dotnet test`. Testler
  `Tests/Austo26.UnitTests` altında; parola hashleme, JWT üretimi, ürün stok
  kuralları, parça/konum takibi ve satış toplamları kapsanıyor.
- **Frontend**: `npm ci` + `npm run build`. Build komutu önce `tsc -b`
  çalıştırdığı için tip hataları da burada yakalanır.
- **Docker**: API imajı (`Presentation/Austo26.API/Dockerfile`) derleniyor.
  Sunucuya giden şey bu imaj olduğu için, kırılmasını canlıda değil burada
  görmek istiyoruz. İmaj hiçbir yere itilmiyor.

`npm run lint` şimdilik **bloklayıcı değil**: master'da bugün 39 eslint hatası
var, lint'i zorunlu yapmak CI'ı ilk günden kırmızıya düşürürdü. Hatalar
temizlendiğinde `ci.yml` içindeki `continue-on-error: true` satırı silinmeli.

## Deploy'u çalıştırmak

1. GitHub > **Actions** > **Deploy (manuel onaylı)** > **Run workflow**
2. Açılan kutuya `deploy` yazın (yanlışlıkla tıklamaya karşı fren).
3. CI çalışır. Kırmızıysa iş burada biter, sunucuya bir şey gitmez.
4. CI yeşilse iş **onay bekleyerek durur**; GitHub size bildirim gönderir.
   Onayladığınızda sunucuya çıkar.

Deploy adımları sunucuda şunu yapar: `git reset --hard origin/master` →
`docker compose up -d --build` → (isteğe bağlı) EF migrasyonları → API'nin
cevap verdiğini doğrulayan kısa bir duman testi.

## Sizin tanımlamanız gerekenler

Hiçbiri kodda duramaz; hepsi GitHub'da tanımlanır. Bunlar tanımlanana kadar
deploy iş akışı **başlamadan** durur ve neyin eksik olduğunu söyler. CI ise
hiçbirine ihtiyaç duymaz, ilk push'ta çalışmaya başlar.

### 1. `production` ortamı ve onay kuralı

**Settings > Environments > New environment** → adı tam olarak `production`.
İçinde **Required reviewers** kutusunu işaretleyip kendinizi ekleyin.
Onay kapısı budur; bu kutu işaretlenmezse deploy onay beklemeden devam eder.

### 2. Secrets

**Settings > Secrets and variables > Actions > Secrets** sekmesi:

| Secret | Ne |
|---|---|
| `DEPLOY_HOST` | Sunucunun IP'si veya alan adı |
| `DEPLOY_USER` | SSH kullanıcısı (ör. `ubuntu`) |
| `DEPLOY_SSH_KEY` | Özel SSH anahtarının tamamı. Bu iş için ayrı bir anahtar üretin: `ssh-keygen -t ed25519 -C "github-actions" -f austo_deploy` — açık kısmı (`austo_deploy.pub`) sunucudaki `~/.ssh/authorized_keys` dosyasına, özel kısmı (`austo_deploy`) buraya. |
| `DEPLOY_KNOWN_HOSTS` | *(önerilir)* `ssh-keyscan -H <sunucu-adresi>` çıktısı. Tanımlanmazsa bağlantı yine kurulur ama sunucunun kimliği ilk seferde sorgusuz kabul edilir. |

### 3. Variables

Aynı sayfanın **Variables** sekmesi (bunlar sır değil, log'da görünebilir):

| Variable | Ne | Örnek |
|---|---|---|
| `DEPLOY_PATH` | Sunucuda deponun klonlu olduğu dizin | `/home/ubuntu/AustoApp` |
| `VITE_API_URL` | Frontend'in derleme anında gömeceği API adresi | `https://api.austo.com.tr/api` |

### 4. Sunucu tarafında bir kerelik hazırlık

Deploy iş akışı sunucuyu sıfırdan kurmaz; hazır bir kurulumu günceller
(bkz. `DEPLOYMENT.md`, bölüm 4). `DEPLOY_PATH` altında şunlar hazır olmalı:

- Depo klonlanmış olmalı (`git clone`), `master` dalında.
- `.env.docker` dosyası doldurulmuş olmalı. **Gerçek sırlar orada durur,
  GitHub'da değil** — deploy onu hiç değiştirmez.
- Docker ve docker compose kurulu, kullanıcı `docker` grubunda olmalı.

## Frontend nereye çıkıyor?

Şimdilik hiçbir yere: deploy iş akışı `dist/` paketini üretip GitHub'a
**artifact** olarak bırakıyor, oradan indirip elle yüklüyorsunuz. Statik
hosting (Vercel / Cloudflare Pages / nginx) tarafı seçildiğinde `deploy.yml`
içindeki `frontend` işine bir yükleme adımı eklenecek.

## Sırada ne var?

- Lint hatalarını temizleyip lint'i bloklayıcı yapmak.
- master dalına **branch protection**: "CI geçmeden merge edilemez" kuralı.
  (Settings > Branches > Add rule > Require status checks to pass)
- Testler arttıkça deploy'u master'a merge ile otomatik tetiklemek.
