/* Corazón de partículas: se abre con el botón que aparece al final */
(function () {
  /* ===== EDITA AQUÍ ===== */
  const TEXTOS = {
    boton: "Ver algo más ♥",   // texto del botón que aparece al decir que sí
    mensaje: "Para ti Valeria ♥",      // texto sobre el corazón
    pista: "Toca el corazón"   // ayuda al pie de la pantalla
  };
  /* ======================= */

  const COLORES = ["#1a6bff", "#1a6bff", "#2f8cff", "#2f8cff", "#00a2ff", "#3dc6ff", "#8fe3ff", "#ffffff"];
  const quieto = () => document.documentElement.classList.contains("sin-movimiento");

  /* ---------- Pantalla y botón ---------- */
  const cz = document.createElement("div");
  cz.id = "cz";
  cz.hidden = true;
  cz.innerHTML = '<canvas></canvas><button class="btn cz-volver" type="button">← Volver</button><p class="cz-texto"></p><p class="cz-pista"></p>';
  document.body.appendChild(cz);
  cz.querySelector(".cz-texto").textContent = TEXTOS.mensaje;
  const pista = cz.querySelector(".cz-pista");
  pista.textContent = TEXTOS.pista;

  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "btn cz-abrir";
  boton.textContent = TEXTOS.boton;
  (document.getElementById("exito") || document.body).appendChild(boton);

  /* ---------- Partículas ---------- */
  const lienzo = cz.querySelector("canvas");
  const ctx = lienzo.getContext("2d");
  let W, H, unit, cx, cy, baseY;
  let particulas = [], grupos = [], chispas = [];
  let raf = 0, activo = false, cierre = 0, k = 0.012, mx = -9999, my = -9999;

  function medir() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    lienzo.width = W * dpr; lienzo.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    unit = Math.min(W * 0.68, H * 0.5, 520) / 32;   // el corazón mide 32 unidades de ancho
    cx = W / 2; cy = H * 0.47; baseY = cy + 16 * unit;
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
  }

  function reiniciarChispa(c) {
    c.x = cx + (Math.random() - 0.5) * unit * 22;
    c.y = baseY - Math.random() * unit * 3;
    c.vy = -(0.4 + Math.random() * 1.1);
    c.vida = 0.4 + Math.random() * 0.6;
  }

  // contorno del corazón, para saber si un punto cae adentro
  const POLI = Array.from({ length: 160 }, (_, i) => {
    const a = (i / 160) * 6.2832;
    return [16 * Math.pow(Math.sin(a), 3), 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)];
  });
  function dentro(x, y) {
    let c = false;
    for (let i = 0, j = POLI.length - 1; i < POLI.length; j = i++) {
      const [xi, yi] = POLI[i], [xj, yj] = POLI[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  }

  function crear() {
    const n = W < 600 ? 2200 : 4500;
    particulas = []; grupos = COLORES.map(() => []);
    for (let i = 0; i < n; i++) {
      let hx, hy;
      if (Math.random() < 0.25) { // 25% sobre el contorno
        const a = Math.random() * 6.2832;
        hx = 16 * Math.pow(Math.sin(a), 3);
        hy = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a);
      } else { // el resto repartido parejo por dentro
        do { hx = (Math.random() * 2 - 1) * 16; hy = -17 + Math.random() * 30; } while (!dentro(hx, hy));
      }
      const p = {
        hx, hy,
        x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0,
        s: 0.8 + Math.random() * 1.6, f: 0.5 + Math.random() * 1.5, ph: Math.random() * 6.28
      };
      particulas.push(p);
      grupos[Math.floor(Math.random() * COLORES.length)].push(p);
    }
    chispas = Array.from({ length: 120 }, () => ({ x: 0, y: 0, vy: 0, vida: 0 }));
    chispas.forEach(reiniciarChispa);
  }

  function estallar() {
    for (const p of particulas) {
      const a = Math.atan2(p.y - cy, p.x - cx) + (Math.random() - 0.5) * 1.2;
      const v = 5 + Math.random() * 15;
      p.vx = Math.cos(a) * v; p.vy = Math.sin(a) * v;
    }
    k = 0.002; // casi sin "resorte": las partículas vuelan lejos y luego regresan
    pista.classList.add("oculta");
  }

  function cuadro(t) {
    if (!activo) return;
    if (!quieto()) raf = requestAnimationFrame(cuadro);

    const ph = (t % 1100) / 1100; // doble latido
    const latido = 1 + 0.04 * (Math.exp(-((ph - 0.08) ** 2) / 0.002) + 0.6 * Math.exp(-((ph - 0.28) ** 2) / 0.003));
    k += (0.04 - k) * 0.02;

    // estela: no borramos del todo, así los movimientos dejan rastro
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(0,0,6,0.28)";
    ctx.fillRect(0, 0, W, H);

    // brillo celeste de la base
    ctx.save();
    ctx.translate(cx, baseY); ctx.scale(1, 0.2);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, unit * 15);
    g.addColorStop(0, "rgba(0,229,255,.5)"); g.addColorStop(0.45, "rgba(0,140,255,.22)"); g.addColorStop(1, "rgba(0,60,255,0)");
    ctx.fillStyle = g; ctx.fillRect(-unit * 15, -unit * 15, unit * 30, unit * 30);
    ctx.restore();

    ctx.globalCompositeOperation = "lighter";
    const R = 90;
    for (const p of particulas) {
      const tx = cx + p.hx * unit * latido + Math.sin(t * 0.001 * p.f + p.ph) * 1.3;
      const ty = cy - (p.hy + 2.5) * unit * latido + Math.cos(t * 0.0012 * p.f + p.ph) * 1.3;
      p.vx += (tx - p.x) * k; p.vy += (ty - p.y) * k;
      const dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
      if (d2 < R * R && d2 > 1) { // el dedo o el mouse las empuja
        const d = Math.sqrt(d2), f = (1 - d / R) * 1.6;
        p.vx += (dx / d) * f; p.vy += (dy / d) * f;
      }
      p.vx *= 0.92; p.vy *= 0.92;
      p.x += p.vx; p.y += p.vy;
    }

    ctx.lineWidth = 1.2;
    for (let i = 0; i < grupos.length; i++) {
      ctx.fillStyle = ctx.strokeStyle = COLORES[i];
      ctx.beginPath();
      for (const p of grupos[i]) ctx.rect(p.x, p.y, p.s, p.s);
      ctx.fill();
      ctx.beginPath(); // las partículas rápidas dejan una línea, como en el estallido del video
      for (const p of grupos[i]) {
        if (p.vx * p.vx + p.vy * p.vy > 9) { ctx.moveTo(p.x - p.vx * 1.4, p.y - p.vy * 1.4); ctx.lineTo(p.x, p.y); }
      }
      ctx.stroke();
    }

    // chispas que suben desde la base
    ctx.fillStyle = "#7fe9ff";
    for (const c of chispas) {
      c.y += c.vy; c.x += Math.sin(t * 0.002 + c.y * 0.02) * 0.3; c.vida -= 0.006;
      if (c.vida <= 0) reiniciarChispa(c);
      ctx.globalAlpha = Math.max(0, c.vida);
      ctx.fillRect(c.x, c.y, 1.8, 1.8);
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- Abrir y cerrar ---------- */
  function abrir() {
    clearTimeout(cierre);
    cz.hidden = false;
    medir(); crear();
    k = 0.012; // arranca lento: las partículas vuelan desde todos lados hasta formar el corazón
    pista.classList.remove("oculta");
    if (quieto()) { // sin movimiento: el corazón aparece ya formado
      for (const p of particulas) { p.x = cx + p.hx * unit; p.y = cy - (p.hy + 2.5) * unit; }
    }
    void cz.offsetWidth;
    cz.classList.add("visible");
    activo = true;
    raf = requestAnimationFrame(cuadro);
  }
  function cerrar() {
    activo = false;
    cancelAnimationFrame(raf);
    cz.classList.remove("visible");
    cierre = setTimeout(() => { cz.hidden = true; }, 600);
  }

  boton.addEventListener("click", abrir);
  cz.querySelector(".cz-volver").addEventListener("click", cerrar);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && activo) cerrar(); });
  lienzo.addEventListener("pointerdown", (e) => { mx = e.clientX; my = e.clientY; if (!quieto()) estallar(); });
  lienzo.addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; });
  lienzo.addEventListener("pointerleave", () => { mx = my = -9999; });
  window.addEventListener("resize", () => { if (activo) medir(); });
})();