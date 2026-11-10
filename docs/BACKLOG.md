# 📚 Project Backlog (Product Backlog) — Pirate Idle

Backlog único del producto: **todo** lo que el juego necesita, esté o no planificado.
Es la fuente de verdad para el Sprint Planning: en cada planning se "tira" de aquí
hacia el [Sprint Backlog](SPRINT_BACKLOG.md).

- **Product Owner (rotativo):** el dev que esté libre de bloqueos esa semana.
- **Equipo:** Javier (infra), Alexis (core), Francisco (UI), Bryton (gameplay).
- **Sprints:** 4 sprints de 2 semanas hasta `v1.0` (ver `docs/PLAN.md`).
- **Detalle del Sprint 1:** `docs/ISSUES_SPRINT1.md`.

---

## Dónde vive el backlog

- **Tablero (GitHub Projects):** https://github.com/users/Fravicabe/projects/2
- **Product Backlog (fuente de verdad):** `docs/BACKLOG.md` + `docs/backlog.json`
- **Sprint Backlog (sprint en curso):** `docs/SPRINT_BACKLOG.md`
- **Script para volcar el backlog en GitHub:** `scripts/github/seed_backlog.py`

| Columna del tablero | Significado |
| ------------------- | ----------- |
| `Backlog` | Todo lo no planificado |
| `Sprint Backlog` | Seleccionado para el sprint actual |
| `In Progress` | Rama `feature/*` abierta |
| `In Review` | PR abierto esperando buddy review |
| `Done` | Mergeado a `dev` + DoD cumplido |

Campos del tablero: `Status`, `Priority`, `Points`, `Sprint`, `Área`, `Épica`.
**Milestones:** `Sprint 1` … `Sprint 4`, `v1.0 Release`.
**Labels:** tipo (`feature`, `chore`, `bug`, `docs`, `balance`) + área (`core`, `ui`,
`data`, `gameplay`, `combat`, `economy`, `crew`, `infra`, `calidad`) + prioridad
(`p0-blocker` … `p3-low`) + `sprint-N` / `icebox`.

---

## 1. Cómo se usa este documento

1. **Refinamiento (grooming):** cada miércoles se revisan los 5 primeros ítems de la
   columna *Sin sprint* y se estiman/priorizan.
2. **Sprint Planning (día 1):** se eligen ítems hasta llenar la capacidad
   (~20 pts/sprint para 4 devs) y se copian al `SPRINT_BACKLOG.md`.
3. **Ejecución:** cada ítem se convierte en **un Issue de GitHub** con su label,
   milestone y responsable; se mueve en el tablero del Project.
4. **Cierre:** al final del sprint, los ítems no terminados **vuelven al backlog**
   (no se arrastran "en silencio").

### Sincronización con GitHub Projects

Cada ítem del backlog se corresponde con **un Issue** del repo. El tablero solo
refleja el estado; la fuente de verdad sigue siendo `docs/backlog.json`.

---

## 2. Leyenda

### Prioridad (valor de negocio)

| Código | Significado | Regla |
| ------ | ----------- | ----- |
| `p0-blocker` | Bloquea al equipo o al release | Se atiende antes que nada |
| `p1-high` | Necesario para el MVP jugable | Entra en S1/S2 sí o sí |
| `p2-med` | Mejora clara, no bloquea | Entra si hay capacidad |
| `p3-low` | Deseable / pulido | Icebox si no hay hueco |

### Estado

| Icono | Estado | Criterio |
| ----- | ------ | -------- |
| ✅ | Hecho | Mergeado a `dev` y cumple el DoD |
| 🔄 | En curso / En review | Rama abierta o PR pendiente |
| ⏳ | Pendiente | Planificado en un sprint, sin empezar |
| 🧊 | Icebox | Sin sprint asignado; puede caerse |

### Estimación

Escala Fibonacci: `1, 2, 3, 5, 8, 13`. Nada por encima de **8** (se parte).
La estimación es de **esfuerzo relativo**, no de horas.

---

## 3. Épicas

| ID | Épica | Resultado esperado |
| -- | ----- | ------------------ |
| **EP-01** | Bucle idle y navegación | El juego avanza solo: viajar, llegar, recolectar |
| **EP-02** | Progresión y habilidades | XP, niveles y rangos que desbloquean contenido |
| **EP-03** | Economía y comercio | Oro, precios por isla, comprar/vender |
| **EP-04** | Combate | Enemigos, daño, botín |
| **EP-05** | Tripulación y barco | Reclutar crew, mejorar barco |
| **EP-06** | Prestigio y contenido | Reset con bonus, más islas, export/import |
| **EP-07** | UI/UX | Shell, páginas, componentes, responsive |
| **EP-08** | Infraestructura y calidad | Scaffold, lint, CI, protección, deploy |

---

## 4. Backlog completo

> Los ítems `PB-01` … `PB-14` corresponden 1:1 con los Issues 1–14 de
> `docs/ISSUES_SPRINT1.md`. Los de S2–S4 son de alto nivel y se detallan en su planning.

| ID | Issue | Elemento del backlog | Épica | Área | Prio | Pts | Sprint | Estado |
| -- | ----- | -------------------- | ----- | ---- | ---- | --- | ------ | ------ |
| PB-01 | #1 | Configurar el proyecto base (Vite + React + TS + Tailwind) | EP-08 | infra | p0 | 3 | S1 | ✅ |
| PB-02 | #2 | Configurar ESLint y Prettier | EP-08 | infra | p1 | 1 | S1 | ✅ |
| PB-03 | #3 | GitHub Actions: lint + test + build en `dev` | EP-08 | infra | p0 | 1 | S1 | 🔄 |
| PB-04 | #4 | Definir los tipos compartidos del juego | EP-02 | core | p0 | 2 | S1 | ✅ |
| PB-05 | #5 | Store global del estado (Zustand + Immer) | EP-02 | core | p0 | 2 | S1 | ✅ |
| PB-06 | #6 | Tick loop de 1 s + guardado/carga + offline | EP-01 | core | p1 | 3 | S1 | ✅ |
| PB-07 | #7 | Tests básicos del core | EP-08 | core | p1 | 1 | S1 | ✅ |
| PB-08 | #8 | Layout principal y navegación (topbar + sidebar) | EP-07 | ui | p0 | 2 | S1 | ✅ |
| PB-09 | #9 | Componentes reutilizables (Button, Card, ResourceBar…) | EP-07 | ui | p1 | 2 | S1 | ✅ |
| PB-10 | #10 | Conectar la UI con el store | EP-07 | ui | p1 | 1 | S1 | ✅ |
| PB-11 | #11 | Datos JSON: islas, recursos, habilidades | EP-01 | data | p1 | 2 | S1 | 🔄 |
| PB-12 | #12 | Sistema de navegación (elegir isla, ETA, llegada) | EP-01 | gameplay | p1 | 3 | S1 | ⏳ |
| PB-13 | #13 | Recolección automática + XP de habilidades | EP-01 | gameplay | p1 | 2 | S1 | ⏳ |
| PB-14 | #14 | Tests básicos de gameplay | EP-08 | gameplay | p1 | 1 | S1 | ⏳ |
| PB-15 | — | Motor de combate automático por turnos | EP-04 | combat | p1 | 8 | S2 | ⏳ |
| PB-16 | — | Botín y drops de combate | EP-04 | combat | p2 | 3 | S2 | ⏳ |
| PB-17 | — | Sistema de habilidades completo + UI de niveles | EP-02 | ui | p1 | 5 | S2 | ⏳ |
| PB-18 | — | Mercado: comprar y vender recursos | EP-03 | economy | p2 | 5 | S2 | ⏳ |
| PB-19 | — | Precios variables por isla | EP-03 | economy | p2 | 3 | S2 | ⏳ |
| PB-20 | — | Reclutamiento de tripulación (taberna) | EP-05 | crew | p2 | 5 | S2 | ⏳ |
| PB-21 | — | Pipeline de contenido: 5 islas + items + enemigos | EP-06 | data | p2 | 5 | S3 | ⏳ |
| PB-22 | — | Enemigos data-driven y escalado de dificultad | EP-04 | combat | p2 | 5 | S3 | ⏳ |
| PB-23 | — | Mejoras de barco y slots de equipo | EP-05 | crew | p2 | 5 | S3 | ⏳ |
| PB-24 | — | Progreso offline avanzado (catch-up por sistema) | EP-01 | core | p2 | 3 | S3 | ⏳ |
| PB-25 | — | Prestigio "Nueva Travesía" + logros | EP-06 | core | p2 | 8 | S3 | ⏳ |
| PB-26 | — | Exportar / importar guardado en JSON | EP-06 | core | p2 | 3 | S3 | ⏳ |
| PB-27 | — | Pase de balance y curva de dificultad | EP-06 | balance | p2 | 5 | S4 | ⏳ |
| PB-28 | — | Audio, iconos y pulido visual | EP-07 | ui | p3 | 5 | S4 | ⏳ |
| PB-29 | — | Cobertura de tests + bug bash | EP-08 | calidad | p2 | 5 | S4 | ⏳ |
| PB-30 | — | Deploy a GitHub Pages + notas de release + tag `v1.0` | EP-08 | infra | p2 | 3 | S4 | ⏳ |
| PB-31 | — | Responsive 768 px + accesibilidad ≥ 80 | EP-07 | ui | p2 | 2 | Sin sprint | 🧊 |
| PB-32 | — | Pantalla de ajustes (guardar, reiniciar, borrar save) | EP-07 | ui | p2 | 3 | Sin sprint | 🧊 |
| PB-33 | — | Auto-navegación por rutas | EP-01 | gameplay | p3 | 5 | Sin sprint | 🧊 |
| PB-34 | — | Toasts / notificaciones de eventos | EP-07 | ui | p3 | 2 | Sin sprint | 🧊 |
| PB-35 | — | Registro de ingresos y gastos | EP-03 | economy | p3 | 2 | Sin sprint | 🧊 |
| PB-36 | — | i18n (español / inglés) | EP-07 | ui | p3 | 5 | Sin sprint | 🧊 |

**Totales:** 36 ítems · ~121 pts en sprints planificados · ~19 pts en icebox.

---

## 5. Roadmap de releases

| Versión | Sprint | Contenido mínimo | Tag |
| ------- | ------ | ---------------- | --- |
| `v0.1.0` | S1 | App navegable, estado persistente, navegar + recolectar | `v0.1.0` |
| `v0.2.0` | S2 | Combate, mercado, habilidades, tripulación | `v0.2.0` |
| `v0.3.0` | S3 | 5 islas, mejoras de barco, prestigio, export/import | `v0.3.0` |
| `v1.0.0` | S4 | Balance, pulido, deploy y release notes | `v1.0.0` |

Cada release se publica con un PR `dev → main` + merge commit + tag (ver `README.md`).

---

## 6. Definition of Ready (cuándo un ítem puede entrar a un sprint)

Un ítem **no** entra al Sprint Backlog si le falta alguno de estos puntos:

- [ ] Tiene **ID** (`PB-xx`) y descripción en una frase.
- [ ] Está **estimado** (1–8 pts).
- [ ] Tiene **criterios de aceptación** verificables.
- [ ] Tiene **un único responsable** posible.
- [ ] No depende de algo que aún no existe (o la dependencia está resuelta/planificada).
- [ ] Está priorizado (`p0`–`p3`).

## 7. Definition of Done

Igual para todo el producto (detalle en `docs/QUALITY.md`):

- [ ] Compila (`npm run build`).
- [ ] `npm run lint` y `npm run test` pasan.
- [ ] Lógica nueva con tests unitarios.
- [ ] PR revisado por **al menos 1 compañero** (buddy review).
- [ ] Squash merge a `dev` y la app arranca (`npm run dev`).
- [ ] Issue cerrado y movido a `Done`.

---

## 8. Mantenimiento

- **Se actualiza:** en cada Sprint Planning y en cada refinamiento (miércoles).
- **Dueño:** el Product Owner rotativo de la semana.
- **Regla de oro:** si algo no está aquí, no existe; si se cae del sprint, vuelve aquí.
- **Nunca** se borra un ítem: se marca como ✅, 🧊 o se divide en otros.

---

_Documento vivo — última revisión: Sprint 1._
