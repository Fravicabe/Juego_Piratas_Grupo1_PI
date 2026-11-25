# Cambios Sprint 1 — Francisco (UI)

## Rama: `feature/s1-ui-shell`

### 1. Integración con core de Alexis (`feature/s1-core-state`)
- Elimina `src/__mocks__/gameStore.ts`; la UI usa `useGameStore` del core real (Zustand + Immer).
- `App.tsx` conecta con `Topbar`, `Sidebar`, `Routes`.
- `docs/CORE_API.md` confirma que `inventory` y `skills` son las fuentes reales.

### 2. Componentes reutilizables
- `Button`, `Card`, `ResourceBar`, `ProgressBar`, `Modal`, `Topbar`, `Sidebar`.
- Estilo pirata (`wood`, `gold`, `parchment`, `sea`) con Tailwind.

### 3. Páginas
- `Home`: ciudad inicial (`Tortuga`) con localizaciones (`Taberna`, `Puerto`, `Mercado`, `Mapa`).
- `Recursos`: ventana con categorías `Oro`, `Provisiones`, `Reputación`, `Tripulación`.
- `Map`, `Skills`, `Crew`, `Ship`, `Settings`: placeholders funcionales.

### 4. Layout corregido
- Vertical (`flex-col`): `Topbar` arriba, fila `Sidebar` + `main`.
- Responsive 768px (`md:`).

### 5. Tests
- `tests/ui/App.test.tsx`: render sin crash.
- `tests/ui/Sidebar.test.tsx`: 6 links + `w-48`.

### 6. Calidad (`docs/QUALITY.md`)
- `npm run check` = lint + test + build.
- PR abierto a `dev`; buddy reviewer: **Bryton**.
- Merge con squash solo tras aprobación.

### Notas para la IA de los compañeros
- `ResourceBar` usa emojis (`📦`, `⭐`, etc.) para categorías nuevas.
- `Topbar` muestra `Oro` y rango; el acceso a `Ajustes` está en el `Sidebar`.
- `Sidebar` orden: `Home`, `Mapa`, `Habilidades`, `Recursos`, `Tripulación`, `Barco`, `Ajustes`.

### 7. Cierre Sprint 1 (23 nov 2026, rama `fix/s1-ui-closeout`)
- `Topbar` lee **oro y rango** del store y se actualiza en tiempo real (issue #10).
- `Sidebar` añade el enlace a **Ajustes**; antes la ruta existía pero no era accesible.
- `Settings` deja de ser placeholder: resumen de la partida y **reinicio con confirmación** mediante `Modal` (issue #9).
- `Modal` es accesible: `role="dialog"`, `aria-modal`, `aria-labelledby`, cierre con `Escape` y clic en el fondo.
- `ProgressBar` expone `role="progressbar"` y `aria-valuenow` / `aria-valuemax` / `aria-valuetext`.
- Tests nuevos: `components.test.tsx`, `Topbar.test.tsx` (reactividad), `Settings.test.tsx` (flujo de reinicio) y `Sidebar.test.tsx`.
- Total: **97 tests** en 15 archivos; `lint` y `build` en verde.
