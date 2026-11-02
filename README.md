# 🏴‍☠️ Pirate Idle

Juego idle de piratas inspirado en **Melvor Idle** y **Progress Knight**.
4 desarrolladores · Metodología Scrum · 4 sprints hasta la release v1.0.

---

## 🎮 Visión del juego

Juego idle en navegador donde el jugador navega entre islas, recolecta recursos,
combate piratas rivales y la marina, recluta tripulación, mejora su barco y
progresa por rangos piratas (grumete → capitán → rey pirata). El progreso
offline se calcula al volver. El prestigio ("Nueva Travesía") reinicia el
progreso a cambio de multiplicadores permanentes. Todo es data-driven para
poder añadir contenido sin tocar código.

### Pilares
1. **Bucle idle** — navegar, combatir y recolectar en automático; el jugador define objetivos.
2. **Progresión** — habilidades (navegación, combate, comercio) suben de nivel; los rangos desbloquean contenido.
3. **Economía** — oro, recursos y comercio entre islas con diferencias de precio.
4. **Tripulación y barco** — mejoras que multiplican las ganancias.
5. **Prestigio** — reinicio con bonificadores permanentes para juego a largo plazo.

---

## 👥 Equipo (4 devs)

| Dev | Rol / Área principal | Tarea Sprint 1 |
|---|---|---|
| **Dev A** | DevOps / Infraestructura | S1-A: Scaffold del proyecto + CI/CD |
| **Dev B** | Core / Motor del juego | S1-B: Estado, tick loop, guardado/carga |
| **Dev C** | UI / Frontend | S1-C: Shell de UI y navegación |
| **Dev D** | Gameplay / Contenido | S1-D: Navegación y recolección de recursos |

> Cada tarea tiene un único responsable (accountable), pero todos revisan PRs.

---

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|---|---|
| Lenguaje | TypeScript (strict) |
| Bundler | Vite |
| UI | React 18 |
| Estado | Zustand + Immer |
| Estilos | Tailwind CSS |
| Persistencia | localStorage + export/import JSON |
| Tests | Vitest + Testing Library |
| Lint/Format | ESLint + Prettier |
| CI | GitHub Actions |

---

## 📂 Estructura del repositorio

```
pirate-idle/
├── .github/                  # workflows, templates, CODEOWNERS
├── src/
│   ├── core/                 # motor: estado, tick, guardado/carga, tipos
│   ├── data/                 # JSON de contenido: islas, items, habilidades
│   ├── features/             # módulos: navegación, combate, comercio, tripulación
│   ├── ui/                   # componentes React
│   └── utils/
├── tests/
├── docs/                     # diseño, balance, plan
├── public/
└── README.md
```

---

## 🌿 Estrategia de ramas (Git Flow lite)

```
main        ← producción, siempre desplegable, solo tags de release
  └── dev   ← rama de integración, objetivo del sprint
        ├── feature/s1-setup-ci
        ├── feature/s1-core-state
        ├── feature/s1-ui-shell
        └── feature/s1-sailing-gather
```

**Reglas**
- `main` protegida: sin pushes directos, PR + 1 review + CI verde.
- `dev` protegida: PR + 1 review + CI verde.
- Las ramas `feature/*` se crean **desde `dev`**, nunca desde `main`.
- Una rama por tarea; un PR por rama.
- Merge `feature → dev`: **squash merge**.
- Merge `dev → main`: **merge commit** al final del sprint (release).
- Hotfixes: rama `hotfix/*` desde `main`, merge a `main` y `dev`.

**Nomenclatura de ramas**
```
feature/s<sprint>-<slug>     ej. feature/s1-core-state
bugfix/<numero>-<slug>
hotfix/<slug>
chore/<slug>
```

---

## 📋 Organización en GitHub

- **Project (tablero):** columnas `Backlog → Sprint Backlog → In Progress → In Review → Done`.
- **Milestones:** `Sprint 1` … `Sprint 4`, `v1.0 Release`.
- **Labels:**
  - Tipo: `feature`, `bug`, `chore`, `docs`, `balance`
  - Área: `core`, `ui`, `data`, `combat`, `economy`, `crew`
  - Prioridad: `p0-blocker`, `p1-high`, `p2-med`, `p3-low`
  - Sprint: `sprint-1` … `sprint-4`
- Cada tarea = un Issue, asignado a una persona, vinculado a un milestone.
- Los PRs referencian issues con `Closes #12` en la descripción.

### Definition of Done
- El código compila (`npm run build`).
- Lint + tests pasan en CI.
- PR aprobado por al menos 1 compañero.
- Merge a `dev` vía squash merge.
- Issue movido a Done y cerrado.

---

## 🏃 Sprints (4 sprints de 2 semanas)

### Sprint 1 — Fundamentos y primer bucle jugable (MVP)
Objetivo: app ejecutable donde el jugador navega, recolecta y ve números subir.
- S1-A: Scaffold + CI (Dev A, 5 pts)
- S1-B: Motor core: estado, tick, guardado/carga (Dev B, 8 pts)
- S1-C: Shell de UI y navegación (Dev C, 5 pts)
- S1-D: Navegación y recolección (Dev D, 8 pts)

### Sprint 2 — Combate, economía y progresión
- S2-A: Motor de combate (Dev A, 8 pts)
- S2-B: Sistema de habilidades y UI de niveles (Dev B, 5 pts)
- S2-C: Comercio/economía (Dev C, 5 pts)
- S2-D: Reclutamiento de tripulación (Dev D, 5 pts)

### Sprint 3 — Contenido, automatización y prestigio
- S3-A: Pipeline de contenido (5 islas, items, enemigos) (Dev A, 5 pts)
- S3-B: Mejoras y slots de equipo del barco (Dev B, 5 pts)
- S3-C: Progreso offline + pulido del tick (Dev C, 3 pts)
- S3-D: Prestigio ("Nueva Travesía") + logros (Dev D, 8 pts)

### Sprint 4 — Balance, pulido y release
- S4-A: Pase de balance y curva de dificultad (Dev A, 5 pts)
- S4-B: Audio, iconos y pulido visual (Dev B, 5 pts)
- S4-C: Cobertura de tests + bug bash (Dev C, 5 pts)
- S4-D: Deploy (GitHub Pages) + notas de release + tag v1.0 (Dev D, 3 pts)

---

## 🚀 Comandos rápidos

```bash
git clone <repo>
cd pirate-idle
npm install
npm run dev          # http://localhost:5173
npm run test         # vitest
npm run build        # build de producción
npm run lint         # eslint
```

Flujo de ramas de ejemplo:
```bash
git checkout dev
git pull
git checkout -b feature/s1-core-state
# ... trabajo ...
git push -u origin feature/s1-core-state
# abrir PR: feature/s1-core-state -> dev
```

---

## 📅 Ceremonias Scrum

- **Sprint Planning** (día 1): seleccionar issues, estimar, asignar.
- **Daily standup** (async, 3 líneas): ayer / hoy / bloqueos.
- **Sprint Review + Retro** (último día): demo y mejoras.
- Duración de sprint: **2 semanas** (4 sprints = 8 semanas hasta v1.0).

---

## ⚠️ Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Conflictos en estado compartido | Contrato primero en `types.ts`; un dueño por área de archivos |
| Scope creep en Sprint 1 | DoD estricto; "nice to have" va al backlog |
| Bugs de matemática idle (NaN, overflow) | Usar números acotados; tests unitarios del tick |
| Corrupción de guardado | Versionado de esquema + migración + slot de backup |
| Carga desigual | Standup diario; reasignar tareas si hay bloqueos |

---

## 📄 Más información

Plan completo: `docs/PLAN.md`

*Versión 1.0 — se ajusta a medida que el equipo aprende.*
