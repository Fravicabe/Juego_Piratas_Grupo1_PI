# 📋 Issues del Sprint 1 — Pirate Idle

Lista de issues para crear en GitHub (uno por tarea). Cada issue se asigna a un dev.
Etiquetas sugeridas: `feature`, `sprint-1`, más el área (`core`, `ui`, `data`, `chore`).
Milestone: `Sprint 1`.

> Nota: somos alumnos de 2º DAW. Las tareas están ajustadas a nuestro nivel:
> sin CI/CD complejo, sin PR obligatorios, código claro y comentado.

---

## Javier — Infraestructura / Configuración (S1-A)

### Issue 1: Configurar el proyecto base con Vite + React + TypeScript
**Asignado:** @Javier
**Labels:** `chore`, `sprint-1`
**Descripción:**
Configurar el proyecto inicial para que todos podamos trabajar.
- Crear proyecto con Vite + React + TypeScript.
- Instalar dependencias: react-router-dom, zustand, tailwindcss.
- Configurar Tailwind (colores pirata: madera, oro, pergamino, mar).
- Crear estructura de carpetas: `src/core`, `src/data`, `src/features`, `src/ui`, `tests`.
- Configurar scripts en `package.json`: `dev`, `build`, `test`, `lint`.
- Crear `README.md` con instrucciones de instalación y ejecución.

**Criterios de aceptación:**
- `npm install && npm run dev` abre la app en el navegador.
- `npm run build` termina sin errores.
- La estructura de carpetas existe y está documentada.

### Issue 2: Configurar ESLint y Prettier
**Asignado:** @Javier
**Labels:** `chore`, `sprint-1`
**Descripción:**
Añadir linting y formato para mantener el código consistente entre los 4.
- Instalar ESLint + Prettier.
- Crear configuración básica (flat config).
- Añadir scripts `lint` y `format`.
- Documentar en el README cómo ejecutarlos.

**Criterios de aceptación:**
- `npm run lint` pasa sin errores en el código inicial.
- `npm run format` formatea los archivos.

### Issue 3 (Opcional/Bonus): GitHub Actions básico
**Asignado:** @Javier
**Labels:** `chore`, `sprint-1`, `bonus`
**Descripción:**
Crear un workflow simple que ejecute `npm install`, `npm run lint` y `npm run build` en cada push a `dev`.
- Archivo `.github/workflows/ci.yml`.
- Requiere token de GitHub con scope `workflow`.

**Criterios de aceptación:**
- El workflow aparece en la pestaña Actions de GitHub.
- Se ejecuta al hacer push a `dev`.

---

## Alexis — Motor del juego / Core (S1-B)

### Issue 4: Definir los tipos compartidos del juego
**Asignado:** @Alexis
**Labels:** `core`, `sprint-1`
**Descripción:**
Crear el archivo `src/core/types.ts` con las interfaces que usará todo el equipo.
Incluye: `Resource`, `Skill`, `Ship`, `CrewMember`, `Island`, `Inventory`, `Player`, `GameState`.
- Comentar cada interfaz para que el resto del equipo las entienda.
- Compartir con el equipo antes de que nadie empiece a codear (sesión de contrato).

**Criterios de aceptación:**
- El archivo compila sin errores.
- Francisco y Bryton pueden importar los tipos sin problemas.

### Issue 5: Crear el store global del estado del juego
**Asignado:** @Alexis
**Labels:** `core`, `sprint-1`
**Descripción:**
Implementar el estado global usando Zustand.
- Estado inicial: jugador, barco, tripulación, habilidades, islas, inventario, oro.
- Acciones básicas: `setDestination`, `arrive`, `gather`, `addXp`.
- Exportar el hook `useGameStore`.

**Criterios de aceptación:**
- El store se puede importar desde cualquier componente.
- Los valores iniciales son coherentes.

### Issue 6: Implementar el tick loop y guardado/carga
**Asignado:** @Alexis
**Labels:** `core`, `sprint-1`
**Descripción:**
- Tick loop con `setInterval` cada 1 segundo que actualiza el estado.
- Guardado automático en `localStorage` cada 10 segundos y al cerrar la pestaña.
- Carga del guardado al iniciar la app.
- Cálculo de progreso offline: al volver, otorgar el progreso de las horas ausentes (máx. 8h).

**Criterios de aceptación:**
- Al recargar la página, el progreso se mantiene.
- Si cierro y abro después de 1 minuto, gano ~1 minuto de progreso.
- Función `clearSave()` para reiniciar.

### Issue 7: Tests básicos del core
**Asignado:** @Alexis
**Labels:** `core`, `sprint-1`, `tests`
**Descripción:**
Escribir tests con Vitest para:
- Cálculo de tiempo transcurrido (`accumulateTicks`).
- Que el guardado/carga sea un round-trip (guardar y cargar devuelve lo mismo).

**Criterios de aceptación:**
- `npm run test` pasa.
- Al menos 3 tests en `tests/core/`.

---

## Francisco — UI / Frontend (S1-C)

### Issue 8: Crear el layout principal y la navegación
**Asignado:** @Francisco
**Labels:** `ui`, `sprint-1`
**Descripción:**
- Barra superior: oro, rango, botón de ajustes.
- Sidebar con enlaces: Home, Mapa, Habilidades, Tripulación, Barco, Ajustes.
- Área principal de contenido.
- Usar React Router para las rutas.
- Tema pirata con Tailwind (colores madera/ oro/ pergamino).

**Criterios de aceptación:**
- Las 6 páginas son accesibles desde el sidebar.
- La navegación cambia la URL.
- Se ve bien en pantallas de 768px o más.

### Issue 9: Crear componentes reutilizables
**Asignado:** @Francisco
**Labels:** `ui`, `sprint-1`
**Descripción:**
Componentes básicos para usar en toda la app:
- `ResourceBar` (icono + cantidad).
- `ProgressBar` (barra de progreso con porcentaje).
- `Card` (contenedor con borde).
- `Button` (variantes: primario, secundario).
- `Modal` (ventana emergente).

**Criterios de aceptación:**
- Cada componente acepta props y se renderiza correctamente.
- Hay una página de ejemplo (Home) que los usa.

### Issue 10: Conectar la UI con el store
**Asignado:** @Francisco
**Labels:** `ui`, `sprint-1`
**Descripción:**
- Leer valores del store (oro, rango) en la barra superior.
- Mostrar el estado actual en la página Home (isla actual, actividad en curso).
- Botones que disparan acciones del store (via props/callbacks).

**Criterios de aceptación:**
- La UI refleja cambios del estado en tiempo real.
- No hay errores en consola.

---

## Bryton — Gameplay / Contenido (S1-D)

### Issue 11: Crear los archivos de datos (islas, recursos, habilidades)
**Asignado:** @Bryton
**Labels:** `data`, `sprint-1`
**Descripción:**
Crear JSON en `src/data/`:
- `islands.json`: 3 islas (Tortuga, Nassau, Isla Calavera) con recursos y tiempo de viaje.
- `resources.json`: madera, hierro, comida, oro con icono.
- `skills.json`: navegación y recolección con nivel y XP.

**Criterios de aceptación:**
- Los JSON son válidos (se pueden importar con `resolveJsonModule`).
- Los datos tienen sentido (nombres, valores razonables).

### Issue 12: Implementar el sistema de navegación (vela)
**Asignado:** @Bryton
**Labels:** `data`, `sprint-1`, `gameplay`
**Descripción:**
- Seleccionar isla destino desde la UI.
- Calcular tiempo de viaje según velocidad del barco.
- Mostrar cuenta atrás del viaje.
- Al llegar, actualizar la isla actual y desbloquear recursos.

**Criterios de aceptación:**
- Se puede viajar de una isla a otra.
- Se muestra el tiempo restante.
- Al llegar, cambia la isla actual.

### Issue 13: Implementar la recolección de recursos y XP de habilidades
**Asignado:** @Bryton
**Labels:** `data`, `sprint-1`, `gameplay`
**Descripción:**
- Mientras estás en una isla, se recolectan sus recursos automáticamente cada segundo.
- La cantidad depende del nivel de la habilidad de recolección.
- Ganar XP por recolectar; subir de nivel aumenta la tasa.
- Mostrar tasas en la página Home.

**Criterios de aceptación:**
- Los recursos aumentan mientras estás en una isla.
- La XP de la habilidad aumenta.
- Las tasas se muestran en la UI.

### Issue 14: Tests básicos de gameplay
**Asignado:** @Bryton
**Labels:** `data`, `sprint-1`, `tests`
**Descripción:**
Tests con Vitest para:
- Cálculo del tiempo de viaje.
- Curva de XP (nivel a partir de XP).

**Criterios de aceptación:**
- `npm run test` pasa.
- Al menos 2 tests en `tests/features/`.

---

## Orden de trabajo sugerido (sin PR)

1. **Javier** primero configura el proyecto (Issue 1 y 2). El resto espera a que exista la base.
2. **Alexis** crea los tipos (Issue 4) y los comparte. Todos revisan.
3. **Francisco** y **Bryton** trabajan en paralelo usando los tipos de Alexis.
4. Integración final: cada uno hace `git merge` de su rama a `dev` y resuelve conflictos.
5. Probar todo junto con `npm run dev`.

## Comandos para cada dev

```bash
git checkout dev
git pull origin dev
git checkout -b feature/s1-<tu-tarea>
# ... trabajar ...
git add -A
git commit -m "feat: <descripcion corta>"
git checkout dev
git merge feature/s1-<tu-tarea>
git push origin dev
```
