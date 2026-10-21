// ===== Sprite penyu hijau khas Berau (pixel art) =====
const COLORS = { s: "#1f6b4f", g: "#2f9a6a", G: "#5fc78f", y: "#d9c46b", Y: "#9a8531", k: "#06161c", w: "#f4fff9" };
const SPRITE = [
  "........ssssssss........",
  "......ssGGggGGggss......",
  "....ssGggsGggsGggGss....",
  "...sgGggsGggsGggsGggs...",
  "..sssssssssssssssssyyyy.",
  "...yyyyyyyyyyyyyyyyykyyy",
  "....yyyyyyyyyyyyyyyyyyYY",
  "...yyyy.......yyyyy.....",
  "..yyY.........yyY.......",
  "..YY...........YY......."
];

const spriteCanvas = document.getElementById("sprite");
const sctx = spriteCanvas.getContext("2d");
spriteCanvas.width = Math.max(...SPRITE.map(r => r.length));
spriteCanvas.height = SPRITE.length;

function drawSprite(eyesOpen = true) {
  sctx.clearRect(0, 0, spriteCanvas.width, spriteCanvas.height);
  SPRITE.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === ".") return;
      // Mata tertutup: pixel mata jadi warna kulit
      sctx.fillStyle = ch === "k" && !eyesOpen ? COLORS.Y : COLORS[ch];
      sctx.fillRect(x, y, 1, 1);
    });
  });
}
drawSprite();

// Berkedip tiap beberapa detik
setInterval(() => {
  drawSprite(false);
  setTimeout(() => drawSprite(true), 160);
}, 3200);

// Klik karakter untuk menyapa
const messages = [
  "Halo, selamat datang!",
  "Aku penyu hijau.",
  "Coba lihat proyekku.",
  "Scroll ke bawah ya.",
  "Terima kasih sudah mampir!"
];
let msgIndex = 0;
const bubble = document.getElementById("bubble");
document.getElementById("spriteBtn").addEventListener("click", () => {
  bubble.textContent = messages[msgIndex];
  msgIndex = (msgIndex + 1) % messages.length;
});

// ===== Efek ketik pada tagline =====
const typedEl = document.getElementById("typed");
const lines = ["Suka membuat hal kecil yang berguna sesuai passion guaaaa."];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reduceMotion) {
  typedEl.textContent = lines[0];
} else {
  let li = 0, ci = 0, deleting = false;
  (function tick() {
    const text = lines[li];
    typedEl.textContent = text.slice(0, ci);
    if (!deleting && ci === text.length) { deleting = true; return setTimeout(tick, 1800); }
    if (deleting && ci === 0) { deleting = false; li = (li + 1) % lines.length; }
    ci += deleting ? -1 : 1;
    setTimeout(tick, deleting ? 35 : 70);
  })();
}

// ===== Bintang berkelap-kelip =====
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");
let stars = [];

function initStars() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const count = Math.floor((canvas.width * canvas.height) / 9000);
  stars = Array.from({ length: count }, () => ({
    x: Math.floor(Math.random() * canvas.width),
    y: Math.floor(Math.random() * canvas.height),
    s: Math.random() < 0.15 ? 4 : 2,
    p: Math.random() * Math.PI * 2
  }));
}

function drawStars(t = 0) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  stars.forEach(st => {
    const a = reduceMotion ? 0.7 : 0.35 + 0.65 * Math.abs(Math.sin(t / 1200 + st.p));
    ctx.fillStyle = `rgba(233,235,255,${a})`;
    ctx.fillRect(st.x, st.y, st.s, st.s);
  });
  if (!reduceMotion) requestAnimationFrame(drawStars);
}
initStars();
drawStars();
window.addEventListener("resize", () => { initStars(); if (reduceMotion) drawStars(); });

// ===== Skill bar terisi saat terlihat =====
const skillObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelector("i").style.width = e.target.dataset.level + "%";
      skillObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.4 });
document.querySelectorAll(".skill").forEach(s => skillObserver.observe(s));

// ===== Menu mobile & penanda menu aktif =====
const menu = document.getElementById("menu");
const menuBtn = document.getElementById("menuBtn");
menuBtn.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", open);
});
menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  menu.classList.remove("open");
  menuBtn.setAttribute("aria-expanded", false);
}));

const navLinks = [...menu.querySelectorAll("a")];
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
    }
  });
}, { rootMargin: "-40% 0px -55% 0px" });
document.querySelectorAll("main section[id]").forEach(s => sectionObserver.observe(s));

// ===== Game: Petualangan Penyu =====
(function () {
  const $ = id => document.getElementById(id);
  const cv = $("gameCanvas"), g = cv.getContext("2d");
  g.imageSmoothingEnabled = false;
  const W = cv.width, H = cv.height;
  const overlay = $("gameOverlay"), msg = $("gameMsg"), startBtn = $("gameStart"), muteBtn = $("btnMute");
  const hud = { score: $("gScore"), lives: $("gLives"), level: $("gLevel"), combo: $("gCombo"), best: $("gBest") };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);

  function makeSprite(rows, colors, scale) {
    const c = document.createElement("canvas");
    c.width = rows[0].length * scale; c.height = rows.length * scale;
    const x = c.getContext("2d");
    rows.forEach((r, y) => [...r].forEach((ch, i) => {
      if (ch === "." || !colors[ch]) return;
      x.fillStyle = colors[ch]; x.fillRect(i * scale, y * scale, scale, scale);
    }));
    return c;
  }
  const JELLY = ["..jjjj..", ".jjjjjj.", "jjkjjkjj", "jjjjjjjj", ".jjjjjj.", ".j.jj.j.", ".j.jj.j.", "..j..j.."];
  const BAG = [".x....x.", ".xwwwwx.", "xwwwwwwx", "xwxxxxwx", "xwwwwwwx", "xwwwwwwx", "xwwwwwwx", ".xxxxxx."];
  const BOTTLE = ["..xxxx..", "...xx...", "..wwww..", ".wwwwww.", ".wxxxxw.", ".wwwwww.", ".wwwwww.", "..wwww.."];
  const STAR = ["...oo...", "...oo...", "oooooooo", ".oooooo.", "..oooo..", "..o..o..", ".oo..oo.", ".o....o."];
  const SHELL = ["..cccc..", ".cccccc.", "cc.cc.cc", "cc.cc.cc", "cccccccc", ".cccccc.", "..cccc..", "........"];
  const SHARK = [
    ".........gg.............", "........ggg.............", ".......gggg.............", "g.....gggggggggggggg....",
    "gg...gggggggggggggggggg.", "ggg.ggggggggggggggkgggg.", "gg...wwwwwwwwwwwwwwww...", "g.....wwwwwwwwwwww......",
    ".......g.....g.........."];
  const img = {
    turtle: makeSprite(SPRITE, COLORS, 3),
    jelly: makeSprite(JELLY, { j: "#f4a6c8", k: "#4a1f3a" }, 4),
    gold: makeSprite(JELLY, { j: "#f7d65c", k: "#6b4a10" }, 4),
    bag: makeSprite(BAG, { x: "#8fa7ad", w: "#e4eef0" }, 4),
    bottle: makeSprite(BOTTLE, { x: "#6fa8c9", w: "#d6ecf5" }, 4),
    star: makeSprite(STAR, { o: "#f29b4b" }, 4),
    shell: makeSprite(SHELL, { c: "#f2d28b" }, 4),
    shark: makeSprite(SHARK, { g: "#6b8fa3", w: "#dfeaf0", k: "#06161c" }, 3)
  };

  // ----- Suara 8-bit -----
  let actx = null, muted = false;
  function beep(f, d, type, vol, slide, delay) {
    if (muted) return;
    setTimeout(() => {
      try {
        actx = actx || new (window.AudioContext || window.webkitAudioContext)();
        const t = actx.currentTime, o = actx.createOscillator(), gn = actx.createGain();
        o.type = type || "square"; o.frequency.setValueAtTime(f, t);
        if (slide) o.frequency.linearRampToValueAtTime(f + slide, t + d);
        gn.gain.setValueAtTime(vol || 0.04, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + d);
        o.connect(gn); gn.connect(actx.destination); o.start(t); o.stop(t + d);
      } catch (e) {}
    }, delay || 0);
  }
  const sfx = {
    catch: () => beep(620, 0.09, "square", 0.04, 260),
    gold: () => [880, 1100, 1320].forEach((f, i) => beep(f, 0.1, "square", 0.04, 0, i * 70)),
    hit: () => beep(150, 0.28, "sawtooth", 0.07, -90),
    power: () => [520, 780].forEach((f, i) => beep(f, 0.12, "triangle", 0.06, 0, i * 90)),
    level: () => [523, 659, 784, 1046].forEach((f, i) => beep(f, 0.12, "square", 0.04, 0, i * 90)),
    warn: () => beep(300, 0.15, "square", 0.03, 120),
    over: () => [400, 300, 200].forEach((f, i) => beep(f, 0.2, "sawtooth", 0.05, 0, i * 160))
  };
  muteBtn.addEventListener("click", () => {
    muted = !muted;
    muteBtn.textContent = muted ? "Suara: mati" : "Suara: nyala";
  });

  // ----- Data -----
  let best = 0;
  try { best = Number(localStorage.getItem("penyuBest")) || 0; } catch (e) {}
  hud.best.textContent = best;

  const THEMES = [
    ["#0a3a40", "#0b4046", "#0d4a50"],
    ["#0a2f45", "#0b3550", "#0d3d5c"],
    ["#08202f", "#0a2638", "#0c2d42"]
  ];
  const bubbles = Array.from({ length: 14 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: Math.random() < 0.3 ? 6 : 4, v: 10 + Math.random() * 20 }));

  let state = "idle", raf = 0, last = 0, S = fresh();
  function fresh() {
    return { score: 0, lives: 3, catches: 0, combo: 0, level: 1, items: [], parts: [], time: 0,
      x: W / 2 - img.turtle.width / 2, y: H - 100, face: 1, shield: false, magnet: 0, inv: 0, shake: 0, flash: 0,
      spawn: 0.6, sharkT: 10, shark: null, warn: null, banner: null };
  }
  const mult = () => Math.min(5, 1 + Math.floor(S.combo / 5));
  function updateHud() {
    hud.score.textContent = S.score; hud.lives.textContent = S.lives;
    hud.level.textContent = S.level; hud.combo.textContent = "x" + mult();
  }
  updateHud();

  // ----- Kontrol -----
  const K = { left: false, right: false, up: false, down: false };
  const B = { left: false, right: false, up: false, down: false };
  const KEYMAP = { ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right",
    ArrowUp: "up", w: "up", W: "up", ArrowDown: "down", s: "down", S: "down" };
  const typing = e => /INPUT|TEXTAREA/.test(e.target.tagName);
  window.addEventListener("keydown", e => {
    if (typing(e) || !KEYMAP[e.key]) return;
    K[KEYMAP[e.key]] = true; if (state === "play") e.preventDefault();
  });
  window.addEventListener("keyup", e => { if (KEYMAP[e.key]) K[KEYMAP[e.key]] = false; });
  [["btnLeft", "left"], ["btnRight", "right"], ["btnUp", "up"], ["btnDown", "down"]].forEach(([id, dir]) => {
    const b = $(id);
    b.addEventListener("pointerdown", e => { e.preventDefault(); B[dir] = true; });
    ["pointerup", "pointerleave", "pointercancel"].forEach(ev => b.addEventListener(ev, () => { B[dir] = false; }));
  });
  let target = null;
  function setTarget(e) {
    const r = cv.getBoundingClientRect(), k = W / r.width;
    target = { x: (e.clientX - r.left) * k - img.turtle.width / 2, y: (e.clientY - r.top) * k - img.turtle.height / 2 - 36 };
  }
  cv.addEventListener("pointerdown", e => { if (state === "play") setTarget(e); });
  cv.addEventListener("pointermove", e => { if (target && state === "play") setTarget(e); });
  ["pointerup", "pointerleave", "pointercancel"].forEach(ev => cv.addEventListener(ev, () => { target = null; }));

  // ----- Logika -----
  function burst(x, y, color, n) {
    for (let i = 0; i < n; i++) S.parts.push({ x, y, vx: rand(-90, 90), vy: rand(-110, 40), life: rand(0.3, 0.6), c: color });
  }
  function hurt(x, y) {
    if (S.inv > 0) return;
    if (S.shield) { S.shield = false; S.inv = 0.7; burst(x, y, "#8be9ff", 10); sfx.power(); return; }
    S.lives--; S.combo = 0; S.inv = 1.3; S.shake = 0.3; S.flash = 0.25;
    burst(x, y, "#e0705a", 12); sfx.hit(); updateHud();
    if (S.lives <= 0) endGame();
  }
  function banner(text) { S.banner = { text, t: 1.4 }; }

  function spawnItem() {
    const r = Math.random();
    let type = "jelly";
    if (r < 0.52) type = "jelly";
    else if (r < 0.57) type = "gold";
    else if (r < 0.60) type = "star";
    else if (r < 0.63 && !S.shield) type = "shell";
    else type = Math.random() < 0.6 ? "bag" : "bottle";
    const im = img[type];
    const bx = rand(0, W - im.width);
    S.items.push({ type, img: im, bx, x: bx, y: -im.height, ph: rand(0, 6), v: Math.min(90 + S.level * 18, 300) * rand(0.85, 1.15) });
  }

  function collect(it) {
    const cx = it.x + it.img.width / 2, cy = it.y + it.img.height / 2;
    if (it.type === "jelly" || it.type === "gold") {
      S.catches++; S.combo++;
      const gold = it.type === "gold";
      S.score += (gold ? 5 : 1) * mult();
      burst(cx, cy, gold ? "#f7d65c" : "#f4a6c8", gold ? 14 : 7);
      gold ? sfx.gold() : sfx.catch();
      if (S.combo > 0 && S.combo % 5 === 0) banner("KOMBO x" + mult() + "!");
      const lv = 1 + Math.floor(S.catches / 10);
      if (lv > S.level) { S.level = lv; banner("LEVEL " + lv); sfx.level(); }
    } else if (it.type === "star") {
      S.magnet = 7; banner("MAGNET!"); burst(cx, cy, "#f29b4b", 10); sfx.power();
    } else if (it.type === "shell") {
      S.shield = true; banner("PERISAI!"); burst(cx, cy, "#f2d28b", 10); sfx.power();
    } else hurt(cx, cy);
    updateHud();
  }

  function update(dt) {
    S.time += dt;
    const tw = img.turtle.width, th = img.turtle.height;
    // Gerak penyu
    const dx = (K.right || B.right ? 1 : 0) - (K.left || B.left ? 1 : 0);
    const dy = (K.down || B.down ? 1 : 0) - (K.up || B.up ? 1 : 0);
    if (dx || dy) {
      const n = Math.hypot(dx, dy);
      S.x += (dx / n) * 240 * dt; S.y += (dy / n) * 240 * dt;
      if (dx) S.face = dx;
    } else if (target) {
      if (Math.abs(target.x - S.x) > 2) S.face = target.x > S.x ? 1 : -1;
      const k = Math.min(1, dt * 12);
      S.x += (target.x - S.x) * k; S.y += (target.y - S.y) * k;
    }
    S.x = clamp(S.x, 0, W - tw); S.y = clamp(S.y, 6, H - th - 26);
    const hx = S.x + 6, hy = S.y + 2, hw = tw - 12, hh = th - 4;
    const cx = S.x + tw / 2, cy = S.y + th / 2;

    ["inv", "shake", "flash", "magnet"].forEach(k => { if (S[k] > 0) S[k] = Math.max(0, S[k] - dt); });
    if (S.banner && (S.banner.t -= dt) <= 0) S.banner = null;

    // Munculkan benda
    S.spawn -= dt;
    if (S.spawn <= 0) { spawnItem(); S.spawn = Math.max(0.28, 0.9 - S.level * 0.07); }

    // Benda
    S.items.forEach(it => {
      it.y += it.v * dt;
      const edible = it.type === "jelly" || it.type === "gold";
      if (edible) it.x = it.bx + Math.sin(S.time * 2 + it.ph) * 12;
      if (edible && S.magnet > 0) {
        const mx = cx - (it.x + it.img.width / 2), my = cy - (it.y + it.img.height / 2), d = Math.hypot(mx, my);
        if (d < 150 && d > 1) { it.bx += (mx / d) * 230 * dt; it.y += (my / d) * 230 * dt; }
      }
      const iw = it.img.width - 6, ih = it.img.height - 6;
      if (it.x + 3 < hx + hw && it.x + 3 + iw > hx && it.y + 3 < hy + hh && it.y + 3 + ih > hy) { it.dead = true; collect(it); }
      else if (it.y > H) it.dead = true;
    });
    S.items = S.items.filter(it => !it.dead);

    // Hiu (mulai level 3)
    if (S.level >= 3 && !S.shark && !S.warn) {
      S.sharkT -= dt;
      if (S.sharkT <= 0) { S.warn = { y: rand(40, H - 90), dir: Math.random() < 0.5 ? 1 : -1, t: 1.1 }; sfx.warn(); }
    }
    if (S.warn && (S.warn.t -= dt) <= 0) {
      const sw = img.shark.width;
      S.shark = { x: S.warn.dir > 0 ? -sw : W, y: S.warn.y, dir: S.warn.dir, v: (200 + S.level * 12) * S.warn.dir };
      S.warn = null; S.sharkT = rand(Math.max(5, 14 - S.level), Math.max(7, 17 - S.level));
    }
    if (S.shark) {
      const sh = S.shark; sh.x += sh.v * dt;
      const sw = img.shark.width, sht = img.shark.height;
      if (sh.x + 8 < hx + hw && sh.x + sw - 8 > hx && sh.y + 6 < hy + hh && sh.y + sht - 6 > hy) hurt(cx, cy);
      if (sh.x > W + 10 || sh.x < -sw - 10) S.shark = null;
    }

    // Partikel
    S.parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 220 * dt; p.life -= dt; });
    S.parts = S.parts.filter(p => p.life > 0);
  }

  function draw(dt) {
    const band = THEMES[Math.min(THEMES.length - 1, Math.floor((S.level - 1) / 2))];
    g.save();
    if (S.shake > 0) g.translate(rand(-3, 3), rand(-3, 3));
    for (let i = 0; i < 3; i++) { g.fillStyle = band[i]; g.fillRect(0, (H / 3) * i, W, H / 3 + 1); }
    g.fillStyle = "rgba(234,250,246,.35)";
    bubbles.forEach(b => {
      b.y -= b.v * dt;
      if (b.y < -8) { b.y = H + 8; b.x = Math.random() * W; }
      g.fillRect(Math.round(b.x), Math.round(b.y), b.s, b.s);
    });
    g.fillStyle = "#c9ae6a"; g.fillRect(0, H - 22, W, 22);
    g.fillStyle = "#a88f52"; g.fillRect(0, H - 22, W, 4);

    // Peringatan hiu
    if (S.warn && Math.floor(S.warn.t * 8) % 2 === 0) {
      g.fillStyle = "rgba(224,112,90,.25)"; g.fillRect(0, S.warn.y, W, img.shark.height);
      g.fillStyle = "#e0705a"; g.font = "bold 16px monospace";
      g.fillText("!", S.warn.dir > 0 ? 8 : W - 18, S.warn.y + 20);
    }
    S.items.forEach(it => g.drawImage(it.img, Math.round(it.x), Math.round(it.y)));
    if (S.shark) {
      const sh = S.shark;
      g.save();
      if (sh.dir < 0) { g.translate(Math.round(sh.x) + img.shark.width, Math.round(sh.y)); g.scale(-1, 1); g.drawImage(img.shark, 0, 0); }
      else g.drawImage(img.shark, Math.round(sh.x), Math.round(sh.y));
      g.restore();
    }
    S.parts.forEach(p => { g.fillStyle = p.c; g.fillRect(Math.round(p.x), Math.round(p.y), 3, 3); });

    // Penyu
    const tw = img.turtle.width, th = img.turtle.height;
    if (!(S.inv > 0 && Math.floor(S.inv * 12) % 2 === 0)) {
      g.save();
      if (S.face < 0) { g.translate(Math.round(S.x) + tw, Math.round(S.y)); g.scale(-1, 1); g.drawImage(img.turtle, 0, 0); }
      else g.drawImage(img.turtle, Math.round(S.x), Math.round(S.y));
      g.restore();
    }
    if (S.shield) {
      g.strokeStyle = "#8be9ff"; g.lineWidth = 3; g.setLineDash([6, 4]);
      g.strokeRect(Math.round(S.x) - 5, Math.round(S.y) - 5, tw + 10, th + 10); g.setLineDash([]);
    }
    g.restore();

    // Info di kanvas
    g.font = "9px 'Press Start 2P', monospace"; g.textAlign = "left";
    if (S.magnet > 0) { g.fillStyle = "#f29b4b"; g.fillText("MAGNET " + Math.ceil(S.magnet), 8, 18); }
    if (S.banner) {
      g.textAlign = "center"; g.font = "14px 'Press Start 2P', monospace";
      g.fillStyle = "#06222b"; g.fillText(S.banner.text, W / 2 + 2, 92);
      g.fillStyle = "#f2d28b"; g.fillText(S.banner.text, W / 2, 90);
      g.textAlign = "left";
    }
    if (S.flash > 0) { g.fillStyle = "rgba(224,112,90,.3)"; g.fillRect(0, 0, W, H); }
  }

  function frame(t) {
    if (state !== "play") return;
    const dt = Math.min((t - last) / 1000, 0.05);
    last = t;
    update(dt);
    if (state === "play") { draw(dt); raf = requestAnimationFrame(frame); }
  }
  function begin(fresher) {
    if (fresher) { S = fresh(); updateHud(); }
    state = "play"; overlay.hidden = true; last = performance.now(); raf = requestAnimationFrame(frame);
  }
  function pause() {
    if (state !== "play") return;
    state = "paused"; cancelAnimationFrame(raf);
    msg.textContent = "Dijeda."; startBtn.textContent = "Lanjut"; overlay.hidden = false;
  }
  function endGame() {
    state = "over"; cancelAnimationFrame(raf); draw(0); sfx.over();
    let text = "Game selesai. Skor " + S.score + ", level " + S.level + ".";
    if (S.score > best) {
      best = S.score; hud.best.textContent = best; text += " Rekor baru!";
      try { localStorage.setItem("penyuBest", best); } catch (e) {}
    }
    msg.textContent = text; startBtn.textContent = "Main lagi"; overlay.hidden = false;
  }
  startBtn.addEventListener("click", () => begin(state !== "paused"));
  document.addEventListener("visibilitychange", () => { if (document.hidden) pause(); });
  new IntersectionObserver(es => { if (!es[0].isIntersecting) pause(); }, { threshold: 0.2 }).observe(cv);
  draw(0);
})();

// ===== Kartu nama tergantung: ayunan, bisa ditarik, klik ganti foto =====
(function () {
  const hang = document.getElementById("hang"), swing = document.getElementById("swing");
  const badge = document.getElementById("badge"), img = document.getElementById("photo"), hint = document.getElementById("photoHint");
  if (!badge) return;
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let pixel = true;
  function toggle() {
    pixel = !pixel;
    img.src = pixel ? "foto-pixel.png" : "foto-asli.jpg";
    img.classList.toggle("real", !pixel);
    hint.textContent = pixel ? "Tarik kartunya, klik untuk foto asli" : "Klik lagi untuk kembali ke pixel";
  }
  badge.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });

  let ang = still ? 0 : 0.55, vel = 0, dragging = false, moved = 0, sx = 0, sy = 0, px = 0, py = 0, visible = true, t = 0, last = performance.now();
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(hang);

  badge.addEventListener("pointerdown", e => {
    badge.setPointerCapture(e.pointerId);
    dragging = true; moved = 0; sx = px = e.clientX; sy = py = e.clientY;
    badge.classList.add("dragging");
  });
  badge.addEventListener("pointermove", e => {
    if (!dragging) return;
    px = e.clientX; py = e.clientY; moved = Math.max(moved, Math.hypot(px - sx, py - sy));
  });
  function release() {
    if (!dragging) return;
    dragging = false; badge.classList.remove("dragging");
    if (moved < 6) { toggle(); vel += 1.8; } // klik: foto berganti dan kartu terdorong
  }
  badge.addEventListener("pointerup", release);
  badge.addEventListener("pointercancel", release);

  if (still) return;
  (function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.033); last = now; t += dt;
    if (visible && dt > 0) {
      if (dragging && moved >= 6) {
        const r = hang.getBoundingClientRect();
        const dx = px - (r.left + r.width / 2), dy = Math.max(60, py - r.top);
        const target = Math.max(-0.9, Math.min(0.9, Math.atan2(dx, dy)));
        vel = Math.max(-9, Math.min(9, (target - ang) / dt));
        ang = target;
      } else {
        const acc = -30 * Math.sin(ang) - 0.9 * vel + 0.7 * Math.sin(t * 0.8); // gravitasi, redaman, angin pelan
        vel += acc * dt; ang += vel * dt;
      }
      swing.style.transform = "rotate(" + ang.toFixed(4) + "rad)";
    }
    requestAnimationFrame(loop);
  })(last);
})();

// ===== Ikon pixel (skill dan kontak) =====
(function () {
  const F = { // font 3x5
    "<": ["..#", ".#.", "#..", ".#.", "..#"], ">": ["#..", ".#.", "..#", ".#.", "#.."],
    "{": ["..#", ".#.", "##.", ".#.", "..#"], "}": ["#..", ".#.", ".##", ".#.", "#.."],
    J: ["..#", "..#", "..#", "#.#", ".#."], S: [".##", "#..", ".#.", "..#", "##."],
    Q: ["###", "#.#", "#.#", "###", "..#"], L: ["#..", "#..", "#..", "#..", "###"],
    D: ["##.", "#.#", "#.#", "#.#", "##."]
  };
  // Ikon bergaya tile: warna latar, warna huruf, teks, skala huruf
  const TILES = {
    html: ["#e34f26", "#ffffff", "<>", 2], css: ["#2965f1", "#ffffff", "{}", 2],
    js: ["#f7df1e", "#1a1a1a", "JS", 2], mysql: ["#00758f", "#ffffff", "SQL", 1],
    ds: ["#5fd6c9", "#06222b", "DS", 2]
  };
  // Ikon gambar tangan
  const MAPS = {
    java: { c: "#5382a1", r: "#f2705a", b: "#8fb3cc", rows: [
      ".......r........", "......r.........", ".......r........", "......r.........", "................",
      "..cccccccccc....", "..cccccccccccc..", "..cccccccccc.cc.", "..cccccccccc.cc.", "...cccccccc.ccc.",
      "...cccccccccc...", "....cccccccc....", "................", "..bbbbbbbbbbbb..", "...bbbbbbbbbb..."] },
    instagram: { p: "#e1306c", rows: [
      ".pppppppppppppp.", ".p............p.", ".p.........p..p.", ".p....pppp....p.", ".p...p....p...p.",
      ".p...p....p...p.", ".p...p....p...p.", ".p...p....p...p.", ".p....pppp....p.", ".p............p.", ".pppppppppppppp."] },
    github: { w: "#eef3f6", rows: [
      "..ww........ww..", "..wwwwwwwwwwww..", ".wwwwwwwwwwwwww.", ".wwwwwwwwwwwwww.", ".wwwwwwwwwwwwww.",
      ".wwwwwwwwwwwwww.", ".wwwwwwwwwwwwww.", "..wwwwwwwwwwww..", "...wwwwwwwwww...", "....wwwwwwww....",
      "...ww.wwww.ww...", "..ww..wwww..ww.."] },
    discord: { d: "#5865f2", k: "#0a3a40", rows: [
      "...dd......dd...", "..dddddddddddd..", ".dddddddddddddd.", ".dddddddddddddd.", ".ddkkddddddkkdd.",
      ".ddkkddddddkkdd.", ".dddddddddddddd.", ".dddddddddddddd.", "..dddddddddddd..", "..dd.dddddd.dd..", "...d........d..."] }
  };

  function paint(ctx, rows, colors, ox, oy) {
    rows.forEach((row, y) => [...row].forEach((ch, x) => {
      if (ch === "." || !colors[ch]) return;
      ctx.fillStyle = colors[ch];
      ctx.fillRect(ox + x, oy + y, 1, 1);
    }));
  }

  document.querySelectorAll("canvas.ico").forEach(cv => {
    const ctx = cv.getContext("2d");
    const key = cv.dataset.ico;
    if (TILES[key]) {
      const [bg, fg, text, sc] = TILES[key];
      // Latar bersudut tumpul 1px
      ctx.fillStyle = bg;
      ctx.fillRect(0, 1, 16, 14); ctx.fillRect(1, 0, 14, 16);
      const glyphs = [...text].map(c => F[c]);
      const w = glyphs.length * 3 * sc + (glyphs.length - 1) * sc;
      let x = Math.floor((16 - w) / 2); const y = Math.floor((16 - 5 * sc) / 2);
      ctx.fillStyle = fg;
      glyphs.forEach(g => {
        g.forEach((row, gy) => [...row].forEach((ch, gx) => {
          if (ch === "#") ctx.fillRect(x + gx * sc, y + gy * sc, sc, sc);
        }));
        x += 3 * sc + sc;
      });
    } else if (MAPS[key]) {
      const m = MAPS[key];
      paint(ctx, m.rows, m, 0, Math.floor((16 - m.rows.length) / 2));
    }
  });
})();

// ===== Form saran dan masukan (dikirim ke email lewat FormSubmit) =====
(function () {
  const form = document.getElementById("feedbackForm");
  if (!form) return;
  const btn = document.getElementById("fbBtn");
  const status = document.getElementById("fbStatus");
  const ENDPOINT = "https://formsubmit.co/ajax/rahmatardani0208@gmail.com";

  function say(text, cls) { status.textContent = text; status.className = "status " + (cls || ""); }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const data = new FormData(form);
    const message = (data.get("message") || "").trim();
    if (!message) { say("Pesan tidak boleh kosong.", "err"); return; }
    if (data.get("_honey")) return; // bot

    btn.disabled = true; say("Mengirim...");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          name: (data.get("name") || "").trim() || "Anonim",
          message,
          _subject: "Saran dan masukan dari website pribadi",
          _template: "table",
          _captcha: "false"
        })
      });
      const out = await res.json().catch(() => ({}));
      if (res.ok && String(out.success) !== "false") {
        say("Terima kasih! Pesan Anda sudah terkirim.", "ok");
        form.reset();
      } else {
        say("Gagal mengirim. Coba lagi beberapa saat.", "err");
      }
    } catch (err) {
      say("Tidak ada koneksi atau pengiriman gagal. Coba lagi.", "err");
    } finally {
      btn.disabled = false;
    }
  });
})();
