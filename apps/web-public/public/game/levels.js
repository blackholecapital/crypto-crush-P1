// Approved P3 level definitions, locked via game-contract V1.4.
export const LEVELS = [
  { levelId: 1, label: "Level 1", moves: 25, goals: { T_BTC: 20 } },
  { levelId: 2, label: "Level 2", moves: 22, goals: { T_ETH: 25 } },
  { levelId: 3, label: "Level 3", moves: 24, goals: { T_BTC: 20, T_ETH: 20 } },
  { levelId: 4, label: "Level 4", moves: 20, goals: { T_SUI: 30 } },
  { levelId: 5, label: "Level 5", moves: 22, goals: { T_BTC: 20, T_ETH: 20, T_SUI: 20 } },
];

export function getLevel(id) {
  return LEVELS.find((l) => l.levelId === id);
}
