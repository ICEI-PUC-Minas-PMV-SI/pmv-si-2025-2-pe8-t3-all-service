## Copilot instructions for this repo (Angular 19)

Purpose: capture repo-specific how-to so AI agents can build, run, and extend features consistently.

### Architecture
- Angular 19, TS 5.7, Material, SCSS, RxJS, Signals, ng-apexcharts.
- Bootstrap and routing live in `src/main.ts` via `bootstrapApplication(AppComponent)` + `provideRouter([...])`. `AppRoutingModule` exists but is not used.
- Static serving of production build via `server.js` (Express) from `dist/all-service/browser`.

### Build, run, test
- Dev: `ng serve` → http://localhost:4200/.
- Prod build: `ng build --configuration production` → `dist/all-service/browser`.
- Preview prod: `npm run build` then `npm start` (Express on `PORT` or 3000).
- Tests: `ng test` (Karma/Jasmine), specs next to code as `*.spec.ts`.

### Routing and pages
- Define routes in `src/main.ts`. Pages live under `src/app/paginas/**` (pt-BR naming: `dashboard`, `faturas`, `servicos`, etc.). Defaults redirect to `dashboard`.
- Update `HeaderService.setTitleForPath()` when introducing a new top-level route to auto-set the page title.

### Data access
- Use `HttpRestService.gerarSolicitacao(TipoRequisicaoRestEnum.GET, path, params?, body?, url?, options?)`.
  - Base API: `http://localhost`; pass `url` to override.
  - Example:
    ```ts
    this.httpRest.gerarSolicitacao(TipoRequisicaoRestEnum.GET, '/api/clientes', new HttpParams().set('q','abc'))
      .subscribe(r => this.rows = r);
    ```
  - Only GET is implemented; extend `montaRequest` + add methods for POST/PUT/DELETE if needed.

### Export and insights
- `ExportService.export('csv'|'json'|'xlsx', dados, campos?, nomeBase?)`.
  - CSV uses `;` delimiter and escapes quotes/newlines; XLSX lazy-loads `xlsx` and falls back to CSV on error.
  - Example: `this.exporter.export('csv', lista, [{key:'nome', header:'Nome'}], 'clientes');`
- Metrics/charts: configure via `src/app/shared/metrics/metrics-config.ts`; consume with `DynamicInsightService.metrics` and `.charts`.

### UI conventions
- Material theme `indigo-pink` registered in `angular.json`. Import only used Material modules (see `app.module.ts`). SCSS everywhere. Keep Portuguese names for features.

### Key files
- `src/main.ts` (bootstrap + routes); `server.js` (Express static host)
- `src/app/service/http-rest.service.ts` (HTTP wrapper)
- `src/app/shared/export/export.service.ts` (CSV/JSON/XLSX)
- `src/app/shared/metrics/*` (metrics/chart contracts)
- `src/app/layout/header.service.ts` (title/actions via signals)

### Agent persona & style (authoritative)
- Use modern Angular patterns: Signals for state (`signal`, `computed`), new template control flow (`@if/@for/@switch`), and `ChangeDetectionStrategy.OnPush`.
- Prefer standalone architecture and lazy-loaded feature routes; use `inject()` for DI; use `input()`/`output()` signal APIs over decorators where applicable.
- Templates: prefer class/style bindings over `ngClass/ngStyle`; keep logic in TS, styles in SCSS, markup in HTML.
- Components/services should be small and focused; prefer Reactive Forms; use `NgOptimizedImage` for static images.
- Avoid `@HostBinding`/`@HostListener`; put host bindings in the `host` object of the decorator.
