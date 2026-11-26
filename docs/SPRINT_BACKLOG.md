# 🏃 Sprint Backlog — Pirate Idle

Selección del [Product Backlog](BACKLOG.md) para el sprint en curso.
Es la vista de trabajo del equipo: **solo lo que está aquí se hace esta semana/sprint**.

- **Tablero:** https://github.com/users/Fravicabe/projects/2
- **Issues:** https://github.com/Fravicabe/Juego_Piratas_Grupo1_PI/issues
- **Detalle de las tareas:** `docs/ISSUES_SPRINT1.md`
- **Reglas de calidad:** `docs/QUALITY.md`

---

## Sprint 1 — "Fundamentos y primer bucle jugable"

| Campo | Valor |
| ----- | ----- |
| **Sprint Goal** | App navegable, con estado persistente, donde el jugador viaja entre islas y recolecta recursos |
| **Duración** | 2 semanas (9–22 nov 2026, orientativo) |
| **Capacidad** | 4 devs · ~20 pts de referencia |
| **Comprometidos** | **26 pts** (sobre-compromiso del 30%, asumido por el equipo) |
| **Incremento esperado** | `v0.1.0` desplegable al final del sprint |

### Por qué 26 pts y no 20
Las tareas de infraestructura de Javier (scaffold, lint, CI) son pequeñas pero
desbloquean a los demás; el sobre-compromiso se cubre porque no dependen de nadie.
Si a mitad de sprint el equipo va corto, se recorta `PB-14` (tests de gameplay).

---

## Tabla del Sprint Backlog

| # | ID | Tarea | Responsable | Pts | Estado | Rama / PR |
| - | -- | ----- | ----------- | --- | ------ | --------- |
| 1 | PB-01 | Configurar proyecto base (Vite + React + TS + Tailwind) | Javier | 3 | ✅ Done | `dev` |
| 2 | PB-02 | Configurar ESLint y Prettier | Javier | 1 | ✅ Done | PR #15 |
| 3 | PB-03 | GitHub Actions: lint + test + build | Javier | 1 | 🔄 In Progress | PR #16 (falta paso de tests) |
| 4 | PB-04 | Tipos compartidos del juego | Alexis | 2 | 🔄 In Progress | `feature/s1-core-state` |
| 5 | PB-05 | Store global del estado (Zustand + Immer) | Alexis | 2 | 🔄 In Progress | `feature/s1-core-state` |
| 6 | PB-06 | Tick loop 1 s + guardado/carga + offline | Alexis | 3 | 🔄 In Progress | `feature/s1-core-state` |
| 7 | PB-07 | Tests básicos del core | Alexis | 1 | 🔄 In Progress | `feature/s1-core-state` |
| 8 | PB-08 | Layout principal y navegación | Francisco | 2 | ✅ Done | `dev` (`6f32a2e`) |
| 9 | PB-09 | Componentes reutilizables | Francisco | 2 | ✅ Done | `dev` (`6f32a2e`) |
| 10 | PB-10 | Conectar la UI con el store | Francisco | 1 | ✅ Done | `dev` (`6f32a2e`) |
| 11 | PB-11 | Datos JSON: islas, recursos, habilidades | Bryton | 2 | ⏳ Sprint Backlog | — |
| 12 | PB-12 | Sistema de navegación (isla, ETA, llegada) | Bryton | 3 | ⏳ Sprint Backlog | — |
| 13 | PB-13 | Recolección automática + XP | Bryton | 2 | ⏳ Sprint Backlog | — |
| 14 | PB-14 | Tests básicos de gameplay | Bryton | 1 | ⏳ Sprint Backlog | — |

**Totales:** 26 pts · 5 Done · 5 In Progress · 4 sin empezar.

> ⚠️ `dev` está rojo hasta que entre `fix/s1-ui-tests-build` (`a7edfc5`): los tests
> de UI no importaban `vitest` y rompían `tsc -b`. El fix ya está subido y espera PR.

---

## Estado por columna del tablero

| Columna | Issues |
| ------- | ------ |
| **Done** | #1, #2, #8, #9, #10 |
| **In Review** | — |
| **In Progress** | #3, #4, #5, #6, #7 |
| **Sprint Backlog** | #11, #12, #13, #14 |
| **Backlog** | #18 – #39 (Sprint 2–4 + icebox) |

---

## Reparto por dev

| Dev | Pts comprometidos | Estado |
| --- | ----------------- | ------ |
| **Javier** | 5 | 4 hechos, CI pendiente del paso de tests |
| **Alexis** | 8 | Implementado, sin PR abierto todavía |
| **Francisco** | 5 | Mergeado; falta el PR del fix de tests |
| **Bryton** | 8 | Sin empezar ⚠️ |

**Riesgo principal:** Bryton (8 pts, 31% del sprint) no ha empezado. Si el lunes no
hay rama `feature/s1-sailing-gather`, se parte `PB-12` y se reasigna `PB-11` a Javier.

---

## Burndown planificado

| Día | 1 | 3 | 5 | 7 | 9 | 11 | 13 | 14 |
| --- | - | - | - | - | - | -- | -- | -- |
| **Ideal (pts restantes)** | 26 | 24 | 20 | 17 | 13 | 8 | 0 | 0 |
| **Real** | 21 | — | — | — | — | — | — | — |

> Actualizar la fila "Real" en cada daily standup.

---

## Impedimentos abiertos

| # | Impedimento | Impacto | Responsable | Acción |
| - | ----------- | ------- | ----------- | ------ |
| 1 | Token de GitHub sin scope `workflow` | No se puede subir el paso de tests al CI | Javier | Editar el token en https://github.com/settings/tokens |
| 2 | Token de GitHub sin scope `project` | No se puede poblar el tablero por API | Francisco | Editar el token y ejecutar `scripts/github/seed_backlog.py --phase project` |
| 3 | `feature/s1-core-state` sin PR | Alexis no puede cerrar PB-04…07 | Alexis | Abrir PR a `dev` y pedir review a Javier |
| 4 | `fix/s1-ui-tests-build` sin PR | `dev` sigue rojo | Francisco | Abrir PR a `dev` y pedir review a Bryton |
| 5 | Bryton sin empezar | Sprint Goal en riesgo | Bryton | Crear rama y datos JSON hoy |

---

## Incremento del sprint (qué debe funcionar el día 14)

- [ ] `npm run dev` arranca y se puede navegar por las 6 páginas.
- [ ] El estado sobrevive a recargar la página (localStorage).
- [ ] Se puede viajar de Tortuga a otra isla y ver la cuenta atrás.
- [ ] Los recursos suben solos mientras estás en una isla.
- [ ] `npm run lint`, `npm run test` y `npm run build` en verde en CI.
- [ ] PR `dev → main` aprobado y tag `v0.1.0`.

---

## Ceremonias del sprint

| Cuándo | Ceremonia | Salida |
| ------ | --------- | ------ |
| Día 1 | Sprint Planning | Este documento + issues asignados |
| Diario (async) | Standup (3 líneas) | Actualizar columna "Real" del burndown |
| Día 7 | Mid-sprint sync | Revisar riesgos y recortar si hace falta |
| Día 13 | Sprint Review | Demo del incremento |
| Día 14 | Retro + release | `dev → main`, tag `v0.1.0`, retro en `docs/RETRO_S1.md` |

---

## Plantilla para los siguientes sprints

Copia este bloque al empezar cada sprint y rellénalo en el Planning:

```markdown
## Sprint N — "<título del sprint>"

| Campo | Valor |
| ----- | ----- |
| Sprint Goal | ... |
| Duración | 2 semanas (fechas) |
| Capacidad | ~20 pts |
| Comprometidos | N pts |

| # | ID | Tarea | Responsable | Pts | Estado | Rama / PR |
| - | -- | ----- | ----------- | --- | ------ | --------- |
| 1 | PB-xx | ... | ... | x | ⏳ | — |

### Riesgos
| Riesgo | Mitigación |
| ------ | ---------- |

### Burndown
| Día | 1 | 3 | 5 | 7 | 9 | 11 | 13 | 14 |
| --- | - | - | - | - | - | -- | -- | -- |
| Ideal | N | ... | 0 |
| Real | N | | | | | | | |
```

---

_Documento vivo — se reescribe en cada Sprint Planning._
