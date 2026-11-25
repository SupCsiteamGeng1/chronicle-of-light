window.Game = window.Game || {};
const S = Game.state;
const A = Game.assets;
const api = Game.api;
const C = Game.C;


const PALETTE = [
  { name: "สไลม์เขียว", color: "#4cd06a", hp: 14, atk: 4 },
  { name: "สไลม์ฟ้า", color: "#4ca8e0", hp: 16, atk: 5 },
  { name: "สไลม์ชมพู", color: "#e878a8", hp: 12, atk: 6 }
];
function makeEncounter() {
  const n = api.randInt(1, 6);
  const lv = api.avgLevel();
  const enemies = [];
  for (let i = 0; i < n; i++) {
    const p = PALETTE[api.randInt(0, PALETTE.length - 1)];
    const hp = p.hp + Math.floor(lv * 1.4);
    enemies.push({
      name: p.name, color: p.color, maxHp: hp, hp,
      atk: p.atk + Math.floor(lv * 0.35),
      alive: true, shake: 0, winged: false, ranged: false,
      row: Math.floor(i / 2)
    });
  }
  return enemies;
}
api.makeEncounter = makeEncounter;
