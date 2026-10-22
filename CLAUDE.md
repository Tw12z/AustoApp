# Austo

Kuyumcular için stok ve işlem yönetim sistemi. Karar ve canlı ortam notları için `docs/KARARLAR.md`, kurulum için `DEPLOYMENT.md` dosyasına bak. Koda dair yapısal sorularda önce `graphify query "<soru>"` kullan (graph: `graphify-out/graph.json`).

## Çalışma kuralları

- Uygulama **canlıda**. Veritabanı şemasını değiştiren işler (migration) API açılışında otomatik uygulanır; migration eklemeden önce canlı veriye etkisini düşün.
- Veritabanı PostgreSQL (SQL Server değil). `README.md` bu konuda eskidir.
- Gizli bilgiyi (`Token__SecurityKey`, bağlantı dizesi, SMTP parolası) `appsettings.json`'a, koda ya da sohbete yazma; ortam değişkeniyle verilir. `.env.docker` gitignore'dadır.
- Npgsql `DateTime.Kind` hatalarında önce `Program.cs`'teki `Npgsql.EnableLegacyTimestampBehavior` anahtarına ve `AppDbContext.ConfigureConventions`'a bak.
- Arayüzde API adresi `VITE_API_URL` ile derleme anında gömülür; değişirse yeniden build gerekir.
- Kayıt kapatma anahtarı: `Auth__AllowRegistration` (`ALLOW_REGISTRATION`).
- Commit ve push yalnızca kullanıcı isteyince yapılır.
