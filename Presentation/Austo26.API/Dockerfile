# Build from the repo root: docker build -f Presentation/Austo26.API/Dockerfile -t austo-api .
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj files first so `dotnet restore` is cached across builds that
# only change source, not dependencies.
COPY Core/Austo26.Domain/*.csproj Core/Austo26.Domain/
COPY Core/Austo26.Application/*.csproj Core/Austo26.Application/
COPY Infrastructure/Austo26.Persistence/*.csproj Infrastructure/Austo26.Persistence/
COPY Infrastructure/Austo26.Infrastructure/*.csproj Infrastructure/Austo26.Infrastructure/
COPY Presentation/Austo26.API/*.csproj Presentation/Austo26.API/
RUN dotnet restore Presentation/Austo26.API/Austo26.API.csproj

COPY Core/Austo26.Domain/ Core/Austo26.Domain/
COPY Core/Austo26.Application/ Core/Austo26.Application/
COPY Infrastructure/Austo26.Persistence/ Infrastructure/Austo26.Persistence/
COPY Infrastructure/Austo26.Infrastructure/ Infrastructure/Austo26.Infrastructure/
COPY Presentation/Austo26.API/ Presentation/Austo26.API/

RUN dotnet publish Presentation/Austo26.API/Austo26.API.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app .

ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

# Real secrets (Token__SecurityKey, ConnectionStrings__DefaultConnection,
# MailSettings__UserName/__Password, Cors__AllowedOrigins__0, ClientUrl) are
# passed as environment variables at `docker run` / hosting-platform level —
# never baked into the image. See DEPLOYMENT.md.
ENTRYPOINT ["dotnet", "Austo26.API.dll"]
