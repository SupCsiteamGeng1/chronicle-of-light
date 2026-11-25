window.Game = window.Game || {};
const S = Game.state;
const A = Game.assets;
const api = Game.api;
const C = Game.C;

  const GROWTH = {
    warrior: { str: 34, vit: 28, agi: 14, int: 6, luk: 18 },
    monk:    { str: 28, vit: 22, agi: 28, int: 6, luk: 16 },
    white:   { str: 8,  vit: 20, agi: 16, int: 32, luk: 24 },
    black:   { str: 6,  vit: 12, agi: 18, int: 40, luk: 24 }
  };
  const JOB_SKILLS = {
    warrior: [
      { id: "powerSlash", name: "พาวเวอร์สแลช", lv: 10, mp: 0, target: "enemy" },
      { id: "guardBreak", name: "แกร์ดเบรก", lv: 20, mp: 0, target: "enemy" },
      { id: "warCry", name: "เสียงรบ", lv: 30, mp: 0, target: "none" },
      { id: "shieldWall", name: "กำแพงโล่", lv: 40, mp: 0, target: "none" },
      { id: "cleave", name: "กวาดดาบ", lv: 50, mp: 0, target: "all" },
      { id: "secondWind", name: "ลมหายใจที่สอง", lv: 60, mp: 0, target: "self" },
      { id: "ironBody", name: "กายเหล็ก", lv: 70, mp: 0, target: "self" },
      { id: "crush", name: "บดขยี้", lv: 80, mp: 0, target: "enemy" },
      { id: "bladeStorm", name: "พายุดาบ", lv: 90, mp: 0, target: "all" }
    ],
    monk: [
      { id: "focusPunch", name: "หมัดรวมพลัง", lv: 10, mp: 0, target: "enemy" },
      { id: "sweepKick", name: "เตะกวาด", lv: 20, mp: 0, target: "all" },
      { id: "counter", name: "ท่าสวนกลับ", lv: 30, mp: 0, target: "self" },
      { id: "flurry", name: "หมัดรัว", lv: 40, mp: 0, target: "enemy" },
      { id: "chiBurst", name: "คลื่นชิ", lv: 50, mp: 0, target: "all" },
      { id: "meditate", name: "ทำสมาธิ", lv: 60, mp: 0, target: "self" },
      { id: "dragonFist", name: "หมัดมังกร", lv: 70, mp: 0, target: "enemy" },
      { id: "hundredFists", name: "ร้อยหมัด", lv: 80, mp: 0, target: "enemy" },
      { id: "heavenFist", name: "หมัดสวรรค์", lv: 90, mp: 0, target: "all" }
    ],
    white: [
      { id: "protect", name: "โพรเทก", lv: 10, mp: 6, target: "ally" },
      { id: "cura", name: "คูรา", lv: 20, mp: 8, target: "party" },
      { id: "holyBolt", name: "แสงศักดิ์สิทธิ์", lv: 30, mp: 8, target: "enemy" },
      { id: "curaga", name: "คูรากา", lv: 40, mp: 14, target: "ally" },
      { id: "shell", name: "เชลล์", lv: 50, mp: 8, target: "ally" },
      { id: "arise", name: "อะไรซ์", lv: 60, mp: 16, target: "allyDead" },
      { id: "holy", name: "โฮลี", lv: 70, mp: 18, target: "enemy" },
      { id: "benediction", name: "พรสวรรค์", lv: 80, mp: 22, target: "party" },
      { id: "divineLight", name: "แสงเทวะ", lv: 90, mp: 28, target: "party" }
    ],
    black: [
      { id: "ice", name: "ไอซ์", lv: 10, mp: 6, target: "enemy" },
      { id: "thunder", name: "ธันเดอร์", lv: 20, mp: 6, target: "enemy" },
      { id: "fira", name: "ไฟรา", lv: 30, mp: 12, target: "all" },
      { id: "bio", name: "ไบโอ", lv: 40, mp: 10, target: "enemy" },
      { id: "firaga", name: "ไฟรากา", lv: 50, mp: 18, target: "enemy" },
      { id: "flare", name: "แฟลร์", lv: 60, mp: 22, target: "enemy" },
      { id: "drain", name: "เดรน", lv: 70, mp: 14, target: "enemy" },
      { id: "meteor", name: "เมเทโอ", lv: 80, mp: 26, target: "all" },
      { id: "ultima", name: "อัลติมา", lv: 90, mp: 32, target: "all" }
    ]
  };

  function expNeed(lv) {
    if (lv >= C.MAX_LV) return 999999;
    return Math.floor(18 + lv * 10 + lv * lv * 1.6);
  }
  function syncDerived(p, fill) {
    const oldMaxHp = p.maxHp || 0;
    const oldMaxMp = p.maxMp || 0;
    const jobHp = p.id === "warrior" ? 16 : p.id === "monk" ? 10 : p.id === "white" ? 4 : 2;
    p.maxHp = 18 + p.vit * 3 + p.level * 2 + jobHp;
    if (p.id === "white" || p.id === "black") p.maxMp = 8 + p.int * 2 + p.level;
    else p.maxMp = Math.floor(p.int * 0.5);
    p.atk = 3 + Math.floor(p.str * 0.55) + Math.floor(p.level * 0.3);
    p.mag = Math.floor(p.int * 0.7) + Math.floor(p.level * 0.25);
    p.expNeed = expNeed(p.level);
    if (fill) {
      p.hp = p.maxHp;
      p.mp = p.maxMp;
    } else {
      p.hp = Math.min(p.maxHp, (p.hp || 0) + Math.max(0, p.maxHp - oldMaxHp));
      p.mp = Math.min(p.maxMp, (p.mp || 0) + Math.max(0, p.maxMp - oldMaxMp));
    }
  }
  function pickStat(weights) {
    const names = Object.keys(weights);
    const total = names.reduce((s, k) => s + weights[k], 0);
    let r = Math.random() * total;
    for (const k of names) {
      r -= weights[k];
      if (r <= 0) return k;
    }
    return names[0];
  }
  function levelUp(p) {
    const lines = [];
    p.level += 1;
    const gain = { str: 0, vit: 0, agi: 0, int: 0, luk: 0 };
    if (p.id === "warrior") gain.str += 1;
    if (p.id === "monk") gain.agi += 1;
    if (p.id === "white" || p.id === "black") gain.int += 1;
    const rolls = api.randInt(4, 6);
    for (let i = 0; i < rolls; i++) gain[pickStat(GROWTH[p.id])] += 1;
    p.str += gain.str; p.vit += gain.vit; p.agi += gain.agi; p.int += gain.int; p.luk += gain.luk;
    syncDerived(p, false);
    p.hp = p.maxHp;
    p.mp = p.maxMp;
    const bits = ["Str", "Vit", "Agi", "Int", "Luk"].filter(k => gain[k.toLowerCase()] > 0)
      .map(k => `${k}+${gain[k.toLowerCase()]}`);
    lines.push(`${p.name} ขึ้นเลเวล ${p.level}!  ${bits.join("  ")}`);
    const just = JOB_SKILLS[p.id].find(s => s.lv === p.level);
    if (just) lines.push(`  ★ ปลดท่าพิเศษ: ${just.name}`);
    return lines;
  }
  function unlockedSkills(p) {
    return JOB_SKILLS[p.id].filter(s => p.level >= s.lv);
  }
api.expNeed = expNeed;
api.syncDerived = syncDerived;
api.levelUp = levelUp;
api.unlockedSkills = unlockedSkills;
S.party.forEach(p => api.syncDerived(p, true));
