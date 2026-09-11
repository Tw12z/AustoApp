# Deployment

This app has two independent deployables:

- **`Presentation/Austo26.API`** — .NET 10 Web API (`Dockerfile` included)
- **`austo-ui`** — Vite/React static build (deploy the `dist/` output to any static host)

Nothing below is optional — every item here was, until now, either hardcoded
to `localhost` or a real secret sitting in a public repo. Skipping one means
the app either doesn't run or is running with a known-public signing key.

## 1. Backend environment variables

Set these wherever the container/process actually runs (hosting provider's
env var settings, a `docker run -e`, systemd `EnvironmentFile`, etc.) —
**never** commit real values to `appsettings.json`. ASP.NET Core reads
`Section:Key` as `Section__Key` (double underscore) from the environment.

| Variable | Example | Notes |
|---|---|---|
| `ConnectionStrings__DefaultConnection` | `Server=tcp:yourserver.database.windows.net,1433;Database=AustoDB;User ID=...;Password=...;Encrypt=True;` | Points at a real SQL Server/Azure SQL instance — LocalDB only exists on the dev machine |
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

### Build & run the API container
```
docker build -f Presentation/Austo26.API/Dockerfile -t austo-api .
docker run -p 8080:8080 \
  -e ConnectionStrings__DefaultConnection="..." \
  -e Token__SecurityKey="..." \
  -e Cors__AllowedOrigins__0="https://yourdomain.com" \
  -e ClientUrl="https://yourdomain.com" \
  austo-api
```

## 2. Frontend

Set `VITE_API_URL` to the backend's public URL **before building** — Vite
inlines it at build time, so it can't be changed by editing files on the
deployed static host afterward.

```
cd austo-ui
VITE_API_URL=https://api.yourdomain.com/api npm run build
```

Deploy the resulting `dist/` folder to any static host (Vercel, Netlify,
Cloudflare Pages, Azure Static Web Apps, or a plain nginx `location /` block).
It's a client-side-routed SPA, so the host needs a fallback rule serving
`index.html` for unknown paths (every static host above supports this; for
nginx it's `try_files $uri /index.html;`).

## 3. Rough monthly cost (small-scale launch, low traffic)

| Piece | Cheapest | Managed |
|---|---|---|
| Frontend static hosting | Free (Vercel/Cloudflare Pages) | same |
| API | ~$5–12/mo (small VPS + Docker) | ~$15–55/mo (Azure App Service) |
| Database | Same VPS, self-managed SQL Server (no extra $) | ~$5+/mo (Azure SQL Basic) |
| Domain | ~$10–15/**year** | same |
| SSL | Free (Let's Encrypt / host-provided) | same |
| Transactional email | Free tier (SendGrid/Resend, low volume) | same |

Realistic total: **~$5–15/month** on the cheap path, **~$30–70/month** on a
fully managed one — this is not a high-traffic app, so scale up only if
usage actually demands it.

## 4. Known gaps not covered here

- No automated tests exist yet.
- `Microsoft.IdentityModel.Tokens` / `System.IdentityModel.Tokens.Jwt` /
  `Scalar.AspNetCore` resolve a few minor versions above what's pinned in the
  `.csproj` files (cosmetic `NU1603` restore warnings, not vulnerabilities —
  left alone deliberately to avoid an untested auth-library version bump
  right before launch).
- No CI/CD pipeline — deploys above are manual.
