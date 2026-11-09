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
- `Topbar` ya no muestra `Oro` ni botón `Ajustes`.
- `Sidebar` orden: `Home`, `Mapa`, `Habilidades`, `Recursos`, `Tripulación`, `Barco`, `Ajustes`.
