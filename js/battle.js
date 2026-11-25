window.Game = window.Game || {};
const S = Game.state;
const A = Game.assets;
const api = Game.api;
const C = Game.C;

function startBattle() {
  const enemies = api.makeEncounter();
  const n = enemies.length;
  S.party.forEach(p => {
    p.defending = false; p.protect = 0; p.shell = 0; p.counter = false; p.iron = false; p.atkBuff = 0;
  });
  const order = S.party.map((p, i) => i).filter(i => S.party[i].hp > 0).sort((a, b) => S.party[b].agi - S.party[a].agi);
  S.battle = { enemies, phase: "pick", actor: order[0] ?? 0, menuIndex: 0, target: 0, selecting: "command", flash: 0, fx: [] };
  S.mode = "battle";
  document.getElementById("overlay").classList.add("show");
  setMsg(n === 1 ? "สไลม์ตัวหนึ่งปรากฏตัว!" : `สไลม์ ${n} ตัวปรากฏตัว!`);
  renderBattleUI();
}

function setMsg(t) { document.getElementById("msg").textContent = t; }

function commandsFor(p) {
  const list = [{ id: "atk", label: "โจมตี", target: "enemy" }];
  if (p.id === "white") list.push({ id: "heal", label: "ฮีล  (4 MP)", target: "ally", mp: 4 });
  if (p.id === "black") list.push({ id: "fire", label: "ไฟ   (5 MP)", target: "enemy", mp: 5 });
  api.unlockedSkills(p).forEach(s => {
    const cost = s.mp ? `  (${s.mp} MP)` : "";
    list.push({ id: s.id, label: s.name + cost, target: s.target, mp: s.mp });
  });
  list.push({ id: "item", label: `ยา    ×${S.potions}`, target: "ally" });
  list.push({ id: "flee", label: "หนี", target: "none" });
  list.push({ id: "def", label: "ป้องกัน", target: "none" });
  return list;
}

function renderBattleUI() {
  if (!S.battle) return;
  const menu = document.getElementById("menu");
  const box = document.getElementById("partyBox");
  const p = S.party[S.battle.actor] || S.party[0];
  if (S.battle.phase === "pick" && S.battle.selecting === "command") {
    const cmds = commandsFor(p);
    menu.innerHTML = cmds.map((c, i) =>
      `<button type="button" data-i="${i}" class="${i === S.battle.menuIndex ? "active" : ""}">${c.label}</button>`
    ).join("");
    menu.querySelectorAll("button").forEach(btn => {
      btn.onclick = () => { S.battle.menuIndex = +btn.dataset.i; confirmCommand(); };
    });
  } else {
    menu.innerHTML = `<button type="button" disabled>กำลังต่อสู้...</button>`;
  }
  box.innerHTML = S.party.map((a, i) => {
    const hpPct = Math.max(0, a.hp / a.maxHp * 100);
    return `<div class="p-line ${a.hp <= 0 ? "dead" : ""} ${i === S.battle.actor && S.battle.phase === "pick" ? "turn" : ""}"><span>${i === S.battle.actor && S.battle.phase === "pick" ? "▶" : ""}</span><div><div>${a.name} <small style="opacity:.7">Lv${a.level} ${a.job}</small></div><div class="bar"><i style="width:${hpPct}%;background:${hpPct < 30 ? "#e06060" : "#6fd08a"}"></i></div></div><div>HP ${Math.max(0, a.hp)}/${a.maxHp}</div></div>`;
  }).join("");
}

function confirmCommand() {
  if (!S.battle || S.battle.phase !== "pick") return;
  const p = S.party[S.battle.actor];
  const cmd = commandsFor(p)[S.battle.menuIndex];
  if (!cmd) return;
  setMsg(`${p.name} ใช้ ${cmd.label}`);
  // simplified for now
  S.battle.phase = "anim";
  setTimeout(() => {
    S.battle.phase = "pick";
    renderBattleUI();
  }, 800);
}

function confirmTarget() {}
function cancelSelect() {}
function enemyPos(i) { return { x: 120 + (i % 3) * 80, y: 140 + Math.floor(i / 3) * 40 }; }
function partyPos(i) { return { x: 480 - (i % 2) * 60, y: 220 + Math.floor(i / 2) * 50 }; }

function endBattle() {
  document.getElementById("overlay").classList.remove("show");
  S.battle = null;
  S.mode = "world";
  S.player.cool = 5;
}

api.startBattle = startBattle;
api.endBattle = endBattle;
api.renderBattleUI = renderBattleUI;
api.confirmCommand = confirmCommand;
api.confirmTarget = confirmTarget;
api.cancelSelect = cancelSelect;
api.setMsg = setMsg;
api.commandsFor = commandsFor;
api.enemyPos = enemyPos;
api.partyPos = partyPos;
