window.Game = window.Game || {};
const S = Game.state;
const A = Game.assets;
const api = Game.api;
const C = Game.C;

const villageShops = [
  { name: "โรงแรม", x: 300, y: 585, w: 56, h: 40 },
  { name: "ร้านอาวุธ", x: 388, y: 362, w: 48, h: 36 },
  { name: "ร้านยา", x: 1052, y: 382, w: 52, h: 40 },
  { name: "ตลาด", x: 935, y: 570, w: 110, h: 55 },
  { name: "ร้านค้า", x: 1252, y: 600, w: 52, h: 40 },
  { name: "พระราชวัง", x: 752, y: 138, w: 56, h: 36 },
  { name: "บ้านบน", x: 1248, y: 198, w: 48, h: 32 },
  { name: "บ้านขวา", x: 1290, y: 430, w: 48, h: 32 }
];
const townNpcs = [
  { name: "ชายชาวบ้าน", sprite: "young_man", x: 680, y: 670, line: "สวัสดี นายท่าน วันนี้อากาศดีนะ" },
  { name: "หญิงชาวบ้าน", sprite: "young_woman", x: 420, y: 675, line: "สวัสดี นายท่าน โรงแรมอยู่ทางนี้" },
  { name: "ชายสูงอายุ", sprite: "old_man", x: 980, y: 675, line: "สวัสดี นายท่าน ระวังพวกสไลม์ในป่านะ" },
  { name: "หญิงสูงอายุ", sprite: "old_woman", x: 790, y: 340, line: "สวัสดี นายท่าน พระราชวังยังไม่เปิดรับคน" },
  { name: "ชายชาวบ้าน", sprite: "young_man", x: 1180, y: 675, line: "สวัสดี นายท่าน ร้านค้าอยู่ทางขวา" }
];

function buildTownMask() {
  if (!A.townMap.complete || !A.townMap.naturalWidth) return;
  const c = document.createElement("canvas");
  c.width = A.townMap.width; c.height = A.townMap.height;
  const g = c.getContext("2d", { willReadFrequently: true });
  g.drawImage(A.townMap, 0, 0);
  const kinds = new Uint8Array(c.width * c.height);
  const roads = [
    { x: 748, y: 125, w: 80, h: 250 },
    { x: 640, y: 400, w: 100, h: 100 },
    { x: 840, y: 400, w: 110, h: 100 },
    { x: 748, y: 455, w: 80, h: 70 },
    { x: 740, y: 500, w: 90, h: 160 },
    { x: 230, y: 652, w: 1220, h: 40 },
    { x: 820, y: 688, w: 110, h: 170 },
    { x: 1450, y: 560, w: 50, h: 100 },
    { x: 270, y: 640, w: 70, h: 160 },
    { x: 390, y: 350, w: 50, h: 310 },
    { x: 1060, y: 370, w: 50, h: 290 },
    { x: 1280, y: 420, w: 50, h: 240 },
    { x: 1240, y: 190, w: 60, h: 250 },
    { x: 310, y: 600, w: 40, h: 60 },
    { x: 760, y: 130, w: 50, h: 30 },
    { x: 1260, y: 590, w: 40, h: 70 }
  ];
  roads.forEach(s => {
    for (let y = s.y; y < s.y + s.h && y < c.height; y++) {
      for (let x = s.x; x < s.x + s.w && x < c.width; x++) {
        if (x > 0 && y > 0) kinds[y * c.width + x] = 2;
      }
    }
  });
  S.townMask = { w: c.width, h: c.height, kinds };
}
A.townMap.onload = () => buildTownMask();
if (A.townMap.complete) buildTownMask();

function onRoad(x, y) {
  if (!S.townMask) return false;
  const ix = Math.max(0, Math.min(S.townMask.w - 1, x | 0));
  const iy = Math.max(0, Math.min(S.townMask.h - 1, y | 0));
  return S.townMask.kinds[iy * S.townMask.w + ix] === 2;
}
function inShop(x, y) {
  return villageShops.find(s => x > s.x && x < s.x + s.w && y > s.y && y < s.y + s.h);
}
function showShopClosed(name) {
  document.getElementById("cityText").textContent = name + " ยังไม่เปิด";
  document.getElementById("cityToast").classList.remove("hidden");
  const back = S.player.dir === "up" ? [0, 20] : S.player.dir === "down" ? [0, -20] : S.player.dir === "left" ? [20, 0] : [-20, 0];
  const nx = S.player.x + back[0], ny = S.player.y + back[1];
  if (onRoad(nx, ny)) { S.player.x = nx; S.player.y = ny; }
  S.keys["z"] = S.keys["Z"] = S.keys["Enter"] = false;
  S.mode = "city";
}
function nearNpc(x, y) {
  return townNpcs.find(n => Math.hypot(x - n.x, y - n.y) < 42);
}
function openTalk(npc) {
  document.getElementById("talkName").textContent = npc.name;
  document.getElementById("talkText").textContent = npc.line || "สวัสดี นายท่าน";
  document.getElementById("talkBox").classList.remove("hidden");
  S.mode = "talk";
}
function closeTalk() {
  document.getElementById("talkBox").classList.add("hidden");
  S.mode = "world";
}
function enterCastleVillage() {
  S.returnPos = { x: S.player.x, y: S.player.y };
  S.area = "castleVillage";
  S.player.x = 860;
  S.player.y = 745;
  S.player.facing = 0;
}
function exitCastleVillage() {
  S.area = "world";
  S.player.x = S.returnPos.x;
  S.player.y = S.returnPos.y;
}
function stepTown(dx, dy) {
  const nx = S.player.x + dx, ny = S.player.y + dy;
  if (nx < 16 || ny < 16 || nx > C.VILLAGE_W - 16 || ny > C.VILLAGE_H - 12) return;
  const shop = inShop(nx, ny);
  if (shop) return showShopClosed(shop.name);
  if (townNpcs.some(n => Math.hypot(nx - n.x, ny - n.y) < 18)) return;
  if (ny >= 835 && nx >= 815 && nx <= 960) return exitCastleVillage();
  if (!onRoad(nx, ny)) {
    if (onRoad(S.player.x + dx, S.player.y)) S.player.x += dx;
    else if (onRoad(S.player.x, S.player.y + dy)) S.player.y += dy;
    return;
  }
  S.player.x = nx; S.player.y = ny;
  if (Math.abs(dy) >= Math.abs(dx)) S.player.dir = dy > 0 ? "down" : "up";
  else S.player.dir = dx > 0 ? "right" : "left";
  if (dx) S.player.facing = dx > 0 ? 1 : -1;
  S.player.step++;
}

api.townNpcs = townNpcs;
api.nearNpc = nearNpc;
api.openTalk = openTalk;
api.closeTalk = closeTalk;
api.enterCastleVillage = enterCastleVillage;
api.exitCastleVillage = exitCastleVillage;
api.stepTown = stepTown;
api.showShopClosed = showShopClosed;
