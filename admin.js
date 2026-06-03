import { db } from "./firebase-config.js";
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, serverTimestamp, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const auth = getAuth();

// ── PUNTOS BASE (los mismos del mapa público) ─────────────────
const PUNTOS_BASE = [
  { id:"c1", nombre:"Chatarra.com", tipo:"reciclaje",
    dir:"Ignacio Ramírez 209, Col. Centro", tel:"933 164 4112",
    horario:"Lun–Vie 8–18h · Sáb 8–15h",
    mat:"Plástico, cartón, aluminio, cobre, fierro" },
  { id:"c2", nombre:"Chatarrera Mendoza 1", tipo:"reciclaje",
    dir:"C. 8 de Octubre 316, El Limón", tel:"",
    horario:"Lun–Vie 8–18h · Sáb 8–15h",
    mat:"Plástico, cartón, aluminio, cobre, fierro" },
  { id:"c3", nombre:"Chatarrera Guanajay", tipo:"reciclaje",
    dir:"Los Pescadores, Puerto Ceiba", tel:"",
    horario:"Lun–Vie 8–18h · Sáb 8:30–15h",
    mat:"Plástico, cartón, aluminio, cobre, fierro" },
  { id:"c4", nombre:"Consorcio EMCRO, S.A. de C.V.", tipo:"reciclaje",
    dir:"Ranchería Moctezuma 3ra Sección", tel:"933 688 5861",
    horario:"Servicio 24 horas",
    mat:"Plástico, cartón, aluminio, cobre, fierro, vidrio bajo pedido" },
  { id:"c5", nombre:"Basurero Municipal", tipo:"reciclaje",
    dir:"Zona municipal de disposición de residuos", tel:"",
    horario:"Servicio municipal", mat:"Disposición final de residuos sólidos" },
];

const TIPO_COLOR = {
  reciclaje:"#4A8C2A", ruta:"#0F6E56",
  pilas:"#BA7517", electronicos:"#185FA5",
  aceite:"#854F0B", tiradero:"#A32D2D"
};

// ── ESTADO GLOBAL ─────────────────────────────────────────────
let allReportes = [];
let allAvisos   = [];
let puntosExtra = [];
let chartPie = null, chartBar = null;

// ── LOGIN ─────────────────────────────────────────────────────
onAuthStateChanged(auth, user => {
  if (user) {
    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");
    const initials = (user.email||"A")[0].toUpperCase();
    document.getElementById("sbAvatar").textContent = initials;
    document.getElementById("sbEmail").textContent = user.email;
    initDashboard();
  } else {
    document.getElementById("loginScreen").classList.remove("hidden");
    document.getElementById("dashboard").classList.add("hidden");
  }
});

document.getElementById("btnLogin").addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value.trim();
  const pass  = document.getElementById("loginPass").value;
  const errEl = document.getElementById("loginError");
  const btn   = document.getElementById("btnLogin");
  errEl.classList.add("hidden");
  if (!email || !pass) { showLoginError("Ingresa correo y contraseña."); return; }
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Entrando...`;
  btn.disabled = true;
  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch (e) {
    const msgs = {
      "auth/invalid-credential":"Correo o contraseña incorrectos.",
      "auth/user-not-found":"Usuario no encontrado.",
      "auth/wrong-password":"Contraseña incorrecta.",
      "auth/too-many-requests":"Demasiados intentos. Espera unos minutos.",
    };
    showLoginError(msgs[e.code] || "Error al iniciar sesión. Verifica tus datos.");
  }
  btn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> Entrar`;
  btn.disabled = false;
});

document.getElementById("loginPass").addEventListener("keydown", e => {
  if (e.key === "Enter") document.getElementById("btnLogin").click();
});

document.getElementById("passToggle").addEventListener("click", () => {
  const inp = document.getElementById("loginPass");
  const ico = document.querySelector("#passToggle i");
  inp.type = inp.type === "password" ? "text" : "password";
  ico.className = inp.type === "password" ? "fa-solid fa-eye" : "fa-solid fa-eye-slash";
});

document.getElementById("btnLogout").addEventListener("click", () => signOut(auth));

function showLoginError(msg) {
  const el = document.getElementById("loginError");
  el.textContent = msg;
  el.classList.remove("hidden");
}

// ── NAVEGACIÓN ────────────────────────────────────────────────
const TITULOS = {
  resumen:"Resumen", reportes:"Reportes ciudadanos",
  puntos:"Centros de acopio", avisos:"Avisos municipales",
  estadisticas:"Estadísticas"
};

document.querySelectorAll(".sb-item").forEach(btn => {
  btn.addEventListener("click", () => {
    const view = btn.dataset.view;
    document.querySelectorAll(".sb-item").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    document.getElementById(`view-${view}`).classList.add("active");
    document.getElementById("topbarTitle").textContent = TITULOS[view];
    if (view === "estadisticas") renderEstadisticas();
    document.getElementById("sidebar").classList.remove("open");
  });
});

document.getElementById("menuToggle").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("open");
});

// ── INIT ──────────────────────────────────────────────────────
function initDashboard() {
  escucharReportes();
  escucharAvisos();
  renderPuntos();
}

// ── REPORTES – TIEMPO REAL ────────────────────────────────────
function escucharReportes() {
  const q = query(collection(db, "reportes"), orderBy("fecha", "desc"));
  onSnapshot(q, snap => {
    allReportes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    actualizarStats();
    renderReportesMini();
    renderTablaReportes();
    actualizarBadge();
    if (chartPie) actualizarPie();
  });
}

function actualizarStats() {
  const total     = allReportes.length;
  const pendientes= allReportes.filter(r => !r.estado || r.estado === "pendiente").length;
  const resueltos = allReportes.filter(r => r.estado === "resuelto").length;
  setEl("statTotal",     total);
  setEl("statPendientes",pendientes);
  setEl("statResueltos", resueltos);
  setEl("statPuntos",    PUNTOS_BASE.length + puntosExtra.length);
}

function actualizarBadge() {
  const p = allReportes.filter(r => !r.estado || r.estado === "pendiente").length;
  const b = document.getElementById("badgeReportes");
  b.textContent = p;
  b.style.display = p > 0 ? "flex" : "none";
}

function renderReportesMini() {
  const cont = document.getElementById("reportesMini");
  const recientes = allReportes.slice(0, 5);
  if (!recientes.length) { cont.innerHTML = `<p style="padding:1rem;color:#aaa;font-size:.82rem;text-align:center">Sin reportes aún</p>`; return; }
  cont.innerHTML = recientes.map(r => {
    const color = r.estado === "resuelto" ? "#4A8C2A" : r.estado === "proceso" ? "#185FA5" : "#BA7517";
    const fecha = r.fecha?.toDate ? formatFecha(r.fecha.toDate()) : "—";
    return `<div class="rm-item" onclick="irAReporte('${r.id}')">
      <div class="rm-dot" style="background:${color}"></div>
      <div class="rm-body">
        <div class="rm-colonia">${r.colonia || "Sin colonia"}</div>
        <div class="rm-desc">${r.descripcion || "Sin descripción"}</div>
      </div>
      <div class="rm-fecha">${fecha}</div>
    </div>`;
  }).join("");
}

function renderTablaReportes() {
  const tbody   = document.getElementById("reportesBody");
  const empty   = document.getElementById("tableEmpty");
  const filtro  = document.getElementById("filtroEstado")?.value || "todos";
  const buscar  = (document.getElementById("buscarReporte")?.value || "").toLowerCase();

  let datos = allReportes.filter(r => {
    const estadoOk = filtro === "todos" || (r.estado || "pendiente") === filtro;
    const busqOk   = !buscar || (r.colonia + r.descripcion + r.nombre + "").toLowerCase().includes(buscar);
    return estadoOk && busqOk;
  });

  if (!datos.length) {
    tbody.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");

  tbody.innerHTML = datos.map(r => {
    const estado  = r.estado || "pendiente";
    const fecha   = r.fecha?.toDate ? formatFecha(r.fecha.toDate()) : "—";
    const fotoHTML= r.fotoURL
      ? `<img src="${r.fotoURL}" class="foto-thumb" alt="Foto"/>`
      : `<div class="foto-placeholder"><i class="fa-solid fa-image"></i></div>`;
    return `<tr data-id="${r.id}">
      <td>${fotoHTML}</td>
      <td><strong>${r.colonia || "—"}</strong></td>
      <td style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.descripcion || "—"}</td>
      <td>${r.nombre || "Anónimo"}</td>
      <td style="white-space:nowrap">${fecha}</td>
      <td><span class="estado-badge estado-${estado}">${estadoLabel(estado)}</span></td>
      <td>
        <div class="acciones">
          ${estado !== "proceso"  ? `<button class="btn-accion btn-proceso"  onclick="cambiarEstado('${r.id}','proceso')"><i class="fa-solid fa-spinner"></i> En proceso</button>` : ""}
          ${estado !== "resuelto" ? `<button class="btn-accion btn-resuelto" onclick="cambiarEstado('${r.id}','resuelto')"><i class="fa-solid fa-check"></i> Resuelto</button>` : ""}
          <button class="btn-accion btn-eliminar" onclick="eliminarReporte('${r.id}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>`;
  }).join("");
}

window.cambiarEstado = async (id, estado) => {
  await updateDoc(doc(db, "reportes", id), { estado });
};

window.eliminarReporte = async id => {
  if (!confirm("¿Eliminar este reporte del mapa? Esta acción no se puede deshacer.")) return;
  await deleteDoc(doc(db, "reportes", id));
};

window.irAReporte = id => {
  document.querySelector('[data-view="reportes"]').click();
  setTimeout(() => {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (row) { row.scrollIntoView({behavior:"smooth",block:"center"}); row.style.background="#f0fff0"; setTimeout(()=>row.style.background="",1500); }
  }, 200);
};

document.getElementById("filtroEstado")?.addEventListener("change", renderTablaReportes);
document.getElementById("buscarReporte")?.addEventListener("input", renderTablaReportes);

// Exportar CSV
document.getElementById("btnExport")?.addEventListener("click", () => {
  const rows = [["ID","Colonia","Descripción","Ciudadano","Latitud","Longitud","Estado","Fecha"]];
  allReportes.forEach(r => {
    rows.push([
      r.id, r.colonia||"", r.descripcion||"", r.nombre||"Anónimo",
      r.lat||"", r.lng||"", r.estado||"pendiente",
      r.fecha?.toDate ? r.fecha.toDate().toLocaleDateString("es-MX") : ""
    ]);
  });
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF"+csv], {type:"text/csv;charset=utf-8;"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `reportes_ecomapa_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
});

// ── PUNTOS ────────────────────────────────────────────────────
function renderPuntos() {
  const grid = document.getElementById("puntosGrid");
  const todos = [...PUNTOS_BASE, ...puntosExtra];
  grid.innerHTML = todos.map(p => {
    const color = TIPO_COLOR[p.tipo] || "#4A8C2A";
    return `<div class="punto-admin-card">
      <div class="pac-header">
        <div class="pac-dot" style="background:${color}"></div>
        <div class="pac-nombre">${p.nombre}</div>
      </div>
      <div class="pac-info">
        ${p.dir ? `<div><i class="fa-solid fa-location-dot" style="color:${color};width:14px"></i> ${p.dir}</div>` : ""}
        ${p.horario ? `<div><i class="fa-solid fa-clock" style="color:${color};width:14px"></i> ${p.horario}</div>` : ""}
        ${p.tel ? `<div><i class="fa-solid fa-phone" style="color:${color};width:14px"></i> ${p.tel}</div>` : ""}
        ${p.mat ? `<div style="margin-top:4px;color:#888;font-size:.72rem">${p.mat}</div>` : ""}
      </div>
      ${p._firestoreId ? `<div class="pac-actions"><button class="btn-accion btn-eliminar" onclick="eliminarPunto('${p._firestoreId}')"><i class="fa-solid fa-trash"></i> Eliminar</button></div>` : `<div style="font-size:.7rem;color:#aaa;padding-top:.25rem">Punto base · editar en app.js</div>`}
    </div>`;
  }).join("");
}

document.getElementById("btnNuevoPunto")?.addEventListener("click", () => {
  document.getElementById("modalPunto").classList.remove("hidden");
});
document.getElementById("closePunto")?.addEventListener("click",  () => document.getElementById("modalPunto").classList.add("hidden"));
document.getElementById("cancelPunto")?.addEventListener("click", () => document.getElementById("modalPunto").classList.add("hidden"));

document.getElementById("guardarPunto")?.addEventListener("click", async () => {
  const nombre  = document.getElementById("pNombre").value.trim();
  const tipo    = document.getElementById("pTipo").value;
  const lat     = parseFloat(document.getElementById("pLat").value);
  const lng     = parseFloat(document.getElementById("pLng").value);
  const dir     = document.getElementById("pDir").value.trim();
  const mat     = document.getElementById("pMat").value.trim();
  const horario = document.getElementById("pHorario").value.trim();
  const tel     = document.getElementById("pTel").value.trim();
  const msg     = document.getElementById("puntoMsg");

  if (!nombre || isNaN(lat) || isNaN(lng)) {
    msg.textContent = "Nombre, latitud y longitud son obligatorios.";
    msg.className = "msg-envio msg-error"; msg.classList.remove("hidden"); return;
  }
  try {
    const ref = await addDoc(collection(db, "puntos"), { nombre, tipo, lat, lng, dir, mat, horario, tel, fecha: serverTimestamp() });
    puntosExtra.push({ _firestoreId: ref.id, nombre, tipo, lat, lng, dir, mat, horario, tel });
    renderPuntos();
    document.getElementById("modalPunto").classList.add("hidden");
    ["pNombre","pLat","pLng","pDir","pMat","pHorario","pTel"].forEach(id => document.getElementById(id).value = "");
    msg.classList.add("hidden");
  } catch (e) {
    msg.textContent = "Error al guardar. Intenta de nuevo.";
    msg.className = "msg-envio msg-error"; msg.classList.remove("hidden");
  }
});

window.eliminarPunto = async fid => {
  if (!confirm("¿Eliminar este centro de acopio?")) return;
  await deleteDoc(doc(db, "puntos", fid));
  puntosExtra = puntosExtra.filter(p => p._firestoreId !== fid);
  renderPuntos();
};

// ── AVISOS ────────────────────────────────────────────────────
function escucharAvisos() {
  // onSnapshot escucha en tiempo real y también carga el estado inicial
  onSnapshot(collection(db, "avisos"), snap => {
    allAvisos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderAvisos();
  }, err => {
    console.error("Error al escuchar avisos:", err);
  });
}

document.getElementById("btnPublicar")?.addEventListener("click", async () => {
  const tipo   = document.getElementById("avisoTipo").value;
  const titulo = document.getElementById("avisoTitulo").value.trim();
  const msg    = document.getElementById("avisoMsg").value.trim();
  const fecha  = document.getElementById("avisoFecha").value;
  const conf   = document.getElementById("avisoConfirm");

  if (!titulo || !msg) { showAvisoMsg("Título y mensaje son obligatorios.", "error"); return; }
  try {
    await addDoc(collection(db, "avisos"), { tipo, titulo, msg, fecha, creado: serverTimestamp() });
    ["avisoTitulo","avisoMsg","avisoFecha"].forEach(id => document.getElementById(id).value = "");
    showAvisoMsg("✅ Aviso publicado correctamente.", "exito");
  } catch(e) { console.error(e); showAvisoMsg("Error al publicar: " + e.message, "error"); }
});

function renderAvisos() {
  const list = document.getElementById("avisosList");
  if (!allAvisos.length) { list.innerHTML = `<p style="padding:1rem;color:#aaa;font-size:.82rem;text-align:center">No hay avisos publicados</p>`; return; }
  const tipoColors = { info:"#185FA5", alerta:"#BA7517", suspension:"#A32D2D", nuevo:"#4A8C2A" };
  list.innerHTML = allAvisos.map(a => `
    <div class="aviso-item">
      <div class="aviso-tipo-dot" style="background:${tipoColors[a.tipo]||"#888"}"></div>
      <div class="aviso-body">
        <div class="aviso-titulo">${a.titulo}</div>
        <div class="aviso-msg-text">${a.msg}</div>
        ${a.fecha ? `<div class="aviso-fecha">Válido hasta: ${a.fecha}</div>` : ""}
      </div>
      <button class="aviso-del" onclick="eliminarAviso('${a.id}')"><i class="fa-solid fa-trash"></i></button>
    </div>`).join("");
}

window.eliminarAviso = async id => {
  if (!confirm("¿Eliminar este aviso?")) return;
  await deleteDoc(doc(db, "avisos", id));
};

function showAvisoMsg(texto, tipo) {
  const el = document.getElementById("avisoConfirm");
  el.textContent = texto;
  el.className = `msg-envio msg-${tipo}`;
  el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), 4000);
}

// ── ESTADÍSTICAS ──────────────────────────────────────────────
function renderEstadisticas() {
  const ahora = new Date();
  const inicioSemana = new Date(ahora); inicioSemana.setDate(ahora.getDate() - ahora.getDay());
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

  const semana = allReportes.filter(r => r.fecha?.toDate && r.fecha.toDate() >= inicioSemana).length;
  const mes    = allReportes.filter(r => r.fecha?.toDate && r.fecha.toDate() >= inicioMes).length;
  const colonias = new Set(allReportes.map(r => r.colonia).filter(Boolean)).size;
  const resueltos = allReportes.filter(r => r.estado === "resuelto").length;
  const tasa = allReportes.length ? Math.round(resueltos / allReportes.length * 100) : 0;

  setEl("statSemana", semana);
  setEl("statMes", mes);
  setEl("statColonias", colonias);
  setEl("statTasaResol", tasa + "%");

  // Top colonias
  const contColonias = {};
  allReportes.forEach(r => { if (r.colonia) contColonias[r.colonia] = (contColonias[r.colonia]||0) + 1; });
  const topCol = Object.entries(contColonias).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const maxVal = topCol[0]?.[1] || 1;
  document.getElementById("topColonias").innerHTML = topCol.length
    ? topCol.map(([col,n],i) => `
      <div class="top-item">
        <div class="top-rank">${i+1}</div>
        <div class="top-bar-wrap">
          <div class="top-label">${col}</div>
          <div class="top-bar"><div class="top-bar-fill" style="width:${Math.round(n/maxVal*100)}%"></div></div>
        </div>
        <div class="top-count">${n} reporte${n!==1?"s":""}</div>
      </div>`).join("")
    : `<p style="padding:1rem;color:#aaa;font-size:.82rem;text-align:center">Sin datos aún</p>`;

  // Gráfica de barras — últimos 6 meses
  const meses = [], contMes = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
    const sigMes = new Date(ahora.getFullYear(), ahora.getMonth() - i + 1, 1);
    meses.push(d.toLocaleDateString("es-MX", {month:"short", year:"2-digit"}));
    contMes.push(allReportes.filter(r => {
      const f = r.fecha?.toDate?.();
      return f && f >= d && f < sigMes;
    }).length);
  }

  if (chartBar) chartBar.destroy();
  const ctxBar = document.getElementById("chartBar");
  if (ctxBar) {
    chartBar = new Chart(ctxBar, {
      type:"bar",
      data:{ labels:meses, datasets:[{
        label:"Reportes", data:contMes,
        backgroundColor:"#4A8C2A", borderRadius:6, borderSkipped:false
      }]},
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{display:false} },
        scales:{
          x:{ grid:{display:false}, ticks:{color:"#888",font:{size:11}} },
          y:{ grid:{color:"#f0f0f0"}, ticks:{color:"#888",font:{size:11},stepSize:1} }
        }
      }
    });
  }

  actualizarPie();
}

function actualizarPie() {
  const pendientes = allReportes.filter(r => !r.estado || r.estado==="pendiente").length;
  const proceso    = allReportes.filter(r => r.estado==="proceso").length;
  const resueltos  = allReportes.filter(r => r.estado==="resuelto").length;

  if (chartPie) chartPie.destroy();
  const ctx = document.getElementById("chartPie");
  if (!ctx) return;
  chartPie = new Chart(ctx, {
    type:"doughnut",
    data:{
      labels:["Pendientes","En proceso","Resueltos"],
      datasets:[{ data:[pendientes, proceso, resueltos],
        backgroundColor:["#FAEEDA","#E6F1FB","#EAF3DE"],
        borderColor:["#BA7517","#185FA5","#4A8C2A"],
        borderWidth:2 }]
    },
    options:{
      responsive:true, maintainAspectRatio:false, cutout:"65%",
      plugins:{ legend:{ position:"bottom", labels:{ font:{size:11}, padding:12 } } }
    }
  });
}

// ── HELPERS ───────────────────────────────────────────────────
function setEl(id, val) { const el=document.getElementById(id); if(el) el.textContent=val; }
function estadoLabel(e) { return {pendiente:"⏳ Pendiente",proceso:"🔄 En proceso",resuelto:"✅ Resuelto"}[e]||e; }
function formatFecha(d) {
  return d.toLocaleDateString("es-MX",{day:"2-digit",month:"short",year:"2-digit"});
}

// CSS auxiliar para mensajes reutilizado de style.css
const style = document.createElement("style");
style.textContent = `.msg-envio{padding:.6rem .9rem;border-radius:8px;font-size:.82rem;text-align:center}.msg-exito{background:#EAF3DE;color:#27500A}.msg-error{background:#FCEBEB;color:#791F1F}`;
document.head.appendChild(style);
