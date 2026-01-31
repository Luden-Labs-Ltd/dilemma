# API Contracts: Multi-Option Dilemmas (006)

Контракты расширяют существующие endpoints для поддержки 2–10 вариантов на дилему.

- **api-spec.json** — фрагменты OpenAPI 3.0: изменённые/дополненные схемы и пути (dilemmas details — options array; decisions — choice A..J; statistics — pathCounts).

Базовый URL API: `/api` (без версии в пути; конституция допускает префикс `/api/v1/` при версионировании).
