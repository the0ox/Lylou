/* ============================================================
   Lylou — interactions
   ============================================================ */

const HEART_SVG = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-10-9.2C.3 8.4 2.2 4 6.2 4c2.2 0 3.7 1.2 4.8 2.8C12.1 5.2 13.6 4 15.8 4c4 0 5.9 4.4 4.2 7.8C19.5 16.4 12 21 12 21z"/></svg>`;
const rand = (min, max) => Math.random() * (max - min) + min;

/* ---- Cœurs en arrière-plan ---- */
(function spawnHearts() {
  const container = document.getElementById("hearts");
  if (!container) return;
  const COUNT = window.innerWidth < 640 ? 18 : 32;
  for (let i = 0; i < COUNT; i++) {
    const wrap = document.createElement("div");
    wrap.innerHTML = HEART_SVG;
    const svg = wrap.firstChild;
    const size = rand(12, 50);
    svg.style.width = svg.style.height = size + "px";
    svg.style.left = rand(0, 100) + "vw";
    svg.style.animationDuration = rand(8, 16) + "s";
    svg.style.animationDelay = rand(-16, 0) + "s";
    svg.style.opacity = rand(0.25, 0.6);
    container.appendChild(svg);
  }
})();

/* ---- Curseur cœur (desktop) ---- */
(function cursorHeart() {
  const cursor = document.getElementById("cursorHeart");
  if (!cursor) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  let tx = 0, ty = 0, cx = 0, cy = 0;
  document.addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; });
  function loop() {
    cx += (tx - cx) * 0.18;
    cy += (ty - cy) * 0.18;
    cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  }
  loop();
  // Petits cœurs au clic
  document.addEventListener("click", (e) => {
    if (e.target.closest("button, a")) return;
    const w = document.createElement("div");
    w.innerHTML = HEART_SVG;
    const s = w.firstChild;
    const size = rand(18, 32);
    Object.assign(s.style, {
      position: "fixed",
      left: e.clientX - size / 2 + "px",
      top: e.clientY - size / 2 + "px",
      width: size + "px", height: size + "px",
      color: "#f43f5e",
      pointerEvents: "none",
      zIndex: 9999,
      transition: "transform 1s ease-out, opacity 1s ease-out",
    });
    document.body.appendChild(s);
    requestAnimationFrame(() => {
      s.style.transform = "translateY(-100px) scale(1.6)";
      s.style.opacity = "0";
    });
    setTimeout(() => s.remove(), 1100);
  });
})();

/* ---- Reveal au scroll ---- */
(function reveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  els.forEach((el) => io.observe(el));
})();

/* ---- Tilt 3D doux sur les cartes ---- */
(function tiltCards() {
  const cards = document.querySelectorAll("[data-tilt]");
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
})();

/* ---- Question oui / non ---- */
(function askQuestion() {
  const yesBtn = document.getElementById("yesBtn");
  const noBtn  = document.getElementById("noBtn");
  const celebration = document.getElementById("celebration");
  if (!yesBtn || !noBtn) return;

  let scale = 1;
  let clicks = 0;

  // Le "Non" devient absolu après le 1er événement pour fuir
  function makeNoFloating() {
    if (noBtn.style.position === "fixed") return;
    const r = noBtn.getBoundingClientRect();
    noBtn.style.position = "fixed";
    noBtn.style.left = r.left + "px";
    noBtn.style.top = r.top + "px";
    noBtn.style.margin = "0";
  }

  function moveNoAway() {
    makeNoFloating();
    const r = noBtn.getBoundingClientRect();
    const maxX = Math.max(0, window.innerWidth  - r.width  - 16);
    const maxY = Math.max(0, window.innerHeight - r.height - 16);
    noBtn.style.left = rand(8, maxX) + "px";
    noBtn.style.top  = rand(8, maxY) + "px";
  }

  function growYes() {
    clicks++;
    scale *= 1.35;
    yesBtn.style.transformOrigin = "center";
    yesBtn.style.transform = `scale(${scale})`;
    yesBtn.style.position = "relative";
    yesBtn.style.zIndex = "5";
    if (scale > 2.5) noBtn.style.opacity = Math.max(0.15, 1.2 / scale);
  }

  // Sur desktop le Non fuit au survol
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    noBtn.addEventListener("mouseenter", () => { moveNoAway(); growYes(); });
  }
  // Sur mobile / clic direct
  noBtn.addEventListener("click", (e) => { e.preventDefault(); moveNoAway(); growYes(); });
  noBtn.addEventListener("touchstart", (e) => { e.preventDefault(); moveNoAway(); growYes(); }, { passive: false });

  yesBtn.addEventListener("click", () => {
    celebration.hidden = false;
    document.body.style.overflow = "hidden";
    launchConfetti();
  });
})();

/* ---- Confettis sur la célébration ---- */
function launchConfetti() {
  const canvas = document.getElementById("confetti");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  const colors = ["#f43f5e", "#ec4899", "#be123c", "#fda4af", "#d9a441", "#ffffff"];
  const particles = [];
  const COUNT = 180;

  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height,
      r: 4 + Math.random() * 6,
      c: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 2,
      vy: 2 + Math.random() * 4,
      rot: Math.random() * Math.PI,
      vrot: (Math.random() - 0.5) * 0.2,
      shape: Math.random() < 0.4 ? "heart" : "rect",
    });
  }

  function drawHeart(x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x - s, y - s, x - s, y + s / 2, x, y + s);
    ctx.bezierCurveTo(x + s, y + s / 2, x + s, y - s, x, y);
    ctx.fill();
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;
      if (p.y > canvas.height + 20) {
        p.y = -20;
        p.x = Math.random() * canvas.width;
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      if (p.shape === "heart") drawHeart(0, 0, p.r);
      else ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6);
      ctx.restore();
    });
    requestAnimationFrame(tick);
  }
  tick();
}
