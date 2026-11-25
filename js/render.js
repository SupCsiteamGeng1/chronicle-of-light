window.Game = window.Game || {};
const S = Game.state;
const A = Game.assets;
const api = Game.api;
const C = Game.C;
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
const bcanvas = document.getElementById("battle");
const bctx = bcanvas.getContext("2d");
bctx.imageSmoothingEnabled = false;

  function drawLeader(sx, sy, scale) {
    const g = ctx;
    const s = scale || 1;
    const dir = S.player.dir || "down";
    const moving = S.player.moving;
    const tick = Math.floor(performance.now() / 160);
    let img = null;
    if (dir === "down") {
      img = A.overworldFront[moving ? tick % A.overworldFront.length : 0];
    } else if (dir === "up") {
      img = A.overworldBack[moving ? tick % A.overworldBack.length : 0];
    } else {
      img = A.overworldSide[moving ? tick % A.overworldSide.length : 0];
    }
    if (img && img.complete && img.naturalWidth) {
      const h = Math.round(26 * s);
      const w = Math.round(h * (img.width / img.height));
      const dx = Math.round(sx - w / 2);
      const dy = Math.round(sy - h);
      g.imageSmoothingEnabled = false;
      if (dir === "right") {
        g.save();
        g.translate(dx + w, dy);
        g.scale(-1, 1);
        g.drawImage(img, 0, 0, w, h);
        g.restore();
      } else {
        g.drawImage(img, dx, dy, w, h);
      }
    } else {
      g.fillStyle = "#3a6ad8";
      g.fillRect(sx - 6 * s, sy - 18 * s, 12 * s, 18 * s);
    }
  }
  function camera() {
    return {
      x: Math.max(0, Math.min(C.WORLD_W - C.WORLD_VIEW_W, S.player.x - C.WORLD_VIEW_W / 2)),
      y: Math.max(0, Math.min(C.WORLD_H - C.WORLD_VIEW_H, S.player.y - C.WORLD_VIEW_H / 2))
    };
  }
  function drawWorld() {
    const cam = camera();
    const s = canvas.width / C.WORLD_VIEW_W;
    ctx.imageSmoothingEnabled = false;
    if (A.worldMap.complete && A.worldMap.naturalWidth) {
      ctx.drawImage(A.worldMap, cam.x, cam.y, C.WORLD_VIEW_W, C.WORLD_VIEW_H, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = "#3e9440";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    const inForest = api.groundKind(S.player.x, S.player.y) === "forest";
    drawLeader((S.player.x - cam.x) * s, (S.player.y - cam.y) * s, s);
    if (inForest) {
      const lx = (S.player.x - cam.x) * s;
      const ly = (S.player.y - cam.y) * s;
      ctx.fillStyle = "rgba(30, 90, 28, 0.55)";
      ctx.beginPath();
      ctx.arc(lx, ly - 16 * s, 14 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(46, 120, 40, 0.4)";
      ctx.beginPath();
      ctx.arc(lx - 8 * s, ly - 8 * s, 10 * s, 0, Math.PI * 2);
      ctx.arc(lx + 8 * s, ly - 10 * s, 10 * s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(8,8,16,0.55)"; ctx.fillRect(8, 8, 280, 28);
    ctx.strokeStyle = "#d8d0a8"; ctx.strokeRect(8, 8, 280, 28);
    ctx.fillStyle = "#f4eedc"; ctx.font = "13px 'Noto Sans Thai', sans-serif";
    ctx.fillText("ทวีปแสงแรก  ·  เมืองกลางยังปิด", 16, 27);
  }
  function drawVillage() {
    const camX = Math.max(0, Math.min(C.VILLAGE_W - C.VIEW_PX_W, S.player.x - C.VIEW_PX_W / 2));
    const camY = Math.max(0, Math.min(C.VILLAGE_H - C.VIEW_PX_H, S.player.y - C.VIEW_PX_H / 2));
    const s = canvas.width / C.VIEW_PX_W;
    const g = ctx;
    g.imageSmoothingEnabled = false;
    if (A.townMap.complete && A.townMap.naturalWidth) {
      g.drawImage(A.townMap, camX, camY, C.VIEW_PX_W, C.VIEW_PX_H, 0, 0, canvas.width, canvas.height);
    } else {
      g.fillStyle = "#5aaa4a";
      g.fillRect(0, 0, canvas.width, canvas.height);
    }
    api.townNpcs.forEach(n => {
      const set = A.npc[n.sprite];
      const img = set && set[Math.floor(performance.now() / 220) % set.length];
      if (!img || !img.complete || !img.naturalWidth) return;
      const h = Math.round(26 * s * 1.8);
      const w = Math.round(h * (img.width / img.height));
      g.drawImage(img, Math.round((n.x - camX) * s - w / 2), Math.round((n.y - camY) * s - h), w, h);
    });
    drawLeader((S.player.x - camX) * s, (S.player.y - camY) * s, s * 1.8);
    g.fillStyle = "rgba(8,8,16,0.55)"; g.fillRect(8, 8, 300, 28);
    g.strokeStyle = "#d8d0a8"; g.strokeRect(8, 8, 300, 28);
    g.fillStyle = "#f4eedc"; g.font = "13px 'Noto Sans Thai', sans-serif";
    g.fillText("หมู่บ้านใต้ปราสาท  ·  เดินลงบันไดเพื่อออก", 16, 27);
  }
  function drawSlime(g, x, y, color, scale, shake) {
    const s = scale || 1;
    const ox = shake ? (Math.random() * 4 - 2) : 0;
    g.fillStyle = "rgba(0,0,0,.25)";
    g.beginPath(); g.ellipse(x + ox, y + 18 * s, 16 * s, 5 * s, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = color;
    g.beginPath(); g.ellipse(x + ox, y, 18 * s, 16 * s, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,255,255,.35)";
    g.beginPath(); g.ellipse(x - 6 * s + ox, y - 6 * s, 6 * s, 4 * s, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#1a1020";
    g.beginPath(); g.ellipse(x - 5 * s + ox, y - 1 * s, 2.2 * s, 3 * s, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(x + 6 * s + ox, y - 1 * s, 2.2 * s, 3 * s, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#fff";
    g.fillRect(x - 6 * s + ox, y - 3 * s, 2, 2);
    g.fillRect(x + 5 * s + ox, y - 3 * s, 2, 2);
  }
  function drawBattler(g, p, x, baseY, active) {
    const frames = A.battle[p.id];
    const frame = Math.floor(S.battleAnimT / 180) % 4;
    const img = frames && frames[frame] && frames[frame].complete && frames[frame].naturalWidth ? frames[frame] : null;
    if (p.hp <= 0) g.globalAlpha = 0.35;
    if (img) {
      const h = 74;
      const w = h * (img.width / img.height);
      const dx = Math.round(x - w / 2);
      const dy = Math.round(baseY - h);
      g.fillStyle = "rgba(0,0,0,.32)";
      g.beginPath();
      g.ellipse(x, baseY - 3, w * 0.28, 5, 0, 0, Math.PI * 2);
      g.fill();
      g.imageSmoothingEnabled = false;
      g.drawImage(img, dx, dy, w, h);
      if (active) {
        g.fillStyle = "#e6c86a";
        g.beginPath();
        g.moveTo(x - 6, dy - 8);
        g.lineTo(x + 6, dy - 8);
        g.lineTo(x, dy - 2);
        g.closePath();
        g.fill();
      }
    } else {
      g.fillStyle = p.color;
      g.fillRect(x - 8, baseY - 36, 16, 28);
      g.fillStyle = "#f0d0a0";
      g.fillRect(x - 6, baseY - 46, 12, 12);
    }
    g.globalAlpha = 1;
  }
  function drawBattleScene() {
    S.battleAnimT = performance.now();
    const g = bctx;
    if (A.battleBg.complete && A.battleBg.naturalWidth) {
      g.drawImage(A.battleBg, 0, 0, bcanvas.width, bcanvas.height);
    } else {
      g.fillStyle = "#4aa3e8"; g.fillRect(0, 0, bcanvas.width, 140);
      g.fillStyle = "#e2b36a"; g.fillRect(0, 140, bcanvas.width, bcanvas.height);
    }
    if (!S.battle) return;
    S.battle.enemies.forEach((e, i) => {
      if (e.hp <= 0) return;
      const pos = api.enemyPos(i);
      if (e.shake > 0) e.shake--;
      drawSlime(g, pos.x, pos.y, e.color, 1, e.shake > 0);
    });
    const drawOrder = [0, 2, 1, 3];
    drawOrder.forEach(i => {
      const p = S.party[i];
      const s = api.partyPos(i);
      drawBattler(g, p, s.x, s.y, S.battle.phase === "pick" && S.battle.actor === i);
    });
    drawBattleFx(g);
  }

  function drawBattleFx(g) {
    if (!S.battle || !S.battle.fx) return;
    S.battle.fx = S.battle.fx.filter(fx => fx.age < fx.life);
    for (const fx of S.battle.fx) {
      fx.age++;
      const a = Math.max(0, 1 - fx.age / fx.life);
      g.save();
      g.globalAlpha = a;
      if (fx.kind === "slash") {
        g.translate(fx.x, fx.y - 6);
        g.rotate(-0.7);
        g.strokeStyle = "#fffef0";
        g.lineWidth = 12;
        g.lineCap = "round";
        g.beginPath(); g.moveTo(-40, 0); g.lineTo(40, 0); g.stroke();
        g.strokeStyle = "#e6c86a";
        g.lineWidth = 5;
        g.beginPath(); g.moveTo(-40, 0); g.lineTo(40, 0); g.stroke();
      } else if (fx.kind === "fire") {
        g.fillStyle = "#ff5a1a";
        g.beginPath(); g.arc(fx.x, fx.y, 22 + fx.age * 0.4, 0, Math.PI * 2); g.fill();
        g.fillStyle = "#ffd24a";
        g.beginPath(); g.arc(fx.x - 4, fx.y - 6, 12, 0, Math.PI * 2); g.fill();
        g.fillStyle = "#fff6c8";
        g.beginPath(); g.arc(fx.x + 2, fx.y - 2, 6, 0, Math.PI * 2); g.fill();
      } else if (fx.kind === "ice") {
        g.strokeStyle = "#bfefff";
        g.lineWidth = 4;
        for (let i = 0; i < 6; i++) {
          const ang = i * Math.PI / 3;
          g.beginPath();
          g.moveTo(fx.x, fx.y);
          g.lineTo(fx.x + Math.cos(ang) * 26, fx.y + Math.sin(ang) * 26);
          g.stroke();
        }
        g.fillStyle = "#e8fbff";
        g.fillRect(fx.x - 6, fx.y - 18, 12, 36);
      }
      g.restore();
    }
  }

  function updateHud() {
    const kind = api.groundKind(S.player.x, S.player.y);
    const label = kind === "forest" ? "ป่า" : kind === "water" ? "น้ำ" : kind === "mountain" ? "ภูเขา" : "หญ้า";
    document.getElementById("pos").textContent = `${Math.round(S.player.x)}, ${Math.round(S.player.y)}`;
    document.getElementById("tileName").textContent = label;
    document.getElementById("rate").textContent = (kind === "forest" ? "1.2" : "0.4") + "%";
    document.getElementById("avgLv").textContent = String(api.avgLevel());
  }

api.drawWorld = drawWorld;
api.drawVillage = drawVillage;
api.drawBattleScene = drawBattleScene;
api.updateHud = updateHud;
api.drawBattleFx = drawBattleFx;
