# Frontend Dilemma (React + TypeScript + Vite)

Этот frontend‑проект отображает дилеммы и связывается с backend‑API системы дилем.

## Конфигурация API (`VITE_API_BASE_URL`)

Фронтенд читает базовый URL API из переменной окружения `VITE_API_BASE_URL`:

- Для локальной разработки:
  - `VITE_API_BASE_URL=http://localhost:3000/api`
- Для продакшена (Railway):
  - `VITE_API_BASE_URL=https://dilemma-production-0f6b.up.railway.app/api`

Создайте локальный файл окружения (например, `.env.local`) в корне `frontend-dilemma` и задайте нужное значение `VITE_API_BASE_URL` в соответствии с окружением.

Подробнее сценарий поднятия backend + frontend и проверки интеграции описан в  
[`specs/001-connect-backend/quickstart.md`](../../specs/001-connect-backend/quickstart.md) в корне монорепозитория.

---

## Known Issues

Сводка по результатам прогона сценария из `specs/001-connect-backend/quickstart.md`:

- **`GET /api/decisions/my`** — эндпоинт в backend не реализован. Фронт вызывает его для истории решений; при 404 возвращается пустой массив. Признак «пройдено» (`isCompletedByUser`) и загрузка истории заработают после появления эндпоинта на backend.
- **Статистика** — используется `GET /api/statistics/paths/:name` (фактический контракт backend). В задачах упоминался `/api/statistics/dilemma/:name`; при необходимости выравнивать наименования в спеках/задачах.
- **Восстановление флоу после перезагрузки** — состояние текущей дилемы и выбора сохраняется в `sessionStorage` и восстанавливается при перезагрузке. Полная загрузка «пройденных» дилем с backend по-прежнему зависит от `GET /api/decisions/my`.

---

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
