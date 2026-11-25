window.Game = window.Game || {};
const S = Game.state;
const A = Game.assets;
const api = Game.api;
const C = Game.C;

const places = [
  { name: "พระราชวัง", x: 784, y: 428, w: 34, h: 32 },
  { name: "หมู่บ้านใต้ปราสาท", x: 758, y: 462, w: 90, h: 34 },
  { name: "หมู่บ้านตะวันตก", x: 368, y: 352, w: 72, h: 28 },
  { name: "หมู่บ้านเหนือ", x: 708, y: 268, w: 64, h: 26 },
  { name: "หมู่บ้านตะวันออก", x: 1290, y: 492, w: 30, h: 20 },
  { name: "ถ้ำภูเขาเหนือ", x: 852, y: 122, w: 52, h: 28 },
  { name: "ถ้ำฝั่งขวา", x: 1088, y: 408, w: 48, h: 28 },
  { name: "ถ้ำตะวันออก", x: 1418, y: 452, w: 52, h: 28 },
  { name: "ถ้ำเกาะใต้", x: 792, y: 800, w: 48, h: 28 },
  { name: "หอคอยตะวันตก", x: 408, y: 588, w: 36, h: 26 },
  { name: "ซากปรักหักพัง", x: 1064, y: 606, w: 28, h: 24 }
];

function buildWorldMask() {
  if (!A.worldMap.complete || !A.worldMap.naturalWidth) return;
  const c = document.createElement("canvas");
  c.width = A.worldMap.width; c.height = A.worldMap.height;
  const g = c.getContext("2d", { willReadFrequently: true });
  g.drawImage(A.worldMap, 0, 0);
  const data = g.getImageData(0, 0, c.width, c.height).data;
  const kinds = new Uint8Array(c.width * c.height);
  const W = c.width, H = c.height;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const p = i * 4;
      const r = data[p], gg = data[p + 1], b = data[p + 2];
      let k = 0;
      if (b > 90 && b > r + 15 && b > gg + 5 && r < 140) k = 1;
      else if (gg > r + 18 && gg > 70 && r < 120 && b < gg) k = 3;
      else {
        const max = Math.max(r, gg, b), min = Math.min(r, gg, b);
        const rock = max - min < 36 && r > 90 && r < 190 && gg > 95 && b > 105 && b >= gg - 12;
        if (rock || (r < 70 && gg < 80 && b < 90 && max < 100)) k = 2;
      }
      kinds[i] = k;
    }
  }
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      if (kinds[i] !== 2) continue;
      let open = 0;
      if (kinds[i - 1] !== 2 && kinds[i - 1] !== 1) open++;
      if (kinds[i + 1] !== 2 && kinds[i + 1] !== 1) open++;
      if (kinds[i - W] !== 2 && kinds[i - W] !== 1) open++;
      if (kinds[i + W] !== 2 && kinds[i + W] !== 1) open++;
      if (open >= 3) kinds[i] = 0;
    }
  }
  S.worldMask = { w: W, h: H, kinds };
}
A.worldMap.onload = () => buildWorldMask();
if (A.worldMap.complete) buildWorldMask();

function groundKind(x, y) {
  if (!S.worldMask) return "walk";
  const ix = Math.max(0, Math.min(S.worldMask.w - 1, x | 0));
  const iy = Math.max(0, Math.min(S.worldMask.h - 1, y | 0));
  const k = S.worldMask.kinds[iy * S.worldMask.w + ix];
  return k === 1 ? "water" : k === 2 ? "mountain" : k === 3 ? "forest" : "walk";
}
function inPlace(x, y, pad) {
  const m = pad || 0;
  return places.find(p => x > p.x - m && x < p.x + p.w + m && y > p.y - m && y < p.y + p.h + m);
}
function feetBlocked(x, y) {
  const k = groundKind(x, y);
  return k === "water" || k === "mountain";
}
function showClosed(name) {
  document.getElementById("cityText").textContent = name + " ยังไม่สามารถเข้าไปข้างในได้";
  document.getElementById("cityToast").classList.remove("hidden");
  const back = S.player.dir === "up" ? [0, 16] : S.player.dir === "down" ? [0, -16] : S.player.dir === "left" ? [16, 0] : [-16, 0];
  S.player.x += back[0];
  S.player.y += back[1];
  S.mode = "city";
}
function stepWorld(dx, dy) {
  if (S.mode !== "world") return;
  if (S.area === "castleVillage") return api.stepTown(dx, dy);
  const nx = S.player.x + dx, ny = S.player.y + dy;
  if (nx < 12 || ny < 16 || nx > C.WORLD_W - 12 || ny > C.WORLD_H - 8) return;
  const place = inPlace(nx, ny, 0);
  if (place) {
    if (place.name === "หมู่บ้านใต้ปราสาท") return api.enterCastleVillage();
    return showClosed(place.name);
  }
  if (feetBlocked(nx, ny)) {
    if (!feetBlocked(S.player.x + dx, S.player.y)) S.player.x += dx;
    else if (!feetBlocked(S.player.x, S.player.y + dy)) S.player.y += dy;
    if (Math.abs(dy) >= Math.abs(dx)) S.player.dir = dy > 0 ? "down" : "up";
    else if (dx) S.player.dir = dx > 0 ? "right" : "left";
    return;
  }
  S.player.x = nx; S.player.y = ny;
  if (Math.abs(dy) >= Math.abs(dx)) S.player.dir = dy > 0 ? "down" : "up";
  else if (dx) S.player.dir = dx > 0 ? "right" : "left";
  if (dx) S.player.facing = dx > 0 ? 1 : -1;
  S.player.step++;
  const kind = groundKind(S.player.x, S.player.y);
  const rate = kind === "forest" ? 0.012 : 0.004;
  if (S.player.cool > 0) S.player.cool--;
  else if (Math.random() < rate) api.startBattle();
}
function updateWorldMove() {
  if (S.mode !== "world") return;
  let dx = 0, dy = 0;
  if (S.keys["ArrowUp"] || S.keys["w"] || S.keys["W"] || S.keys.padU) dy -= 1;
  if (S.keys["ArrowDown"] || S.keys["s"] || S.keys["S"] || S.keys.padD) dy += 1;
  if (S.keys["ArrowLeft"] || S.keys["a"] || S.keys["A"] || S.keys.padL) dx -= 1;
  if (S.keys["ArrowRight"] || S.keys["d"] || S.keys["D"] || S.keys.padR) dx += 1;
  if (!dx && !dy) { S.player.moving = false; return; }
  S.player.moving = true;
  const len = Math.hypot(dx, dy);
  const speed = S.area === "castleVillage" ? 2.4 : 1.45;
  stepWorld(dx / len * speed, dy / len * speed);
}

api.groundKind = groundKind;
api.showClosed = showClosed;
api.updateWorldMove = updateWorldMove;
