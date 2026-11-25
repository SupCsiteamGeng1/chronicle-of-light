window.Game = window.Game || {};
const S = Game.state;
const api = Game.api;

function loop() {
  api.updateWorldMove();
  if (S.mode === "world" || S.mode === "title" || S.mode === "city" || S.mode === "status" || S.mode === "levelup" || S.mode === "talk") {
    if (S.area === "castleVillage") api.drawVillage();
    else api.drawWorld();
  }
  if (S.mode === "battle") {
    S.battleAnimT = performance.now();
    api.drawBattleScene();
  }
  api.updateHud();
  requestAnimationFrame(loop);
}

document.getElementById("btnStart").onclick = () => {
  api.ui.hideTitle();
  S.mode = "world";
};
document.getElementById("btnCityOk").onclick = () => api.ui.closeCity();
document.getElementById("btnTalkOk").onclick = () => api.closeTalk();
document.getElementById("btnLevelOk").onclick = () => api.endBattle();
document.getElementById("btnStatusOk").onclick = () => toggleStatus();
document.getElementById("btnC").onclick = () => toggleStatus();

document.querySelectorAll(".dpad button").forEach(btn => {
  const set = (on) => {
    if (+btn.dataset.dy < 0) S.keys.padU = on;
    if (+btn.dataset.dy > 0) S.keys.padD = on;
    if (+btn.dataset.dx < 0) S.keys.padL = on;
    if (+btn.dataset.dx > 0) S.keys.padR = on;
  };
  btn.addEventListener("pointerdown", (e) => { e.preventDefault(); set(true); });
  btn.addEventListener("pointerup", () => set(false));
  btn.addEventListener("pointerleave", () => set(false));
  btn.addEventListener("pointercancel", () => set(false));
});

document.getElementById("btnA").onclick = () => {
  if (S.mode === "title") document.getElementById("btnStart").click();
  else if (S.mode === "city") api.ui.closeCity();
  else if (S.mode === "talk") api.closeTalk();
  else if (S.mode === "world" && S.area === "castleVillage") {
    const npc = api.nearNpc(S.player.x, S.player.y);
    if (npc) api.openTalk(npc);
  }
  else if (S.mode === "levelup") api.endBattle();
  else if (S.mode === "status") toggleStatus();
  else if (S.mode === "battle" && S.battle) {
    if (S.battle.selecting === "command") api.confirmCommand();
    else api.confirmTarget();
  }
};
document.getElementById("btnB").onclick = () => {
  if (S.mode === "battle") api.cancelSelect();
  else if (S.mode === "status") toggleStatus();
};

function toggleStatus() {
  if (S.mode === "status") {
    document.getElementById("statusPane").classList.add("hidden");
    S.mode = "world";
    return;
  }
  if (S.mode !== "world") return;
  const box = document.getElementById("statusText");
  box.innerHTML = S.party.map(p => {
    const next = p.level >= Game.C.MAX_LV ? "MAX" : `${p.exp}/${p.expNeed}`;
    const sk = api.unlockedSkills(p).map(s => s.name).join(" · ") || "ยังไม่มีท่าพิเศษ";
    return `<div class="stat-card"><b>${p.name}</b> ${p.job} Lv ${p.level}<div class="stat-row"><span>HP ${p.hp}/${p.maxHp}</span><span>MP ${p.mp}/${p.maxMp}</span></div><div class="stat-row"><span>Str ${p.str}</span><span>Vit ${p.vit}</span><span>Agi ${p.agi}</span><span>Int ${p.int}</span><span>Luk ${p.luk}</span></div><div>EXP ${next}</div><div class="skills">${sk}</div></div>`;
  }).join("");
  document.getElementById("statusPane").classList.remove("hidden");
  S.mode = "status";
}

window.addEventListener("keydown", (e) => {
  const k = e.key;
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(k)) e.preventDefault();
  if (S.mode === "title" && (k === "Enter" || k === "z" || k === "Z")) document.getElementById("btnStart").click();
  if (S.mode === "talk" && (k === "Enter" || k === "z" || k === "Z" || k === "Escape" || k === "x" || k === "X")) api.closeTalk();
  if (S.mode === "city" && (k === "Enter" || k === "z" || k === "Z" || k === "Escape")) api.ui.closeCity();
  if (S.mode === "world" && S.area === "castleVillage" && (k === "z" || k === "Z" || k === "Enter")) {
    const npc = api.nearNpc(S.player.x, S.player.y);
    if (npc) api.openTalk(npc);
  }
  if (S.mode === "levelup" && (k === "Enter" || k === "z" || k === "Z" || k === " ")) api.endBattle();
  if ((S.mode === "world" || S.mode === "status") && (k === "c" || k === "C")) toggleStatus();
  if (S.mode === "status" && (k === "Escape" || k === "x" || k === "X")) toggleStatus();
  if (S.mode === "world") {
    if (k === "ArrowUp" || k === "w" || k === "W") S.keys[k] = true;
    if (k === "ArrowDown" || k === "s" || k === "S") S.keys[k] = true;
    if (k === "ArrowLeft" || k === "a" || k === "A") S.keys[k] = true;
    if (k === "ArrowRight" || k === "d" || k === "D") S.keys[k] = true;
  }
  if (S.mode === "battle" && S.battle && S.battle.phase === "pick") {
    const living = S.battle.enemies.map((en, i) => i).filter(i => S.battle.enemies[i].hp > 0);
    const max = S.battle.selecting === "command" ? api.commandsFor(S.party[S.battle.actor]).length - 1 : living.length - 1;
    if (k === "ArrowUp" || k === "w" || k === "W") {
      if (S.battle.selecting === "command") S.battle.menuIndex = (S.battle.menuIndex - 1 + max + 1) % (max + 1);
      else S.battle.target = living[(Math.max(0, living.indexOf(S.battle.target)) - 1 + living.length) % living.length];
      api.renderBattleUI();
    }
    if (k === "ArrowDown" || k === "s" || k === "S") {
      if (S.battle.selecting === "command") S.battle.menuIndex = (S.battle.menuIndex + 1) % (max + 1);
      else S.battle.target = living[(Math.max(0, living.indexOf(S.battle.target)) + 1) % living.length];
      api.renderBattleUI();
    }
    if (k === "z" || k === "Z" || k === "Enter") {
      if (S.battle.selecting === "command") api.confirmCommand();
      else api.confirmTarget();
    }
    if (k === "x" || k === "X" || k === "Escape") api.cancelSelect();
  }
});
window.addEventListener("keyup", (e) => { S.keys[e.key] = false; });

loop();
