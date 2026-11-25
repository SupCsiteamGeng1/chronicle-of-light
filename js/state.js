window.Game = window.Game || {};

Game.C = {
  MAX_LV: 99,
  WORLD_W: 1536,
  WORLD_H: 1024,
  VIEW_PX_W: 400,
  VIEW_PX_H: 300,
  WORLD_VIEW_W: 250,
  WORLD_VIEW_H: 188,
  VILLAGE_W: 1536,
  VILLAGE_H: 864
};

Game.state = {
  mode: "title",
  area: "world",
  returnPos: { x: 802, y: 532 },
  player: { x: 802, y: 512, facing: 0, dir: "down", moving: false, step: 0, cool: 4 },
  keys: {},
  party: [
    { id: "warrior", name: "อัลเดน", job: "อัศวิน", level: 1, exp: 0, str: 12, vit: 11, agi: 6, int: 3, luk: 5, color: "#3a6ad8", hat: "#c8d0e0" },
    { id: "monk", name: "ริกะ", job: "นักสู้", level: 1, exp: 0, str: 11, vit: 9, agi: 10, int: 3, luk: 6, color: "#d87838", hat: "#f0d0a0" },
    { id: "white", name: "เซรา", job: "นักบวช", level: 1, exp: 0, str: 4, vit: 7, agi: 6, int: 12, luk: 8, color: "#f0f0e4", hat: "#fff8dc" },
    { id: "black", name: "โนคท์", job: "จอมเวท", level: 1, exp: 0, str: 3, vit: 5, agi: 7, int: 13, luk: 7, color: "#2a2a88", hat: "#f0d040" }
  ],
  potions: 3,
  battle: null,
  pendingLevelLogs: [],
  battleAnimT: 0,
  worldMask: null,
  townMask: null
};

Game.api = {
  randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); },
  setMode(mode) { Game.state.mode = mode; },
  avgLevel() {
    const party = Game.state.party;
    return Math.round(party.reduce((s, p) => s + p.level, 0) / party.length);
  }
};
