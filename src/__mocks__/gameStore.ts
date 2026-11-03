// Mock del store global hasta que Alexis termine el core
export const mockGameState = {
  version: 1,
  player: { name: "Capitán Fravicabe", rank: "Grumete", gold: 150 },
  ship: { id: "starter", name: "La Gaviota", speed: 1, cargo: 50, hull: 100, maxHull: 100 },
  crew: [],
  skills: {
    sailing: { id: "sailing", name: "Navegación", level: 1, xp: 0, xpToNext: 10 },
    gathering: { id: "gathering", name: "Recolección", level: 1, xp: 0, xpToNext: 10 },
  },
  islands: {
    tortuga: { id: "tortuga", name: "Tortuga", description: "Puerto pirata.", resources: ["wood","food" as const], travelTimeBase: 0, unlocked: true },
    nassau: { id: "nassau", name: "Nassau", description: "Comercio.", resources: ["iron","gold" as const], travelTimeBase: 60, unlocked: true },
  },
  discoveredIslands: ["tortuga", "nassau"],
  currentIslandId: "tortuga",
  destinationIslandId: null,
  travelEta: 0,
  inventory: { wood: 10, iron: 3, food: 20, gold: 150 },
  lastTick: Date.now(),
  totalPlaytime: 0,
};
