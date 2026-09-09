# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are jewelry shop (kuyumcu) staff — shop owners/admins and personnel — operating day-to-day retail and stock workflows: tracking live gold prices, managing stock by purity/location, recording sales and purchases (including scrap/hurda buy-backs), and pulling reports. Admin and personnel have distinct roles with role-based access.

Austo is intended as a multi-tenant SaaS product sold/deployed to multiple independent jewelry businesses, not a one-off build for a single shop. No specific first customer is lined up yet, and the system is still being built toward that multi-tenant vision — see Capabilities and Constraints.

## Product Purpose

Austo is an end-to-end digital management platform for jewelry businesses: live gold/currency pricing, purity-based stock management (K8–K24), sales and purchase tracking, multi-location stock transfers, QR-based product tracking, and reporting — all from one system, replacing spreadsheets and disconnected tools.

## Positioning

The differentiator is the integrated end-to-end workflow, not any single feature in isolation: QR-based product tracking, multi-location stock transfers (vitrin/kasa/kasa altı), and role-based access (admin/personnel) combined in one coherent system built specifically for jewelry retail — rather than a generic POS/inventory tool adapted to the trade. Live gold-price-driven, purity-aware stock valuation (K8–K24) is a supporting capability of that same workflow, not the sole pitch.

## Operating Context

- In-shop retail workflow: staff track stock across physical locations (e.g. vitrin/showcase, kasa/register, kasa altı), record sales and purchases (including scrap gold purchases from customers and supplier transactions), and check live gold/currency prices during transactions.
- QR codes are generated per product and used for fast lookup/tracking at the point of sale or during stock movement.
- Reporting covers daily summaries, stock valuation, and profit/loss.
- Auth includes email verification and password reset flows, implying self-service or semi-self-service account setup per shop (consistent with the multi-tenant SaaS direction).

## Capabilities and Constraints

- Existing implementation (as of this writing) is React 19 + TypeScript + Vite + Tailwind + Framer Motion frontend, .NET 10 / Onion Architecture backend, SQL Server + EF Core, JWT auth, live pricing via finans.truncgil.com, QRCoder for QR generation.
- Built-out pages: Landing, Login, Reset/Verify Email, Dashboard, Products, Stock, Sales, Purchases, Customers, Suppliers, Locations, Finance, Reports, Settings.
- Multi-tenancy (isolated data per jewelry business) is **not yet implemented** — this is an open architectural gap between the current codebase and the multi-tenant SaaS positioning above. Future work should treat this as a known, undecided-in-detail constraint rather than assume tenancy already exists.
- i18next is wired into the frontend for internationalization.
- Gold purity categories are fixed: K8, K14, K18, K21, K22, K24, Diğer (other).

## Brand Commitments

- Product name: **Austo** — from **Au** (gold, element symbol) + **Stok** (stock).
- Tagline (Turkish): "Kuyumcular için uçtan uca dijital yönetim platformu" (An end-to-end digital management platform for jewelers).

## Evidence on Hand

No real customer/business data, screenshots, testimonials, or case studies exist yet. Future work must not fabricate any of these — use realistic placeholder/demo data only, clearly not presented as real customer evidence. Seed scripts (`seed.mjs`, `seed-demo.mjs`, `seed-sales.mjs`, `seed-clean.mjs`) exist for generating demo/sample data.

## Product Principles

- Purpose-built for jewelry retail specifics (purity grading, gold-price-linked valuation, scrap purchases), not a generic retail tool wearing jewelry-store labels.
- One integrated workflow (stock, QR, locations, roles, pricing, reporting) beats a collection of disconnected features.
- Multi-tenant SaaS is the target shape of the product; current single-tenant implementation is a known gap to close, not the intended end state.
- Turkish and English are both target languages for the eventual audience; do not assume Turkish-only in future language/content decisions.
- Never fabricate business evidence (customers, testimonials, real transaction data) — demo/seed data must stay clearly synthetic.

## Accessibility & Inclusion

No product-specific accessibility requirement has been established yet.
