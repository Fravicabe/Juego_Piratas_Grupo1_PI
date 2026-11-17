# 🧠 Core API — Guía rápida para el equipo

Documento de apoyo para Francisco (UI) y Bryton (gameplay). El motor está en
`src/core/` y ya está montado en la app mediante `<GameLoop />` en `src/main.tsx`.

> ⚠️ **Contrato en transición (Sprint 2).** Esta guía describe la **API actual
> (schema v2)**. El diseño objetivo y el contrato **v3** están en
> [`GAMEPLAY.md`](./GAMEPLAY.md). Hasta que el core v3 esté implementado, la UI debe
> seguir usando la API v2; los cambios de v3 se anunciarán aquí y en el PR del core.
> Cualquier PR que toque `src/core` debe contrastarse con `GAMEPLAY.md`.

## Estado del juego

El estado se guarda en `useGameStore` (Zustand + Immer). Campos principales:

| Campo | Tipo | Uso |
|---|---|---|
| `player` | `{ name, rank }` | Nombre y rango pirata |
| `ship` | `Ship` | Velocidad, bodega y casco |
| `skills` | `Record<string, Skill>` | `sailing`, `gathering` y `bargaining` |
| `activeSkillId` | `string \| null` | Habilidad que entrena el tick rápido |
| `islands` | `Record<string, Island>` | Datos cargados desde `src/data/islands.json` |
| `discoveredIslands` | `string[]` | Islas visitadas |
| `currentIslandId` | `string \| null` | Isla actual |
| `destinationIslandId` | `string \| null` | Isla destino si se está navegando |
| `travelEta` | `number` | Segundos restantes de viaje |
| `inventory` | `Record<ResourceId, number>` | Madera, hierro, comida y **oro** |
| `worldAccumulatorMs` | `number` | Tiempo acumulado para el próximo tick de 1 s |
| `totalPlaytime` | `number` | Segundos jugados |

> ⚠️ **El oro vive en `inventory.gold`**. No existe `player.gold`; la barra
> superior debe leer `useGameStore((s) => s.inventory.gold)`.

> 🔒 Las islas pueden definir `lockedUntilLevel`. `setDestination` rechaza el
> viaje si el nivel de `sailing` no alcanza ese requisito.

### Habilidades

Las definiciones están en `src/data/skills.json` y se cargan en
`src/core/skills.ts`. Cada `Skill` incluye:

```ts
{
  id, name, description,
  level, xp, xpToNext,
  baseXp,        // base de la curva de XP
  xpPerSecond,   // XP/s cuando es la habilidad activa
  effectPerLevel,// 0.05 = +5% por nivel
  effectLabel    // texto para la UI
}
```

| Habilidad | Efecto por nivel | Se entrena sola cuando... |
|---|---|---|
| `sailing` | +2% velocidad de viaje | estás navegando |
| `gathering` | +5% recursos | estás recolectando |
| `bargaining` | +3% oro | estás recolectando oro |

La habilidad activa (`activeSkillId`) gana XP **siempre**, además de la XP de
actividad. Para mostrar el multiplicador:

```ts
import { skillEffect } from "@/core/skills";

const sailing = useGameStore((s) => s.skills.sailing);
const speedMultiplier = skillEffect(sailing); // 1.00, 1.02, 1.04...
```

La curva es la de Progress Knight adaptada a niveles que empiezan en 1:

```ts
xpForLevel(level) = baseXp * level * 1.01^(level - 1)
```

Ejemplos: nivel 1 → 100 XP, nivel 2 → 202, nivel 3 → 306, nivel 10 → 1094.

## Acciones del store

```ts
const setDestination = useGameStore((s) => s.setDestination);
const setActiveSkill = useGameStore((s) => s.setActiveSkill);
const reset = useGameStore((s) => s.reset);

setDestination("nassau");  // inicia el viaje
setActiveSkill("sailing"); // entrena navegación en el tick rápido
reset();                   // borra el guardado y empieza de cero
```

| Acción | Firma | Qué hace |
|---|---|---|
| `setDestination` | `(islandId: string) => void` | Calcula `travelEta` según distancia, velocidad y skill de navegación |
| `setActiveSkill` | `(skillId: string) => void` | Cambia la habilidad que entrena el tick rápido |
| `arrive` | `() => void` | Fuerza la llegada a la isla destino |
| `gather` | `(dtSeconds: number) => void` | Recolecta recursos y da XP de actividad |
| `addXp` | `(skillId: string, amount: number) => void` | Suma XP y sube de nivel |
| `tick` | `(dtSeconds: number, now?: number) => void` | Avanza skills, viaje/recolección y `totalPlaytime` |
| `hydrate` | `(state: GameState) => void` | Carga un estado guardado |
| `reset` | `() => void` | Limpia el guardado y reinicia |

## Bucle de juego: dos ritmos, un solo timer

`useGameLoop` (montado por `<GameLoop />`) ejecuta **un único intervalo de
50 ms**. Dentro de `advanceGame` hay dos ritmos lógicos:

| Ritmo | Intervalo | Qué actualiza |
|---|---|---|
| Tick rápido | **50 ms** (20/s) | XP de la habilidad activa, barra de progreso suave |
| Tick del mundo | **1000 ms** (1/s) | Viaje, llegada, recolección y XP de actividad |

El tick de 50 ms acumula el tiempo real en `worldAccumulatorMs`. Cuando llega a
1000 ms, se ejecuta exactamente **un** tick de viaje/recolección. Así el
contador de viaje sigue siendo de 1 s aunque las skills progresen 20 veces por
segundo.

¿Por qué 50 ms y no 1 ms? Progress Knight usa 20 actualizaciones por segundo.
Bajar a 1 ms multiplica por 20 el trabajo de CPU y los renders de React sin
mejorar nada visible. Si en el futuro hace falta más suavidad, basta con cambiar
`SKILL_TICK_MS` en `src/core/types.ts`; toda la lógica es time-based.

El bucle también:

- Carga el guardado al arrancar y aplica progreso offline (máximo 8 h).
- Guarda automáticamente cada 10 s.
- Guarda al cerrar la pestaña (`beforeunload`) y al ocultarla (`visibilitychange`).

No hace falta crear otro `setInterval` para el juego. Si Bryton necesita una
regla nueva de viaje/recolección, debe modificarse en `src/core/tick.ts` (o
extraerse a `src/features/` manteniendo una única fuente de verdad).

## Guardado y migración

- Clave de `localStorage`: `pirate-idle-save`.
- Versión actual del schema: **2**.
- Los saves v1 se migran automáticamente: conservan niveles/XP, recalculan
  `xpToNext` con la curva nueva, añaden `bargaining` y eligen `gathering` como
  habilidad activa.
- Si el save está corrupto, vacío o es de una versión desconocida, se ignora y
  se empieza una partida nueva.

## Lectura de datos desde React

```tsx
const gold = useGameStore((s) => s.inventory.gold);
const islandId = useGameStore((s) => s.currentIslandId);
const island = useGameStore((s) => (s.currentIslandId ? s.islands[s.currentIslandId] : null));
const gathering = useGameStore((s) => s.skills.gathering);
const activeSkillId = useGameStore((s) => s.activeSkillId);
const travelEta = useGameStore((s) => s.travelEta);
```

## Tests

```bash
npm run test   # 45 tests del core
npm run build
npm run lint
```

Archivos:

- `tests/core/tick.test.ts` — reloj, multi-rate, viaje, recolección, XP, offline.
- `tests/core/skills.test.ts` — curva de XP, efectos, normalización de skills.
- `tests/core/saveLoad.test.ts` — round-trip, migración v1→v2, saves inválidos.
- `tests/core/store.test.ts` — acciones del store y skill activa.
- `tests/core/useGameLoop.test.ts` — integración del loop: 50 ms para skills, 1 s para viaje.

---

## Cambios previstos para el core v3 (Sprint 2)

> **No implementados todavía.** Son el contrato que el equipo debe revisar antes de
> empezar el Sprint 2. El diseño completo está en [`GAMEPLAY.md`](./GAMEPLAY.md).

### Estado

| Cambio | Detalle |
| --- | --- |
| **Se añade** | `currentActionId`, `actionProgressMs`, `knownIslands`, `shipHold`, `islandStorage`, `islandWarehouses`, `items`, `combat`, `branch`, `prestige` |
| **Se elimina** | `inventory` (→ `shipHold`), `activeSkillId` (→ acción activa), `discoveredIslands` (→ `knownIslands`), `Island.lockedUntilLevel` (→ `minSailingLevel` + `minShipTier`) |
| **Se mantiene** | `skills`, `ship`, `crew`, `islands`, `currentIslandId`, `destinationIslandId`, `travelEta`, `lastTick`, `worldAccumulatorMs`, `totalPlaytime` |
| **Schema** | `SCHEMA_VERSION = 3`; se aceptan saves v1, v2 y v3 |

### Acciones del store (previstas)

```ts
setAction(actionId: string): void;
clearAction(): void;
travelTo(islandId: string): boolean;   // false si faltan requisitos/suministros
abortTravel(): void;
transfer(resource: ResourceId, amount: number, from: "hold" | "storage"): void;
buy(resource: ResourceId, amount: number): void;
sell(resource: ResourceId, amount: number): void;
upgradeShip(track: "hull" | "cargo" | "cannons"): void;
upgradeWarehouse(islandId: string): void;
fight(enemyId: string): void;
retreat(): void;
chooseBranch(branch: "trader" | "pirate"): void;
prestige(): void;
```

### Datos

- `actions.json`, `buildings.json`, `enemies.json`, `crew.json`, `ranks.json`,
  `branches.json`, `prestige.json`, `items.json`.
- `skills.json` mantiene identidad, `baseXp` y `effectPerLevel`; **la XP/s y el
  rendimiento los define la acción**, no la habilidad.
- `islands.json` añade `type`, `x`, `y`, `minSailingLevel`, `minShipTier`, `danger`,
  `yieldBonus`, `storage`, `services`, `prices`, `hint` y `reveals`.

### Migración v2 → v3

- `inventory` → `shipHold`; el excedente va al almacén de Tortuga (soft cap).
- `gathering` → `woodcutting`, `mining` y `provisions` con el mismo nivel.
- `sailing` y `bargaining` se conservan; `combat` y `shipwright` empiezan en 1.
- `discoveredIslands` → `knownIslands` como `discovered`.
- `activeSkillId` se descarta; `currentActionId` empieza en `null`.

### Reglas que no cambian

- Tick rápido de 50 ms para XP; tick de mundo de 1 s para viaje/recolección.
- Curva Progress Knight como única curva de XP.
- Offline con cap de 8 h y tramos de 60 s.
- Autoguardado cada 10 s.
