// ====== Configuración (datos de relleno) ======
const KIT = { precio: 186000, pvpTotal: 312000 };
// Pegá acá la URL de tu formulario (Formspree, Google Apps Script, etc.). Vacío = modo demo.
const ENDPOINT = "";

const fmt = n => n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
const $ = id => document.getElementById(id);

// ====== Calculadora de margen ======
function calc() {
  const kits = +$("kits").value, sold = +$("sold").value / 100;
  const inv = kits * KIT.precio, sale = Math.round(kits * KIT.pvpTotal * sold);
  $("kits-out").textContent = kits;
  $("sold-out").textContent = Math.round(sold * 100) + "%";
  $("r-inv").textContent = fmt(inv);
  $("r-sale").textContent = fmt(sale);
  $("r-gain").textContent = fmt(sale - inv);
}
["kits", "sold"].forEach(id => $(id).addEventListener("input", calc));
calc();

// ====== Provincias ======
["Buenos Aires","CABA","Catamarca","Chaco","Chubut","Córdoba","Corrientes","Entre Ríos","Formosa","Jujuy","La Pampa","La Rioja","Mendoza","Misiones","Neuquén","Río Negro","Salta","San Juan","San Luis","Santa Cruz","Santa Fe","Santiago del Estero","Tierra del Fuego","Tucumán"]
  .forEach(p => $("prov").add(new Option(p, p)));

// ====== UTM: sirve para medir qué anuncio y provincia convierten mejor ======
const params = new URLSearchParams(location.search);
["utm_source", "utm_medium", "utm_campaign"].forEach(k => {
  const el = document.querySelector(`[name=${k}]`);
  if (el) el.value = params.get(k) || "";
});

// ====== Formulario ======
const form = $("lead"), msg = $("msg");
form.addEventListener("submit", async e => {
  e.preventDefault();
  form.querySelectorAll("input,select").forEach(el => el.classList.add("touched"));
  if (!form.checkValidity()) {
    msg.className = "msg full err";
    msg.textContent = "Revisá los campos marcados antes de enviar.";
    form.querySelector(":invalid")?.focus();
    return;
  }
  const data = Object.fromEntries(new FormData(form));
  data.fecha = new Date().toISOString();
  data.precio_comunicado = KIT.precio;
  try {
    if (ENDPOINT) {
      const r = await fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!r.ok) throw new Error();
    } else {
      console.log("Lead (modo demo):", data);
    }
    msg.className = "msg full ok";
    msg.textContent = "¡Listo! Te escribimos por WhatsApp en menos de 24 horas hábiles.";
    form.reset();
    form.querySelectorAll(".touched").forEach(el => el.classList.remove("touched"));
  } catch {
    msg.className = "msg full err";
    msg.textContent = "No pudimos enviar el formulario. Probá de nuevo en unos minutos.";
  }
});

// Oculta el botón fijo del celular cuando el formulario está a la vista
const sticky = document.querySelector(".sticky-cta");
new IntersectionObserver(([en]) => { sticky.style.display = en.isIntersecting ? "none" : ""; }).observe($("pedido"));
