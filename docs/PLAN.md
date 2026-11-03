# 🏴‍☠️ Pirate Idle Game — Project Plan

Inspired by **Melvor Idle** (skill-based idle RPG) and **Progress Knight** (life-stage progression).
Team: 4 people · Method: Scrum · 4 sprints to a playable release.

---

## 1. Game Vision (one paragraph)

A browser-based idle pirate game. The player sails between islands, gathers
resources, fights rival pirates/navy, recruits crew, upgrades their ship, and
progresses through "pirate ranks" (cabin boy → captain → pirate king).
Offline progress is calculated on return. Prestige ("New Voyage") resets progress
for permanent bonuses. Everything is data-driven so content can be added without
code changes.

### Core pillars
1. **Idle loop** — auto-sail, auto-combat, auto-gather; player sets targets.
2. **Progression** — skills (sailing, combat, navigation, trade) level up; ranks unlock content.
3. **Economy** — gold, resources, trading between islands with price differences.
4. **Crew & ship** — upgrades multiply gains; crew members give bonuses.
5. **Prestige** — reset for permanent multipliers; keeps long-term play.

---

## 2. Tech Stack (recommended)

| Layer | Choice | Why |
|---|---|---|
| Language | TypeScript (strict) | Type safety for game state |
| Bundler | Vite | Fast dev, simple config |
| UI | React 18 | Component-based HUD/menus |
| State | Zustand + Immer | Simple, performant idle state |
| Styling | Tailwind CSS | Fast iteration |
| Persistence | localStorage + JSON export/import | Offline-first |
| Tests | Vitest + Testing Library | Unit + component tests |
| Lint/Format | ESLint + Prettier | Consistency across 4 devs |
| CI | GitHub Actions | Build/test on every PR |

> If the team prefers a game engine, swap React for **Godot 4** (export to web).
> The sprint plan below stays valid either way — only file paths change.

---

## 3. GitHub Organization

### 3.1 Repository layout

```
pirate-idle/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml              # build + test + lint on PR
│   │   └── release.yml         # deploy to GitHub Pages on main tag
│   ├── ISSUE_TEMPLATE/
│   │   ├── feature.yml
│   │   ├── bug.yml
│   │   └── task.yml
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── CODEOWNERS
├── src/
│   ├── core/                   # game engine: state, tick, save/load
│   ├── data/                   # JSON content: islands, items, skills
│   ├── features/               # feature modules (sailing, combat, trade, crew)
│   ├── ui/                     # React components
│   └── utils/
├── tests/
├── docs/                       # design docs, balance sheets
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── eslint.config.js
├── .prettierrc
└── README.md
```

### 3.2 Branching strategy (Git Flow lite)

```
main        ← production, always deployable, tagged releases only
  └── dev   ← integration branch, sprint target
        ├── feature/s1-setup-ci          (Person A)
        ├── feature/s1-core-state        (Person B)
        ├── feature/s1-ui-shell          (Person C)
        └── feature/s1-sailing-gather    (Person D)
```

**Rules**
- `main` is protected: no direct pushes, PR + 1 review + green CI required.
- `dev` is protected: PR + 1 review + green CI required.
- Feature branches are created **from `dev`**, never from `main`.
- One feature branch per task; one PR per feature branch.
- Merge feature → dev via **squash merge** (clean history).
- Merge dev → main via **merge commit** at sprint end (release).
- Hotfixes branch from `main` as `hotfix/*` and merge back to both `main` and `dev`.

**Branch naming**
```
feature/s<sprint>-<short-slug>     e.g. feature/s1-core-state
bugfix/<issue-number>-<slug>
hotfix/<slug>
chore/<slug>                       (tooling, deps)
```

### 3.3 GitHub Projects (board)

Create one Project (board view) with columns:
`Backlog → Sprint Backlog → In Progress → In Review → Done`

- **Milestones**: `Sprint 1`, `Sprint 2`, `Sprint 3`, `Sprint 4`, `v1.0 Release`.
- **Labels**:
  - Type: `feature`, `bug`, `chore`, `docs`, `balance`
  - Area: `core`, `ui`, `data`, `combat`, `economy`, `crew`
  - Priority: `p0-blocker`, `p1-high`, `p2-med`, `p3-low`
  - Sprint: `sprint-1` … `sprint-4`
- Each task = one Issue, assigned to one person, linked to a milestone.
- PRs reference issues with `Closes #12` in description.

### 3.4 CODEOWNERS (suggested)

```
# .github/CODEOWNERS
/src/core/     @Alexis
/src/ui/       @Francisco
/src/features/ @Bryton
/.github/      @Javier
```

### 3.5 Definition of Done (applies to every task)
- Code compiles (`npm run build`).
- Lint + tests pass in CI.
- Revisado por al menos 1 compañero vía Pull Request.
- Fusionado a `dev` mediante squash merge (PR aprobado).
- Issue moved to Done and closed.

---

## 4. Sprint Cadence

- Sprint length: **2 weeks** (4 sprints = 8 weeks to v1.0).
- Ceremonies: Sprint Planning (day 1), Daily standup (async, 5 min), Sprint Review + Retro (last day).
- Velocity baseline: TBD after Sprint 1; assume ~20 story points/sprint for 4 devs.

### Story point scale (Fibonacci): 1,2,3,5,8,13. Anything >8 gets split.

---

## 5. Sprint Overview (4 sprints)

### Sprint 1 — Foundation & First Playable Loop (MVP skeleton)
Goal: a runnable app where the player can sail, gather, and see numbers go up.
Deliverables: project scaffold + CI, core state/save/tick, UI shell, sailing+gathering.

### Sprint 2 — Combat, Economy & Progression
Goal: fighting, trading, leveling, crew.
Deliverables: combat system, skill leveling, island trading, crew recruitment.

### Sprint 3 — Content, Automation & Prestige
Goal: depth and replayability.
Deliverables: 5+ islands/biomes, ship upgrades, offline progress, prestige system, achievements.

### Sprint 4 — Balance, Polish & Release
Goal: shippable v1.0.
Deliverables: tuning pass, audio/assets, full test coverage of core, deploy to GitHub Pages, release notes.

---

## 6. Sprint 1 — Detailed Plan (4 tasks, 1 per person)

> **Contract-first kickoff (Day 1, 2h):** before anyone codes, the 4 of you agree on
> the shared TypeScript interfaces in `src/core/types.ts` (GameState, Island, Item,
> Skill, CrewMember, Ship). Person B drafts them; everyone reviews. This unblocks
> parallel work.

### Task S1-A — Project Scaffold & Config (Owner: Javier) — 5 pts
**Branch:** `feature/s1-setup-ci`

**Scope**
- Initialize Vite + React + TS project.
- Add ESLint, Prettier, Tailwind, Vitest.
- Configure `package.json` scripts: `dev`, `build`, `test`, `lint`, `format`.
- Create `.github/workflows/ci.yml` (install, lint, test, build on PR to dev/main).
- Create issue/PR templates, `CODEOWNERS`, `README.md` with run instructions.
- Set up GitHub Project board + labels + milestones (manual, via GitHub UI).

**Acceptance criteria**
- `npm install && npm run dev` runs a blank page.
- `npm run build` succeeds.
- CI workflow green on a sample PR.
- README documents how to run locally.

**Files touched:** root config, `.github/`, `README.md`.

---

### Task S1-B — Core Engine: State, Tick Loop & Save/Load (Owner: Alexis) — 8 pts
**Branch:** `feature/s1-core-state`

**Scope**
- Define shared types in `src/core/types.ts`.
- Implement `GameState` store (Zustand) with: player, ship, crew, islands discovered, inventory, skills, gold, timestamps.
- Implement tick loop: a single `setInterval` accelerator with two logical rates — 50ms for active skill progress (Progress Knight-style) and 1s for travel/gathering; tracks `lastTick` and `worldAccumulatorMs` for offline catch-up.
- Implement save/load: serialize to localStorage on interval + on `visibilitychange`/`beforeunload`; load on boot; validate schema version.
- Export `useGameStore`, `tick(dt)`, `saveGame()`, `loadGame()`.
- Unit tests for tick accumulation and save/load round-trip.

**Acceptance criteria**
- State persists across page reload.
- Offline progress: closing tab for N seconds and reopening grants ~N seconds of progress (capped at 8h).
- 100% of pure functions in `core/` have unit tests.

**Files touched:** `src/core/*`, `tests/core/*`.

---

### Task S1-C — UI Shell & Navigation (Owner: Francisco) — 5 pts
**Branch:** `feature/s1-ui-shell`

**Scope**
- App layout: top bar (gold, rank, settings), sidebar nav, main content area, bottom status bar.
- Pages/routes: Home (dashboard), Map, Skills, Crew, Ship, Settings.
- Reusable components: `ResourceBar`, `ProgressBar`, `Card`, `Button`, `Modal`, `Toast`.
- Theme: pirate palette (dark wood, gold, parchment) via Tailwind config.
- Wire pages to game store (read-only display; buttons dispatch actions).
- Empty-state placeholders for features not yet built (Sprint 2+).

**Acceptance criteria**
- All 6 pages render without errors.
- Navigation works via sidebar and URL (React Router).
- Responsive down to 768px width.
- Lighthouse accessibility score ≥ 80 on Home.

**Files touched:** `src/ui/*`, `tailwind.config.ts`.

---

### Task S1-D — First Gameplay: Sailing & Resource Gathering (Owner: Bryton) — 8 pts
**Branch:** `feature/s1-sailing-gather`

**Scope**
- Data: `src/data/islands.json` (3 starter islands), `src/data/resources.json` (wood, iron, food, gold), `src/data/skills.json` (sailing, gathering, bargaining).
- Sailing system: choose destination island; travel takes time scaled by ship speed; auto-arrives; emits `arrived` event.
- Gathering system: at an island, auto-gather its resources at a rate scaled by gathering skill; skill XP gained per gather.
- Skill leveling: XP → level with exponential curve; level multiplies gather rate.
- UI: Map page with island list + travel button + ETA; Home shows current activity + rates.
- Integrate with core store actions.

**Acceptance criteria**
- Player can sail from Island A to B and see ETA countdown.
- Resources accumulate while on an island; skill XP increases.
- Rates displayed update live.
- Unit tests for travel time calc and XP curve.

**Files touched:** `src/features/sailing/*`, `src/features/gathering/*`, `src/data/*`, tests.

---

### Sprint 1 dependency map

```
S1-A (scaffold) ──► unblocks all others (day 1)
S1-B (types)    ──► S1-C, S1-D consume types
S1-C (UI)       ──► S1-D renders into Map/Home pages
S1-D (gameplay) ──► needs B + C
```

**Mitigation:** Day 1 contract session locks `types.ts`. Each task exposes a small public API (store actions / components) documented in its PR description so others can mock. Merge order at sprint end: A → B → C → D, resolving conflicts incrementally.

---

## 7. Task Division Rules (for all sprints)

1. **One owner per task** — single accountable person; others review.
2. **Tasks are sized 3–8 points** — split anything larger.
3. **No two tasks touch the same primary file** to minimize merge conflicts.
4. **Each task ships a vertical slice** where possible (data + logic + UI + tests).
5. **Shared code (core/types) changes require a PR + team review** before merge.
6. **Daily async standup** in chat: yesterday / today / blockers (3 lines).

---

## 8. Sprint 2–4 Backlog (high level, to be refined each planning)

### Sprint 2 (Combat, Economy, Progression)
- S2-A: Combat engine (turn-based auto-battle, damage, loot) — 8 pts
- S2-B: Skill system expansion + leveling UI (all skills) — 5 pts
- S2-C: Trading/economy (buy/sell, price variance by island) — 5 pts
- S2-D: Crew recruitment & bonuses — 5 pts

### Sprint 3 (Content, Automation, Prestige)
- S3-A: Content pipeline (5 islands, items, enemies data) — 5 pts
- S3-B: Ship upgrades & equipment slots — 5 pts
- S3-C: Offline progress + tick catch-up polish — 3 pts
- S3-D: Prestige ("New Voyage") + achievements — 8 pts

### Sprint 4 (Balance, Polish, Release)
- S4-A: Balancing pass + difficulty curve — 5 pts
- S4-B: Audio, icons, visual polish — 5 pts
- S4-C: Test coverage push + bug bash — 5 pts
- S4-D: Deploy (GitHub Pages) + release notes + v1.0 tag — 3 pts

---

## 9. First Sprint — Day-by-Day (2 weeks)

| Day | Activity |
|---|---|
| 1 | Sprint planning + contract session (types.ts) + scaffold kickoff |
| 2–3 | A: CI green; B: store + tick; C: layout; D: data files |
| 4–6 | B: save/load + tests; C: pages/components; D: sailing logic |
| 7 | Mid-sprint sync: integrate B↔C↔D, resolve type drift |
| 8–9 | D: gathering + skill XP; C: polish; B: offline catch-up |
| 10 | Feature freeze; PRs open; reviews |
| 11–12 | Bug fixes, merge A→B→C→D into dev |
| 13 | Sprint review demo + retro |
| 14 | Merge dev → main, tag `v0.1.0`, plan Sprint 2 |

---

## 10. Quick-Start Commands (after S1-A)

```bash
git clone <repo>
cd pirate-idle
npm install
npm run dev          # http://localhost:5173
npm run test         # vitest
npm run build        # production build
```

Branch flow example:
```bash
git checkout dev
git pull
git checkout -b feature/s1-core-state
# ... work ...
git push -u origin feature/s1-core-state
# open PR: feature/s1-core-state -> dev
```

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Merge conflicts on shared state | Contract-first types; one owner per file area |
| Scope creep in Sprint 1 | Strict DoD; "nice to have" goes to backlog |
| Idle math bugs (NaN, overflow) | Use BigInt or capped numbers; unit tests for tick |
| Save corruption | Schema versioning + migration + backup slot |
| Uneven workload | Daily standup; reassign tasks mid-sprint if blocked |

---

*Document version 1.0 — adjust as the team learns.*
