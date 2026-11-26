# 🏴‍☠️ Pirate Idle

Juego idle de piratas inspirado en **Melvor Idle** y **Progress Knight**.
4 desarrolladores · Metodología Scrum · 4 sprints hasta la release v1.0.

---

## 🚀 Cómo ejecutar

Requisitos: **Node.js 20** y npm.

```bash
git clone https://github.com/Fravicabe/Juego_Piratas_Grupo1_PI.git
cd Juego_Piratas_Grupo1_PI
npm ci
npm run dev        # http://localhost:5173
```

La rama de ejecución es **`main`**. Release actual: **`v0.1.0`** (Sprint 1).

Comprobaciones:

```bash
npm run lint       # ESLint
npm run test       # Vitest — 99 tests
npm run build      # build de producción en dist/
```

Si `npm ci` falla por el lockfile, usa `npm install`.

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

| Dev           | Rol / Área principal            | Tarea Sprint 1                                               |
| ------------- | ------------------------------- | ------------------------------------------------------------ |
| **Javier**    | Infraestructura / Configuración | S1-A: Configuración del proyecto (Vite, React, TS, Tailwind) |
| **Alexis**    | Motor del juego (Core)          | S1-B: Estado, tick loop, guardado/carga                      |
| **Francisco** | UI / Frontend                   | S1-C: Shell de UI y navegación                               |
| **Bryton**    | Gameplay / Contenido            | S1-D: Navegación y recolección de recursos                   |

> Cada tarea tiene un único responsable (accountable), pero todos revisan PRs.

---

## 🛠️ Stack tecnológico

| Capa         | Tecnología                        |
| ------------ | --------------------------------- |
| Lenguaje     | TypeScript (strict)               |
| Bundler      | Vite                              |
| UI           | React 18                          |
| Estado       | Zustand + Immer                   |
| Estilos      | Tailwind CSS                      |
| Persistencia | localStorage + export/import JSON |
| Tests        | Vitest + Testing Library          |
| Lint/Format  | ESLint + Prettier                 |
| CI           | GitHub Actions                    |

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

## 🌿 Estrategia de ramas (estándar empresarial — GitHub Flow + releases)

Modelo híbrido usado en empresas: ramas cortas, `main` siempre desplegable y protegida,
integración en `dev`, releases por tags. **Nadie hace push directo a `main` ni a `dev`.**

```
main        ← producción, siempre desplegable, solo tags de release (PROTEGIDA)
  └── dev   ← integración del sprint, deploy a staging (PROTEGIDA)
        ├── feature/s1-setup-ci          (Javier)
        ├── feature/s1-core-state        (Alexis)
        ├── feature/s1-ui-shell          (Francisco)
        └── feature/s1-sailing-gather    (Bryton)
              └── (opcional) release/s1  ← rama de estabilización pre-release
hotfix/*    ← desde main, para bugs críticos en producción
```

### Reglas (no negociables)
1. **`main` y `dev` están protegidas** en GitHub (Settings → Branches):
   - Prohibido push directo.
   - Requiere Pull Request para entrar.
   - Requiere **1 aprobación** de un compañero.
   - Requiere CI verde (build + lint + tests).
   - Prohibido force-push y borrado.
2. **Toda tarea se hace en una rama `feature/*`** creada desde `dev`.
   - Vida corta (máx. 2–3 días). Si crece, se parte en varias ramas.
3. **Integración `feature → dev`**: vía **Pull Request + squash merge**.
   - El revisor (buddy) aprueba tras pasar el checklist de `docs/QUALITY.md`.
4. **Release `dev → main`**: al final de cada sprint, vía **PR + merge commit** y tag `vX.Y.Z`.
   - Solo el responsable de release (rotativo) abre este PR.
5. **Hotfixes**: rama `hotfix/*` desde `main`, PR a `main` y cherry-pick/merge a `dev`.
6. **Un PR por tarea**, pequeño y enfocado. PRs grandes se rechazan y se parten.

### Protección de ramas

Configuración obligatoria para todo el equipo:

- PR obligatorio para entrar en `main` y `dev`.
- **1 aprobación** de un compañero.
- `quality-gate` (lint + test + build) en verde.
- Prohibido el force-push y el borrado de ramas.

El historial anterior a `v0.1.0` se considera *bootstrap* y no se reescribe.

### Nomenclatura de ramas**
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

## 🌿 Flujo de trabajo

```bash
git checkout dev && git pull
git checkout -b feature/s2-<slug>
# ... trabajo ...
npm run lint && npm run test && npm run build
git push -u origin feature/s2-<slug>
# PR a dev → 1 review + quality-gate verde → merge
```

---

## 📅 Ceremonias Scrum

- **Sprint Planning** (día 1): seleccionar issues, estimar, asignar.
- **Daily standup** (async, 3 líneas): ayer / hoy / bloqueos.
- **Sprint Review + Retro** (último día): demo y mejoras.
- Duración de sprint: **2 semanas** (4 sprints = 8 semanas hasta v1.0).

---

## ⚠️ Riesgos y mitigaciones

| Riesgo                                  | Mitigación                                                    |
| --------------------------------------- | ------------------------------------------------------------- |
| Conflictos en estado compartido         | Contrato primero en `types.ts`; un dueño por área de archivos |
| Scope creep en Sprint 1                 | DoD estricto; "nice to have" va al backlog                    |
| Bugs de matemática idle (NaN, overflow) | Usar números acotados; tests unitarios del tick               |
| Corrupción de guardado                  | Versionado de esquema + migración + slot de backup            |
| Carga desigual                          | Standup diario; reasignar tareas si hay bloqueos              |

---

## 📄 Más información

- Backlog del producto: `docs/BACKLOG.md`
- Sprint Backlog (sprint en curso): `docs/SPRINT_BACKLOG.md`
- Plan completo: `docs/PLAN.md`
- Plan de calidad (tests, review, gates): `docs/QUALITY.md`
- Issues del Sprint 1: `docs/ISSUES_SPRINT1.md`
- Tablero: https://github.com/users/Fravicabe/projects/2

_Versión 1.0 — se ajusta a medida que el equipo aprende._
