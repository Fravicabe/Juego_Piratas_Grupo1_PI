# ✅ Plan de Calidad — Pirate Idle

Plan de calidad adaptado al equipo (4 alumnos de 2º DAW), Scrum de 4 sprints.
Cubre **tests**, **revisión de código** y **gates de calidad** sin sobrecargar.

---

## 1. Objetivos de calidad (Definition of Done — actualizado)

Una tarea está "Done" solo si:
- [ ] El código compila (`npm run build`).
- [ ] `npm run lint` pasa (ESLint).
- [ ] `npm run test` pasa (Vitest).
- [ ] La lógica nueva tiene tests unitarios (ver objetivos de cobertura).
- [ ] Revisada por **al menos 1 compañero** (ver proceso de review).
- [ ] Fusionada a `dev` y la app arranca (`npm run dev`).
- [ ] Sin `console.log` ni código muerto.

---

## 2. Estrategia de tests

### Herramientas
- **Vitest** (tests unitarios y de componentes) — ya configurado.
- **Testing Library** (componentes React) — instalado.
- **Cobertura**: `vitest --coverage` (añadir `@vitest/coverage-v8`).

### Qué testear (por área)

| Área (Dev) | Qué testear | Ejemplo |
|---|---|---|
| **Core (Alexis)** | Funciones puras: matemática del tick, curva de XP, round-trip guardado/carga, cap de progreso offline | `accumulateTicks(0, 5000, 1000) === 5` |
| **Gameplay (Bryton)** | Tiempo de viaje, tasas de recolección, acumulación de recursos | `travelTime(isla, barco) > 0` |
| **UI (Francisco)** | Renderizado de componentes, props, interacciones | Click en botón dispara callback |
| **Infra (Javier)** | Archivos de config válidos, scripts ejecutables | `npm run build` en CI |

### Objetivos de cobertura (realistas para alumnos)

| Sprint | Objetivo | Foco |
|---|---|---|
| S1 | ≥ 60% en `core/` y `features/` | Tick, guardado/carga, viaje, XP |
| S2 | ≥ 70% en `core/` + lógica de combate/economía | Daño, cálculo de precios |
| S3 | ≥ 70% global + matemática de prestigio | Catch-up offline, reset de prestigio |
| S4 | ≥ 75% global + tests de regresión | Cada bug → test |

### Convención de archivos de test
```
tests/
├── core/        # Alexis
├── features/    # Bryton
└── ui/          # Francisco
```
Un archivo de test por archivo de código: `foo.ts` → `foo.test.ts`.

---

## 3. Proceso de revisión de código (sin PRs)

Como trabajamos sin Pull Requests, usamos **revisión por compañero (buddy review)**.

### Parejas de revisión (rotan cada sprint)
| Sprint | Revisor → Autor |
|---|---|
| S1 | Javier ↔ Alexis, Francisco ↔ Bryton |
| S2 | Javier ↔ Francisco, Alexis ↔ Bryton |
| S3 | Javier ↔ Bryton, Alexis ↔ Francisco |
| S4 | Revisión cruzada (todos revisan a todos) |

### Checklist de revisión (5 min por tarea)
Antes de fusionar una rama a `dev`, el compañero verifica:
1. **Compila y arranca**: `npm run build` + `npm run dev` (prueba manual rápida).
2. **Lint y tests**: `npm run lint && npm run test`.
3. **Legibilidad**: nombres claros, sin números mágicos, comentarios en lógica compleja.
4. **Sin secretos / valores hardcodeados** (usar `src/data/*.json`).
5. **Seguridad del estado**: sin mutación directa del store; usar acciones.
6. **Tests añadidos** para la lógica nueva.

### Cómo revisar sin PRs
```bash
# El revisor trae la rama feature y prueba en local
git fetch origin
git checkout feature/s1-core-state
npm install && npm run build && npm run test
# Si todo OK:
git checkout dev && git merge feature/s1-core-state
git push origin dev
```
Los comentarios se dejan en el chat (o en un `REVIEW.md` en la rama) — no hace falta formalidad.

---

## 4. Herramientas de calidad a añadir

| Herramienta | Responsable | Sprint | Propósito |
|---|---|---|---|
| ESLint + Prettier | Javier | S1 | Consistencia de estilo |
| Cobertura Vitest | Alexis | S1 | Medir cobertura de tests |
| TypeScript strict | Todos | S1 | Detectar errores de tipo en compilación |
| Codecov (opcional) | Javier | S2 | Badge de cobertura en el README |
| Protección de rama en `main` | Javier | S2 | Evitar pushes directos a `main` |
| Lighthouse (manual) | Francisco | S3 | Auditoría de accesibilidad/rendimiento de la UI |

### Protección de rama (recomendado desde Sprint 2)
GitHub → Settings → Branches → Add rule para `main`:
- Require status checks to pass (build + test).
- Require 1 review before merge (aunque sea informal, crea el hábito).
- No force pushes.

---

## 5. Plan de calidad sprint a sprint

### Sprint 1 — Fundamentos
- **Alexis**: tests de matemática del tick, round-trip de guardado/carga.
- **Bryton**: tests de tiempo de viaje y curva de XP.
- **Francisco**: tests de humo de componentes (Home, Map renderizan).
- **Javier**: verificar que los scripts de build/lint funcionan; añadir Prettier.
- **Pregunta de retro**: "¿Testeamos suficiente? ¿Qué se rompió al fusionar?"

### Sprint 2 — Combate y economía
- **Alexis**: tests de fórmula de daño y varianza de precios.
- **Bryton**: tests de subida de nivel de habilidades.
- **Francisco**: tests de validación de formularios/inputs.
- **Javier**: configurar protección de rama en `main`.
- **Nuevo**: añadir script `npm run test:coverage`.

### Sprint 3 — Contenido y prestigio
- **Todos**: tests de reset de prestigio (el estado se reinicia salvo bonificadores permanentes).
- **Bryton**: tests de catch-up offline (cap a 8h).
- **Francisco**: revisión manual de layout responsive (768px).
- **Pregunta de retro**: "¿Hubo regresiones por el nuevo contenido?"

### Sprint 4 — Pulido y release
- **Todos**: bug bash — cada dev encuentra 3 bugs, arregla 1 y escribe un test de regresión.
- **Alexis**: empuje final de cobertura hasta 75%.
- **Francisco**: auditoría Lighthouse (accesibilidad ≥ 80).
- **Javier**: verificación final de build + deploy; tag `v1.0.0`.

---

## 6. Seguimiento de bugs y regresiones

- Cada bug encontrado → crear Issue en GitHub con label `bug` + prioridad.
- Fix → el mensaje de commit referencia el issue: `fix: NaN en tiempo de viaje (#12)`.
- **Siempre añadir un test** que reproduzca el bug antes de arreglarlo (test de regresión).
- Mantener carpeta `tests/regression/` para estos tests.

---

## 7. Métricas de retro (seguir cada sprint)

| Métrica | Cómo medirla |
|---|---|
| Tests escritos | Conteo de commits `test:` en `git log` |
| Cobertura % | `npm run test:coverage` |
| Bugs encontrados / arreglados | Issues cerrados con label `bug` |
| Conflictos de merge | Conteo durante el sprint (intentar reducir) |
| Builds rotos en `dev` | Conteo de ejecuciones de CI en rojo |

### Plantilla de retro (15 min, último día del sprint)
1. ¿Qué fue bien? (1 cosa por persona)
2. ¿Qué no fue bien? (1 cosa)
3. ¿Qué cambiaremos el próximo sprint? (1 acción, asignada a alguien)

---

## 8. Comandos de calidad (añadir a package.json)

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "lint": "eslint . --ext .ts,.tsx",
  "format": "prettier --write .",
  "check": "npm run lint && npm run test && npm run build"
}
```

Cada dev ejecuta `npm run check` antes de fusionar a `dev`.

---

### Resumen para el profesor
- **Tests**: tests unitarios con Vitest por módulo, objetivos de cobertura del 60% al 75%.
- **Revisión**: buddy review con checklist de 5 puntos, parejas rotativas cada sprint.
- **Gates de calidad**: lint + tests + build deben pasar antes de fusionar; protección de rama en `main`.
- **Seguimiento**: Issues de GitHub para bugs, métricas de retro cada sprint.
