/* ============================================================
   EDITA AQUÍ
   ============================================================ */
const CONFIG = {
  nombre: "Nombre",                 // ← su nombre (se pone en todos los lugares)
  respetarMovimientoReducido: false, // true = si el equipo tiene las animaciones desactivadas, la página se ve sin movimiento
  frasesNo: [                       // ← lo que va diciendo el botón NO
    "Estas segura de lo que haces?",
    "Piénsalo bien",
    "Le das de nuevo y no me vuelves a ver!",
    "¡No me hagas esto!",
    "¡Voy a llorar!",
    "..."
  ]
};

/* ============================================================
   No hace falta tocar nada de aquí en adelante
   ============================================================ */
const $ = (s) => document.querySelector(s);
if (CONFIG.respetarMovimientoReducido && matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.documentElement.classList.add("sin-movimiento");
}
const overlay = $("#overlay"), sobre = $("#sobre"), pista = $("#pista");
const audio = $("#musica"), btnMusica = $("#btnMusica"), icono = btnMusica.querySelector("i");
const botones = $("#botones"), btnSi = $("#btnSi"), btnNo = $("#btnNo");

document.querySelectorAll(".nombre").forEach((n) => (n.textContent = CONFIG.nombre));

/* ---------- Corazones que caen ---------- */
const azules = ["#ffffff", "#dbe4ff", "#a9bdf2", "#7f9ae0"]; // tonos de la paleta
function corazon(cont, unaVez) {
  const c = document.createElement("span");
  const t = 10 + Math.random() * 26; // tamaño: los grandes se ven más y los chicos parecen lejanos
  c.className = "petalo";
  c.style.left = `${Math.random() * 100}%`;
  c.style.width = c.style.height = `${t}px`;
  c.style.color = azules[Math.floor(Math.random() * azules.length)];
  c.style.setProperty("--op", (0.35 + (t / 36) * 0.5).toFixed(2));
  c.style.setProperty("--dx", `${(Math.random() - 0.5) * 240}px`);
  c.style.setProperty("--giro", `${(Math.random() - 0.5) * 720}deg`);
  if (unaVez) {
    c.style.animationDuration = `${4 + Math.random() * 4}s`;
    c.style.animationDelay = `${Math.random() * 2}s`;
    c.style.animationIterationCount = "1";
    c.addEventListener("animationend", () => c.remove());
  } else {
    c.style.animationDuration = `${9 + Math.random() * 6 - t / 10}s`;
    c.style.animationDelay = `-${Math.random() * 10}s`; // algunos ya van cayendo al cargar
  }
  cont.appendChild(c);
}
for (let i = 0; i < 18; i++) corazon($("#petalos"), false);

/* ---------- Música ---------- */
let suena = false;
function musica(encender) {
  if (encender) {
    audio.play().then(() => { suena = true; icono.className = "bx bx-volume-full"; }).catch(() => {});
  } else {
    audio.pause(); suena = false; icono.className = "bx bx-volume-mute";
  }
}
btnMusica.addEventListener("click", () => musica(!suena));

/* ---------- Abrir el sobre ---------- */
sobre.addEventListener("click", () => {
  sobre.classList.add("abierto");
  sobre.disabled = true;
  pista.classList.add("oculta");
  musica(true);
  setTimeout(() => {
    overlay.classList.add("sale");
    document.body.classList.remove("bloqueado");
    setTimeout(() => overlay.remove(), 1000);
  }, 2000);
});

/* ---------- Aparecer al hacer scroll ---------- */
const vigia = new IntersectionObserver((entradas) => {
  entradas.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("visible"); vigia.unobserve(e.target); }
  });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el) => vigia.observe(el));

/* ---------- NO: cambia de frase y el SÍ crece ---------- */
let escala = 1, intento = 0;
btnNo.addEventListener("click", () => {
  escala *= 1.3;
  botones.style.setProperty("--k", escala.toFixed(2));
  if (intento < CONFIG.frasesNo.length) btnNo.textContent = CONFIG.frasesNo[intento++];
  else btnNo.hidden = true;
});

/* ---------- SÍ ---------- */
btnSi.addEventListener("click", () => {
  $("#pregunta").hidden = true;
  $("#exito").hidden = false;
  $("#exito").scrollIntoView({ behavior: "smooth", block: "center" });
  for (let i = 0; i < 50; i++) corazon($("#lluvia"), true);
});