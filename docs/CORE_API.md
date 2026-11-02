# 🧠 Core API — Guía rápida para el equipo

Documento de apoyo para Francisco (UI) y Bryton (gameplay). El motor está en
`src/core/` y ya está montado en la app mediante `<GameLoop />` en `src/main.tsx`.

## Estado del juego

El estado se guarda en `useGameStore` (Zustand + Immer). Campos principales:

| Campo | Tipo | Uso |
|---|---|---|
| `player` | `{ name, rank }` | Nombre y rango pirata |
| `ship` | `Ship` | Velocidad, bodega y casco |
| `skills` | `Record<string, Skill>` | `sailing` y `gathering` |
| `islands` | `Record<string, Island>` | Datos cargados desde `src/data/islands.json` |
| `discoveredIslands` | `string[]` | Islas visitadas |
| `currentIslandId` | `string \| null` | Isla actual |
| `destinationIslandId` | `string \| null` | Isla destino si se está navegando |
| `travelEta` | `number` | Segundos restantes de viaje |
| `inventory` | `Record<ResourceId, number>` | Madera, hierro, comida y **oro** |
| `totalPlaytime` | `number` | Segundos jugados |

> ⚠️ **El oro vive en `inventory.gold`**. No existe `player.gold`; la barra
> superior debe leer `useGameStore((s) => s.inventory.gold)`.

## Acciones del store

```ts
const setDestination = useGameStore((s) => s.setDestination);
const reset = useGameStore((s) => s.reset);

setDestination("nassau"); // inicia el viaje
reset();                  // borra el guardado y empieza de cero
```

| Acción | Firma | Qué hace |
|---|---|---|
| `setDestination` | `(islandId: string) => void` | Calcula `travelEta` según distancia y velocidad |
| `arrive` | `() => void` | Fuerza la llegada a la isla destino |
| `gather` | `(dtSeconds: number) => void` | Recolecta recursos y da XP |
| `addXp` | `(skillId: string, amount: number) => void` | Suma XP y sube de nivel |
| `tick` | `(dtSeconds: number, now?: number) => void` | Avanza viaje/recolección y `totalPlaytime` |
| `hydrate` | `(state: GameState) => void` | Carga un estado guardado |
| `reset` | `() => void` | Limpia el guardado y reinicia |

## Lectura de datos desde React

```tsx
const gold = useGameStore((s) => s.inventory.gold);
const islandId = useGameStore((s) => s.currentIslandId);
const island = useGameStore((s) => (s.currentIslandId ? s.islands[s.currentIslandId] : null));
const gathering = useGameStore((s) => s.skills.gathering);
const travelEta = useGameStore((s) => s.travelEta);
```

## Bucle de juego y guardado

`useGameLoop` (montado por `<GameLoop />`) hace:

- Carga el guardado al arrancar y aplica progreso offline (máximo 8 h).
- Ejecuta un tick cada segundo.
- Guarda automáticamente cada 10 s.
- Guarda al cerrar la pestaña (`beforeunload`) y al ocultarla (`visibilitychange`).

No hace falta crear otro `setInterval` para el juego. Si Bryton necesita una
regla nueva de viaje/recolección, debe modificarse en `src/core/tick.ts` (o
extraerse a `src/features/` manteniendo una única fuente de verdad).

## Tests

```bash
npm run test   # 22 tests del core
npm run build
npm run lint
```

Archivos:

- `tests/core/tick.test.ts` — reloj, viaje, recolección, XP, offline.
- `tests/core/saveLoad.test.ts` — round-trip, guardado corrupto, versión.
- `tests/core/store.test.ts` — acciones del store.
