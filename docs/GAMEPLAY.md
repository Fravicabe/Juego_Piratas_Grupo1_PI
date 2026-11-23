# 🏴‍☠️ Pirate Idle — Diseño de gameplay v1.0

> **Estado:** propuesta para revisión del equipo (cierre de diseño, entrada al Sprint 2).
> **Fuente de verdad:** este documento define el juego que implementa el core v3.
> Si el código y este documento discrepan, manda el documento hasta que se revise.
>
> **Inspiración:** Melvor Idle (habilidades y acciones) y Progress Knight (curva de XP
> y progresión por etapas).
>
> **Equipo:** Javier (infraestructura), Alexis (core), Francisco (UI), Bryton (gameplay).

---

## 1. Pitch y pilares

Empiezas siendo nadie: un bote, cero recursos y una isla segura. Eliges **una acción a
la vez**, la conviertes en habilidades y recursos, los gastas en el barco y en almacenaje,
llegas a islas más ricas y peligrosas, eliges entre **Trader** y **Pirate**, y cuando la
partida se estanca haces **prestigio** para volver más fuerte.

### Pilares

1. **Bucle idle con decisiones.** Una sola acción activa, no una lluvia de números.
2. **Progresión por habilidades.** Cada acción sube una o varias habilidades; las
   habilidades desbloquean acciones, islas y secciones del juego.
3. **Economía con sumideros.** Cada recurso tiene un uso; el almacenamiento es limitado.
4. **Exploración.** Las islas no se conocen hasta que se navega hasta ellas.
5. **Prestigio.** Reinicio con bonificaciones permanentes para el largo plazo.

### Reglas de oro

- **Una acción activa** en todo momento. Viajar ocupa esa acción.
- **Sin muerte permanente.** Perder un combate cuesta carga y casco, nunca la partida.
- **Sin softlocks.** Toda isla tiene una fuente de comida o una forma de volver.
- **Oro sin tope de almacenamiento.** Es la moneda; limitarlo solo genera esperas.
- **Todo es data-driven.** Acciones, islas, enemigos, tripulación y precios viven en JSON.
- **Una única fuente de verdad para XP y rendimiento:** `actions.json`.

---

## 2. Bucle de juego

### Tres bucles

| Escala | Qué pasa | Decisión del jugador |
| --- | --- | --- |
| **Segundos** | Una acción produce XP y recursos | Qué acción mantener |
| **Minutos** | Se llenan almacenes, se vende, se mejora el barco y se navega | A dónde ir y qué llevar |
| **Horas / días** | Rangos, rama, islas nuevas, prestigio | Qué especialización y cuándo reiniciar |

### Diagrama

```text
acción ──► XP ──► nivel de habilidad ──► desbloqueo (acción / isla / UI)
   │                                              │
   └──► recursos ──► tope de almacén ──► gasto ◄──┘
                          │                 │
                          ▼                 ▼
                     almacén isla      barco / almacén / tripulación
                          │
                          ▼
                       navegar ──► isla nueva ──► más acciones
```

### Una sesión típica

1. Elegir acción en la isla actual (talar, pescar, minar, cazar, combatir).
2. Ver cómo suben XP y recursos; el barco se llena y descarga solo en el almacén local.
3. Cargar el barco y navegar a una ciudad a vender o mejorar.
4. Descubrir una isla nueva, desbloquear una acción o subir de rango.
5. Cerrar el juego; al volver, resumen de progreso offline.

---

## 3. Habilidades (7)

| Habilidad | ID | Efecto por nivel | XP principal | Desbloquea |
| --- | --- | --- | --- | --- |
| **Woodcutting** | `woodcutting` | +5% madera | Acciones de tala | Maderas mejores, madera dura |
| **Mining** | `mining` | +5% hierro | Acciones de minería | Vetas profundas, obsidiana |
| **Provisions** | `provisions` | +5% comida | Pesca, forrajeo, granja, caza | Mejores acciones de comida |
| **Sailing** | `sailing` | +2% velocidad | Viajar y patrullar | Islas (5 / 10 / 18 / 25) |
| **Bargaining** | `bargaining` | +3% margen | Comerciar y regatear | Mejores precios, venta de excedente |
| **Combat** | `combat` | +3% daño | Combate y caza | Enemigos y botín |
| **Shipwright** | `shipwright` | +3% eficiencia | Reparar, refit y salvamento | Niveles de almacén, mejoras de barco |

### Curva de XP (Progress Knight)

```text
xpToNext(level) = round(100 * level * 1.01^(level - 1))
```

- Es la **única** curva del juego. No hay curva lineal.
- `baseXp` y `effectPerLevel` viven en `skills.json`.
- La XP por segundo la define **cada acción** en `actions.json`, no la habilidad.
- El nivel total es la suma de niveles de las 7 habilidades y determina el rango.

---

## 4. Acciones

### Reglas

- **Una acción activa** por jugador; se elige en la isla actual.
- Cada acción pertenece a una isla (o a "costa", si vale en cualquier isla costera).
- Puede dar XP a **varias habilidades** a la vez (caza: Provisions + Combat).
- Puede requerir nivel de habilidad, rango, rama, barco o item.
- Las acciones bloqueadas se muestran siempre, con sus requisitos.
- Se recuerda la última acción usada en cada isla ("Reanudar").
- Viajar cancela la acción activa y ocupa el slot.

### Esquema de datos

```json
{
  "id": "palm_hunt_boar",
  "name": "Hunt wild boar",
  "islandId": "palm_cay",
  "skill": "provisions",
  "xp": [
    { "skill": "provisions", "perSecond": 3 },
    { "skill": "combat", "perSecond": 1 }
  ],
  "yield": { "food": 2.5 },
  "requires": { "provisions": 8 },
  "risk": 1,
  "tags": ["food", "hunt"]
}
```

- `skill` es la habilidad principal para agrupar en la UI.
- `yield` puede incluir recursos e items raros (`drops`).
- `risk` 0–3: probabilidad de encuentro durante la acción.

### Tabla inicial de acciones

Los valores son **punto de partida**, ajustables con el harness de balance.

#### Woodcutting

| Acción | Isla | Requiere | Rendimiento | XP/s | Riesgo |
| --- | --- | --- | --- | --- | --- |
| Chop driftwood | Tortuga | Woodcutting 1 | wood 0.8/s | 3 | 0 |
| Fell palms | Palm Cay | Woodcutting 1 | wood 1.5/s | 4 | 0 |
| Mahogany grove | Palm Cay | Woodcutting 8 | wood 3/s + hardwood | 6 | 0 |
| Salvage timber | Skull Isle | Woodcutting 15 | wood 5/s | 8 | 1 |

#### Mining

| Acción | Isla | Requiere | Rendimiento | XP/s | Riesgo |
| --- | --- | --- | --- | --- | --- |
| Scavenge iron | Nassau | Mining 1 | iron 0.6/s | 3 | 0 |
| Iron seam | Iron Reef | Mining 1 | iron 1.5/s | 4 | 0 |
| Deep vein | Iron Reef | Mining 8 | iron 3/s | 6 | 0 |
| Volcanic vein | Skull Isle | Mining 15 | iron 5/s + obsidian | 8 | 2 |

#### Provisions

| Acción | Isla | Requiere | Rendimiento | XP/s | Riesgo |
| --- | --- | --- | --- | --- | --- |
| Beachcombing | Tortuga | Provisions 1 | food 0.5/s + wood 0.2/s | 2 | 0 |
| Dock fishing | Nassau | Provisions 1 | food 1/s | 3 | 0 |
| Forage | Palm Cay | Provisions 1 | food 1.2/s + herb | 3 | 0 |
| Farm | Palm Cay | Provisions 5 | food 2/s | 4 | 0 |
| Hunt wild boar | Palm Cay | Provisions 8 | food 2.5/s + hide | 3 + Combat 1 | 1 |
| Deep-sea fishing | Costa | Ship tier 2, Provisions 12 | food 4/s | 5 | 1 |

#### Sailing

| Acción | Isla | Requiere | Rendimiento | XP/s | Riesgo |
| --- | --- | --- | --- | --- | --- |
| Travel | Ruta | — | Sailing XP mientras navegas | 1.5 | según ruta |
| Patrol waters | Cualquiera | Sailing 3 | gold 0.2/s | 4 | 1 |

#### Bargaining

| Acción | Isla | Requiere | Rendimiento | XP/s | Riesgo |
| --- | --- | --- | --- | --- | --- |
| Haggle at market | Nassau | Bargaining 1 | gold 1/s | 3 | 0 |
| Trade contract | Nassau | Bargaining 10 | gold 2.5/s | 5 | 0 |

#### Combat

| Acción | Isla | Requiere | Rendimiento | XP/s | Riesgo |
| --- | --- | --- | --- | --- | --- |
| Hunt smugglers | Nassau | Combat 1 | gold 1.5/s + loot | 4 | 1 |
| Raid pirate camp | Skull Isle | Combat 10 | gold 3/s + loot | 7 | 2 |
| Raid navy convoy | Skull Isle | Combat 18 | gold 5/s + loot | 10 | 3 |
| Hunt sea monster | Isla Perdida | Combat 25 | loot raro | 15 | 3 |

#### Shipwright

| Acción | Isla | Requiere | Rendimiento | XP/s | Riesgo |
| --- | --- | --- | --- | --- | --- |
| Salvage wreck | Costa | Shipwright 1 | wood 0.5/s + iron 0.3/s | 3 | 0 |
| Repair hull | Ciudad | Shipwright 1 | Consume madera, repara casco | según coste | 0 |
| Refit ship | Ciudad | Shipwright 5 | Consume recursos, aplica mejora | según coste | 0 |

#### Acciones de rama (solo con rama elegida)

| Acción | Rama | Isla | Rendimiento | XP/s | Riesgo |
| --- | --- | --- | --- | --- | --- |
| Smuggle run | Trader | Nassau | gold 4/s | 5 | 2 |
| Trade contract | Trader | Nassau | gold 2.5/s | 5 | 0 |
| Raid convoy | Pirate | Skull Isle | gold 5/s + loot | 9 | 3 |
| Plunder merchant | Pirate | Nassau | gold 3/s + food | 6 | 2 |

> Total: ~29 acciones. El Sprint 2 implementa las de Tortuga, Palm Cay y Nassau (~12).

---

## 5. Islas y navegación

### Tipos de isla

| Tipo | Identidad | Rendimiento | Almacén | Servicios | Peligro |
| --- | --- | --- | --- | --- | --- |
| **Home city** | Hub seguro | Acciones débiles de arranque | Grande, todos | Mercado, astillero, taberna, almacén | 0 |
| **Trade city** | Comercio | Sin recolección | Medio | Mercado, taberna, astillero | 0–1 |
| **Resource island** | Granja | **+50% recurso firma** | Medio para su recurso, poco del resto | Ninguno | 0–1 |
| **Hostile island** | Riesgo/botín | Recursos raros y loot | Ninguno | Ninguno | 2–3 |

### Islas v1.0 (6)

| Isla | Tipo | Puerta | Almacén base (wood/iron/food) | Servicios | Peligro |
| --- | --- | --- | --- | --- | --- |
| **Tortuga** | Home city | Inicio | 1000 / 500 / 800 | Mercado, astillero, taberna, almacén | 0 |
| **Palm Cay** | Resource | Sailing 1, tier 1 | 600 / 0 / 500 | — | 0 |
| **Nassau** | Trade city | Sailing 5, tier 1 | 600 / 300 / 500 | Mercado, taberna, astillero | 1 |
| **Iron Reef** | Resource | Sailing 8, tier 1 | 200 / 600 / 100 | — | 1 |
| **Skull Isle** | Hostile | Sailing 10, tier 2 | 0 / 0 / 0 | — | 3 |
| **Isla Perdida** | Hostile | Sailing 25, tier 3 | 0 / 0 / 0 | — | 3 |

- **Port Royale** queda como isla post-v1.0 (ciudad comercial de la marina).
- Cada isla define sus acciones, su bonus de rendimiento y sus precios.
- Las islas hostiles no tienen almacén: el botín debe caber en la bodega.

### Rutas y viaje

- Cada isla tiene coordenadas `x, y`; la distancia es euclidiana.
- `travelTime = distancia * 1.5 / velocidadEfectiva`.
- `velocidadEfectiva = ship.speed * (1 + 0.02 * (sailing - 1)) * (1 + bonus navegante)`.
- **Dos puertas por ruta:** `minSailingLevel` (conocimiento) y `minShipTier` (capacidad).
- **Suministros:** coste en comida al zarpar = `ceil(travelTime / 120) + tripulantes`.
  Sin comida no se zarpa; la UI lo avisa antes de confirmar.
- **Abortar:** se puede volver al origen; no se puede desviar a una tercera isla.
- **Llegada:** se descubre la isla, se revelan las adyacentes como rumoreadas y, en
  ciudad, se descarga automáticamente la bodega si hay espacio.
- **Viajar ocupa la acción:** no se recolecta en el mar; Sailing gana XP durante el viaje.
- **Offline:** un viaje iniciado antes de cerrar se completa al volver.

### Niebla de guerra

| Estado | Qué ve el jugador |
| --- | --- |
| **Unknown** | No aparece en el mapa |
| **Rumored** | Silueta, pista vaga y requisitos visibles; tipo oculto |
| **Discovered** | Nombre, tipo, recursos, precios y peligro |

- Al descubrir una isla, sus vecinas (`reveals`) pasan a **rumored**.
- Las pistas son vagas ("gulls circle", "a natural harbor", "no sails welcome").
- El tipo se revela al llegar, no antes.

### Regla anti-softlock

Toda isla debe tener al menos una acción de comida (forrajeo, pesca, caza o granja) o un
mercado que venda comida. Tortuga tiene `Beachcombing` desde el minuto cero.

---

## 6. Almacenamiento

### Dos capas

| Capa | Capacidad | Persistencia | Uso |
| --- | --- | --- | --- |
| **Ship hold** | `ship.cargo` | Viaja contigo | Recolectar, comerciar, transportar |
| **Island storage** | Caps por recurso e isla | Se queda en la isla | Acumular, fabricar, vender en ciudad |

### Flujo

1. **Recolectar → ship hold.**
2. **Bodega llena → auto-depósito** en el almacén de la isla (respetando caps).
3. **Almacén lleno → la acción se pausa** con el aviso "Storage full".
4. **En ciudad:** el mercado vende desde almacén de la ciudad + bodega; comprar mete en bodega.
5. **Al llegar a ciudad:** auto-descarga de la bodega si hay espacio.
6. **Para transportar:** botón "Load max" del almacén a la bodega; al llegar, auto-descarga.
7. **Mejoras en ciudad:** consumen almacén local + bodega (logística real).
8. **Sell overflow** (Bargaining 10): el excedente se vende automáticamente al 50%.

### Caps y almacenes

- Cada isla tiene un almacén (excepto hostiles) con nivel 0–10.
- `cap = base * 1.35^level`.
- `coste = gold * 50 * 1.7^level + recurso local * 25 * 1.5^level`.
- `maxLevel = 2 * shipwright level`, tope 10.
- El oro **no** tiene cap.
- **Soft cap en migración:** si un save antiguo supera el cap, se conserva el stock y
  no se produce más de ese recurso hasta bajar del límite. Nunca se borran recursos.

---

## 7. Mercado y economía

### Mercados

- Solo en **Tortuga** y **Nassau** (v1.0).
- Precios por isla y recurso; el spread es la fuente del beneficio del trader.
- Comprar y vender está limitado por la bodega del barco.
- Bargaining mejora el precio de venta un 3% por nivel y reduce el de compra.

### Precios iniciales (oro por unidad)

| Recurso | Tortuga compra / vende | Nassau compra / vende |
| --- | --- | --- |
| Wood | 2 / 1 | 4 / 2 |
| Iron | 5 / 3 | 3 / 1.5 |
| Food | 1.5 / 0.8 | 3 / 1.5 |

Ejemplo de ruta: comprar hierro barato en Nassau → vender en Tortuga; comprar comida
barata en Tortuga → vender en Nassau.

### Sumideros

| Recurso | Se gasta en |
| --- | --- |
| Wood | Reparaciones, mejoras de casco/bodega, almacenes |
| Iron | Cañones, mejoras de barco, almacenes |
| Food | Suministros de viaje, curación de tripulación |
| Gold | Tripulación, mejoras, almacenes, compra de recursos |

---

## 8. Barco

### Tiers

| Tier | Nombre | Velocidad | Bodega | Casco | Cañones | Requiere |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Sloop | 1.0 | 50 | 100 | 5 | Inicio |
| 2 | Brig | 1.4 | 100 | 180 | 12 | Shipwright 5, Boatswain |
| 3 | Galleon | 1.9 | 200 | 300 | 25 | Shipwright 12, Captain |

### Mejoras (3 tracks)

| Track | Efecto por nivel | Coste |
| --- | --- | --- |
| Hull | +20 casco máximo | Gold + wood + iron |
| Cargo | +10 bodega | Gold + wood |
| Cannons | +2 cañones | Gold + iron |

- Se aplican en el astillero de una ciudad.
- `ship.cargo` **es** la capacidad del ship hold.
- Shipwright reduce el coste y desbloquea niveles.

---

## 9. Combate

### Stats

| Stat | Fuente | Efecto |
| --- | --- | --- |
| **Hull** | Barco + mejoras | Reduce daño recibido |
| **Cannons** | Barco + mejoras | Daño base |
| **Crew** | Tripulación | Precisión y bonus de rol |
| **Speed** | Barco + navegante | Iniciativa y huida |

### Resolución

- Combate **automático** por rondas de 1 segundo.
- Daño jugador = `cannons * (1 + 0.03 * (combat - 1)) * bonusGunner`.
- Daño enemigo = `max(1, enemy.attack - hull * 0.05)`.
- Acierto = `min(0.95, 0.75 + 0.01 * (combat - 1) + bonusPrecisión)`.
- **Retirada automática** al 20% de casco.
- **Sin muerte permanente.**

### Recompensas y derrota

- Victoria: oro, recursos, XP y probabilidad de loot/blueprint.
- Derrota: se pierde el 25% de la bodega, el casco queda a 1, vuelta al origen y
  cooldown de 60 s.
- **Offline:** se resuelve por valor esperado, sin RNG, dentro del cap de 8 h.

### Arquetipos de enemigo

| Enemigo | Dificultad | Recompensa |
| --- | --- | --- |
| Smuggler | Baja | Oro, XP |
| Pirate crew | Media | Oro, loot común |
| Navy patrol | Alta | Oro alto, blueprint |
| Sea monster | Muy alta | Loot raro |

---

## 10. Tripulación

| Rol | Bonus |
| --- | --- |
| **Navigator** | +10% velocidad |
| **Gunner** | +10% daño |
| **Cook** | +10% rendimiento de comida |
| **Quartermaster** | +10% bodega / precio de venta |

- 8 reclutas con nombre y rol, reclutables en tabernas de ciudades.
- Coste en oro; sin sueldo pasivo (la comida solo se gasta en suministros y curación).
- Cap por tier de barco: 2 / 4 / 6.
- Los bonus se suman; no hay deserción.
- La UI de tripulación se desbloquea en **Boatswain**.

---

## 11. Rangos, rama y prestigio

### Rangos (nivel total = suma de las 7 habilidades)

| Rango | Nivel total | Desbloquea |
| --- | --- | --- |
| Cabin Boy | 0 | Inicio |
| Deckhand | 10 | Mercado avanzado |
| Boatswain | 20 | Tripulación |
| **First Mate** | **35** | **Elección de rama** |
| Captain | 50 | Tiers altos de barco |
| **Pirate King** | **80** | **Prestigio** |

### Rama (lite, exclusiva por partida)

| | **Trader** | **Pirate** |
| --- | --- | --- |
| Pasiva | +10% precio de venta, +10% bodega | +10% daño, +15% botín |
| Acciones únicas | Smuggle run, Trade contract | Raid convoy, Plunder merchant |
| Contenido compartido | ~80% (islas, skills, barco, mercado, combate) | igual |

- Se elige en **First Mate**; es permanente durante la partida.
- Se pierde al hacer prestigio.
- No duplica el contenido: solo añade acciones y pasivas.

### Prestigio — "Nueva Travesía"

- Se desbloquea en **Pirate King** (nivel total 80).
- **Reinicia:** habilidades, almacenes, bodega, islas descubiertas (salvo Tortuga),
  barco, tripulación, rama y acciones.
- **Conserva:** legado, mejoras permanentes y contador de prestigios.
- `legacy = floor(nivelTotal / 10)`.
- Mejoras permanentes (3 tracks): +5% XP, +5% rendimiento, +10 bodega inicial.
- La UI de prestigio se desbloquea en Pirate King.

---

## 12. Offline

- Cap de **8 horas**; simulación en tramos de 60 s.
- La acción activa continúa hasta llenar almacenes.
- Los viajes en curso se completan.
- El combate se resuelve por valor esperado (sin RNG).
- Autoguardado cada 10 s.
- Al volver: modal con resumen (recursos, XP, llegadas, combates).

---

## 13. Ritmo objetivo

| Momento | Hito | Tiempo orientativo |
| --- | --- | --- |
| 0–5 min | Primera acción, primer wood/food | 5 min |
| 5–15 min | Primera travesía a Palm Cay y vuelta | 10–15 min |
| 15–30 min | Nassau, primer comercio, primera mejora | 20–30 min |
| 30–60 min | Iron Reef, Shipwright, primer almacén | 45–60 min |
| 1–2 h | Skull Isle, primer combate serio | 1–2 h |
| 1–2 días | First Mate, elección de rama | casual |
| 3–5 días | Pirate King, primer prestigio | casual |

Los valores son objetivos de balance, no promesas. El harness permite simular 1 h,
8 h y 24 h para ajustar.

---

## 14. Datos y contrato del core (v3)

### Estado (schema v3)

```ts
interface GameState {
  version: 3;
  player: Player;
  ship: Ship;                       // cargo = ship hold
  crew: CrewMember[];
  skills: Record<SkillId, Skill>;

  currentActionId: string | null;
  actionProgressMs: number;

  islands: Record<string, Island>;  // datos estáticos
  knownIslands: Record<string, "rumored" | "discovered">;
  currentIslandId: string | null;
  destinationIslandId: string | null;
  travelEta: number;

  shipHold: Record<ResourceId, number>;
  islandStorage: Record<string, Record<ResourceId, number>>;
  islandWarehouses: Record<string, number>;

  items: Record<string, number>;
  combat: CombatState | null;
  branch: "trader" | "pirate" | null;
  prestige: { count: number; legacy: number; upgrades: Record<string, number> };

  lastTick: number;
  worldAccumulatorMs: number;
  totalPlaytime: number;
}
```

**Se elimina:** `inventory` (pasa a `shipHold`), `activeSkillId` (lo sustituye la acción),
`discoveredIslands` (pasa a `knownIslands`) y `Island.lockedUntilLevel` (pasa a
`minSailingLevel` + `minShipTier`).

### Archivos de datos

| Archivo | Contenido |
| --- | --- |
| `src/data/skills.json` | 7 habilidades, efecto y `baseXp` |
| `src/data/actions.json` | Acciones, XP multi-skill, rendimiento, requisitos, riesgo |
| `src/data/islands.json` | Tipo, coordenadas, puertas, almacén, precios, servicios, pista |
| `src/data/buildings.json` | Curva de almacenes |
| `src/data/enemies.json` | Arquetipos, stats y loot |
| `src/data/crew.json` | Reclutas y roles |
| `src/data/ranks.json` | Umbrales y desbloqueos |
| `src/data/branches.json` | Pasivas y acciones de rama |
| `src/data/prestige.json` | Mejoras permanentes |
| `src/data/items.json` | Loot y objetos raros |

### Migración v2 → v3

- `inventory` → `shipHold` (hasta `cargo`); el excedente va al almacén de Tortuga
  (soft cap, sin borrar nada).
- `gathering` → **Woodcutting, Mining y Provisions** con el mismo nivel.
- `sailing` y `bargaining` se conservan.
- `combat` y `shipwright` empiezan en nivel 1.
- `discoveredIslands` → `knownIslands` como `discovered`.
- `activeSkillId` se descarta; `currentActionId` empieza en `null`.
- Se aceptan saves v1, v2 y v3.

---

## 15. Plan de sprints S2–S4

> Los issues actuales del backlog (#20–#33) se revisarán y reemplazarán **después** de
> que el equipo apruebe este documento. No se crean issues nuevos antes de esa revisión.

### Sprint 2 — "Action economy & world"

| Área | Entrega |
| --- | --- |
| **Core (Alexis)** | Schema v3, motor de acciones multi-XP, dos capas de almacenamiento, viaje, mercado, offline, migración, tests |
| **Data (Bryton)** | 7 skills, Tortuga/Palm Cay/Nassau, ~12 acciones, precios, recetas de barco, rangos |
| **UI (Francisco)** | Actions, Map con niebla, almacén/bodega, Market, Shipyard básico, HUD de rango |
| **Infra (Javier)** | Validación JSON, fixtures de migración, panel de debug, CI |

**Criterio de salida:** un jugador nuevo puede recolectar, descargar, navegar a Nassau,
comerciar, mejorar el barco y subir de rango; guardar/cargar y offline funcionan; la
niebla revela tipos de isla.

### Sprint 3 — "Danger, crew & branch"

| Área | Entrega |
| --- | --- |
| **Core** | Combate, tripulación, rama, tiers 2–3, encuentros de caza |
| **Data** | Enemigos, loot, 8 reclutas, Iron Reef/Skull Isle, acciones de rama, almacenes |
| **UI** | Combat, Crew, Branch, almacenes, tiers de barco |
| **Infra/QA** | Harness de combate, snapshots de balance, fixtures de save |

**Criterio de salida:** combatir, reclutar, elegir Trader/Pirate, cazar con riesgo,
mejorar almacenes y visitar 5 islas.

### Sprint 4 — "Endgame & release"

| Área | Entrega |
| --- | --- |
| **Core** | Prestigio, migración final, rendimiento |
| **Data** | Isla Perdida, mejoras de prestigio, balance final |
| **UI** | Prestigio, onboarding, pulido, accesibilidad, responsive |
| **Infra/QA** | Checklist de release, playtest completo, bug bash, docs |

**Criterio de salida:** bucle de prestigio, 6 islas, curvas equilibradas, onboarding y
release candidate.

---

## 16. No objetivos v1.0

- Cocina, cultivos por parcelas, colas de crafteo.
- Mercados dinámicos o simulación de oferta/demanda.
- Múltiples barcos, PvP, misiones argumentales.
- Árboles de rama completamente separados.
- Almacenes por recurso (se usa uno por isla).
- i18n, multijugador, muerte permanente.
- **Port Royale** como séptima isla (post-v1.0).

---

## 17. Herramientas de desarrollo

- **Panel de debug** (`?debug=1` + `import.meta.env.DEV`): fijar niveles, dar recursos,
  revelar islas, fijar rango, elegir rama, lanzar combate, avanzar tiempo.
- **Harness de balance:** simula 1 h / 8 h / 24 h y muestra una tabla de progresión.
- **Validación JSON en CI:** esquema para cada archivo de datos.
- **Fixtures de migración:** saves reales v1, v2 y v3.
- **Tests de contrato:** la UI y los datos no pueden asumir campos que el core no expone.

---

## 18. Decisiones abiertas (solo tuning)

- Todos los números (caps, costes, XP/s, precios, daño) son valores iniciales.
- Nombres de habilidades, islas y acciones pueden cambiar sin tocar el diseño.
- La curva de prestigio y el número de mejoras permanentes se ajustan en S4.
- Port Royale y los almacenes por recurso quedan para post-v1.0.
