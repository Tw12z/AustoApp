# Deployment

This app has two independent deployables:

- **`Presentation/Austo26.API`** — .NET 10 Web API (`Dockerfile` included)
- **`austo-ui`** — Vite/React static build (deploy the `dist/` output to any static host)

Database is **PostgreSQL** (migrated from SQL Server specifically to run
free on Oracle Cloud's ARM tier — see "Why Postgres" below).

Nothing below is optional — every item here was, until now, either hardcoded
to `localhost` or a real secret sitting in a public repo. Skipping one means
the app either doesn't run or is running with a known-public signing key.

## 1. Backend environment variables

Set these wherever the container/process actually runs — **never** commit
real values to `appsettings.json`. ASP.NET Core reads `Section:Key` as
`Section__Key` (double underscore) from the environment.

| Variable | Example | Notes |
|---|---|---|
| `ConnectionStrings__DefaultConnection` | `Host=db;Port=5432;Database=AustoDB;Username=austo_app;Password=...` | Real Postgres instance — LocalDB/local Postgres only exist on the dev machine |
| `Token__SecurityKey` | a random 64+ char string | **Generate a fresh one** — `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"`. The value that shipped in this repo before this pass is permanently visible in git history; treat it as burned, never reuse it |
| `MailSettings__UserName` / `MailSettings__Password` | your SMTP account | Currently blank — verification/password-reset emails silently no-op without this (the API just returns a dev token instead of sending mail) |
| `Cors__AllowedOrigins__0` | `https://yourdomain.com` | Add `__1`, `__2`, ... for additional origins. Falls back to the localhost dev origins if unset |
| `ClientUrl` | `https://yourdomain.com` | Used to build the links inside verification/reset emails — leaving this as `localhost` means those links go nowhere for real users |
| `ASPNETCORE_ENVIRONMENT` | `Production` | Already set in the Dockerfile; disables the `/scalar` API docs UI and enables HTTPS redirection |

Run migrations against the real database once, from a machine that can reach
it:
```
dotnet ef database update --project Infrastructure/Austo26.Persistence --startup-project Presentation/Austo26.API
```

## 2. Why Postgres (not SQL Server) in production

The codebase was originally built against SQL Server (LocalDB in dev). It
was migrated to PostgreSQL via the Npgsql EF Core provider specifically so
it can run **free** on Oracle Cloud's Always Free ARM (Ampere A1) tier —
Microsoft's SQL Server Linux image has no arm64 build, but `postgres:18` on
Docker Hub does. This was a clean provider swap (no SQL-Server-specific raw
SQL existed anywhere in the codebase) plus one real gotcha, both worth
knowing if you ever touch persistence code:

- **Npgsql is strict about `DateTime.Kind`.** By default it requires
  `Kind=Utc` for `timestamp with time zone` columns and rejects everything
  else, which broke on this app's mix of `DateTime.UtcNow`, `DateTime.Today`,
  and `[FromQuery] DateTime` model binding (`Kind=Unspecified`) — none of
  which was ever written with that distinction in mind. Fixed two ways in
  combination: `AppDbContext.ConfigureConventions` maps all `DateTime`
  columns to `timestamp without time zone` (closer to SQL Server's original
  Kind-agnostic `datetime2`), and `Program.cs` sets
  `AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true)` to
  stop Npgsql enforcing Kind at all. If you ever see `Cannot write DateTime
  with Kind=...` again, that switch is where to look first.
- Local dev now needs a real Postgres instance (not LocalDB) — see below.

## 3. Local development database

Install PostgreSQL locally (or run it in Docker: `docker run -d -p 5432:5432
-e POSTGRES_PASSWORD=postgres postgres:18-alpine`), then create the app's
own role/database rather than using the Postgres superuser directly:
```sql
CREATE ROLE austo_app WITH LOGIN PASSWORD 'your-local-password';
CREATE DATABASE "AustoDB" OWNER austo_app;
```
Point `ConnectionStrings:DefaultConnection` in `appsettings.json` (or
`appsettings.Development.json`, gitignored) at it:
```
Host=localhost;Port=5432;Database=AustoDB;Username=austo_app;Password=your-local-password
```
Then run migrations and register a first admin user (no seed data ships —
this is a from-scratch schema):
```
dotnet ef database update --project Infrastructure/Austo26.Persistence --startup-project Presentation/Austo26.API
```
```
curl -X POST http://localhost:5202/api/auth/register -H "Content-Type: application/json" \
  -d '{"fullName":"Admin","userName":"admin","email":"admin@austo.com","password":"Admin123!","role":1}'
# -> returns a devVerifyToken since MailSettings isn't configured locally
curl -X POST "http://localhost:5202/api/auth/verify-email?token=<devVerifyToken>"
```

## 4. Deploying to a VM (Oracle Cloud Free Tier, Hetzner, etc.)

`docker-compose.yml` at the repo root runs the API + Postgres together —
this is the path for a self-managed VM rather than a managed
PaaS/database:

```bash
# on the VM, after installing Docker + docker compose plugin:
git clone https://github.com/Tw12z/AustoApp.git && cd AustoApp
cp .env.docker.example .env.docker   # fill in DB_PASSWORD, TOKEN_SECURITY_KEY, FRONTEND_URL, SMTP_*
docker compose --env-file .env.docker up -d --build
docker compose --env-file .env.docker exec api dotnet ef database update \
  --project Infrastructure/Austo26.Persistence --startup-project Presentation/Austo26.API
# then register + verify the first admin user the same way as local dev, against the VM's URL
```

### Oracle Cloud specifics
- Create an **Always Free Ampere A1** instance (ARM, up to 4 OCPU / 24GB RAM,
  free indefinitely — not a 12-month trial) if capacity is available in your
  region; the free x86 "Micro" shapes exist too but are too small (1GB RAM)
  to comfortably run API + Postgres together.
- Open ports 80/443 (and 8080 if not fronting with a reverse proxy) in the
  instance's **Security List / Network Security Group** — Oracle blocks
  inbound traffic by default at the cloud level, separately from the OS
  firewall.
- Put nginx or Caddy in front of the API container for TLS (Let's Encrypt) —
  Kestrel in the container listens on plain HTTP:8080 by design (see the
  Dockerfile).

## 5. Frontend

Set `VITE_API_URL` to the backend's public URL **before building** — Vite
inlines it at build time, so it can't be changed by editing files on the
deployed static host afterward.

```
cd austo-ui
VITE_API_URL=https://api.yourdomain.com/api npm run build
```

Deploy the resulting `dist/` folder to any static host (Vercel, Netlify,
Cloudflare Pages, Amplify Hosting, or nginx). It's a client-side-routed SPA,
so the host needs a fallback rule serving `index.html` for unknown paths
(every host above supports this; for nginx it's
`try_files $uri /index.html;`).

## 6. Rough monthly cost

| Path | Frontend | API + DB | Domain | Total |
|---|---|---|---|---|
| Oracle Always Free | Free (Vercel/Cloudflare Pages) | **$0** (Ampere A1 free tier) | ~$1/mo amortized | **~$1/mo** |
| Hetzner (fallback if Oracle capacity/signup is a hassle) | Free | ~$4/mo (CX22, 4GB RAM) | ~$1/mo | **~$5/mo** |
| AWS-native, managed (App Runner + RDS) | Free/Amplify | ~$35-70/mo (RDS Postgres is much cheaper here than RDS SQL Server would have been) | ~$1/mo | **~$35-70/mo** |

This is not a high-traffic app — start on the free/cheap path and move up
only if usage actually demands it.

## 7. Known gaps not covered here

- No automated tests exist yet.
- `Microsoft.IdentityModel.Tokens` / `System.IdentityModel.Tokens.Jwt` /
  `Scalar.AspNetCore` resolve a few minor versions above what's pinned in the
  `.csproj` files (cosmetic `NU1603` restore warnings, not vulnerabilities —
  left alone deliberately to avoid an untested auth-library version bump
  right before launch).
- No CI/CD pipeline — deploys above are manual.
