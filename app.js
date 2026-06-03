import { db } from "./firebase-config.js";
import {
  collection, addDoc, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── DATOS REALES ──────────────────────────────────────────────
const CENTRO = [18.4024, -93.2116];

const PUNTOS = [
  { id:"c1", tipo:"reciclaje", nombre:"Chatarra.com",
    lat:18.3986, lng:-93.2140,
    mat:"Plástico PET, cartón, papel, aluminio, cobre, fierro y chatarra",
    horario:"Lun–Vie 8:00–18:00 · Sáb 8:00–15:00", tel:"933 164 4112",
    dir:"Ignacio Ramírez 209, Col. Centro" },
  { id:"c2", tipo:"reciclaje", nombre:"Chatarrera Mendoza 1",
    lat:18.3998, lng:-93.2175,
    mat:"Plástico PET, cartón, papel, aluminio, cobre, fierro y chatarra",
    horario:"Lun–Vie 8:00–18:00 · Sáb 8:00–15:00", tel:"",
    dir:"C. 8 de Octubre 316, El Limón" },
  { id:"c3", tipo:"reciclaje", nombre:"Chatarrera Guanajay",
    lat:18.4342, lng:-93.1887,
    mat:"Plástico PET, cartón, papel, aluminio, cobre, fierro y chatarra",
    horario:"Lun–Vie 8:00–18:00 · Sáb 8:30–15:00", tel:"",
    dir:"Los Pescadores, Puerto Ceiba" },
  { id:"c4", tipo:"reciclaje", nombre:"Consorcio EMCRO, S.A. de C.V.",
    lat:18.3800, lng:-93.2300,
    mat:"Plástico, cartón, aluminio, cobre, fierro · vidrio bajo pedido",
    horario:"Servicio 24 horas", tel:"933 688 5861",
    dir:"Ranchería Moctezuma 3ra Sección" },
  { id:"c5", tipo:"reciclaje", nombre:"Basurero Municipal",
    lat:18.3600, lng:-93.2500,
    mat:"Disposición final de residuos sólidos",
    horario:"Servicio municipal continuo", tel:"",
    dir:"Zona municipal de disposición de residuos" },
  { id:"r1", tipo:"ruta", nombre:"Ruta diaria — Col. Centro",
    lat:18.4030, lng:-93.2100,
    colonias:"Col. Centro",
    horario:"Todos los días 7:00 pm – 2:00 am", dias:"todos" },
  { id:"r2", tipo:"ruta", nombre:"Ruta diaria — Blvd. Romero Zurita",
    lat:18.4018, lng:-93.2085,
    colonias:"Blvd. Manuel Antonio Romero Zurita",
    horario:"Todos los días 7:00 am – 2:00 pm", dias:"todos" },
  { id:"r3", tipo:"ruta", nombre:"Ruta Lun/Mié/Vie — Las Flores",
    lat:18.4060, lng:-93.2130,
    colonias:"Las Flores 1a y 2a, Col. Adalberto Santos, Campamento, Libramiento Santandreu–Refinería, El Coquito, Col. Petrolera, La Montañita, Colonia El Limón, Los Milla",
    horario:"7:00 am – 2:00 pm", dias:"lmv" },
  { id:"r4", tipo:"ruta", nombre:"Ruta Lun/Mié/Vie — Moctezuma / Quintín Arauz",
    lat:18.3970, lng:-93.2100,
    colonias:"Moctezuma 1a y 2a, El Hormiguero, Potreritos, San Francisco, La Revancha, Madero 1a–3a, Carr. Federal Oriente 2a, Nicolás Bravo 1a 2a 4ta 5ta, Col. Quintín Arauz, Carrizal",
    horario:"7:00 am – 2:00 pm", dias:"lmv" },
  { id:"r5", tipo:"ruta", nombre:"Ruta Lun/Mié/Vie — Puerto Ceiba / El Bellote",
    lat:18.4300, lng:-93.1900,
    colonias:"Villa Puerto Ceiba, La Madrid, El Bellote, Pénjamo, Chiltepec, Aquiles Serdán",
    horario:"7:00 am – 2:00 pm", dias:"lmv" },
  { id:"r6", tipo:"ruta", nombre:"Ruta Mar/Jue/Sáb — El Escribano / Rinconada",
    lat:18.4110, lng:-93.2060,
    colonias:"El Escribano, La Rinconada, Las Flores 3a, Resto Las Flores 2a, Carr. Fed. Col. Magisterial–Ceiba, Samanes, Villa Puerto Ceiba, Torno Largo, La Madrid, Ejido Banco, Secc. Tanques",
    horario:"7:00 am – 2:00 pm", dias:"mjs" },
  { id:"r7", tipo:"ruta", nombre:"Ruta Mar/Jue/Sáb — Ifortab / Moctezuma",
    lat:18.3855, lng:-93.2195,
    colonias:"Entrada de los Moctezuma, Hueso de Puerco, Entrada a Ifortab, Los Prats, Nueva Esperanza, Santo Tomás, El Bambú, Pijijes, Chemón, La Islita, Carr. Fed. Tienditas–Camellones–Madero",
    horario:"7:00 am – 2:00 pm", dias:"mjs" },
  { id:"r8", tipo:"ruta", nombre:"Ruta Mar/Jue/Sáb — Las Palmas / Los Cocos",
    lat:18.3905, lng:-93.1960,
    colonias:"Nicolás Bravo 3a, Libertad 1a y 2a, Blancas Mariposas, Monte Adentro, Carr. Las Palmas y zonas aledañas, Fonhapo, Los Mangos, Deportiva, Ejido Quintín Arauz, Fracc. Las Palmas, Los Cocos 1 y 2, Nueva Venecia, La Continuidad",
    horario:"7:00 am – 2:00 pm", dias:"mjs" },
];

const RUTAS_DATA = {
  lmv:[
    { nombre:"Las Flores / El Limón / Campamento",
      colonias:"Las Flores 1a y 2a, Col. Adalberto Santos, Campamento y población cercana, Libramiento (Santandreu hasta la Refinería), El Coquito, Col. Petrolera, La Montañita, Colonia El Limón, Los Milla",
      horario:"7:00 am – 2:00 pm" },
    { nombre:"Moctezuma / Quintín Arauz / Carrizal",
      colonias:"Moctezuma 1a y 2a, El Hormiguero, Potreritos, San Francisco, La Revancha, Madero 1a 2a y 3a, Carretera Federal Oriente 2a hasta desviación, Nicolás Bravo 1a 2a 4ta y 5ta, Col. Quintín Arauz, Carrizal",
      horario:"7:00 am – 2:00 pm" },
    { nombre:"Puerto Ceiba / El Bellote / Pénjamo",
      colonias:"Villa Puerto Ceiba, La Madrid, El Bellote, Pénjamo, Chiltepec, Aquiles Serdán",
      horario:"7:00 am – 2:00 pm" },
  ],
  mjs:[
    { nombre:"El Escribano / La Rinconada / Samanes",
      colonias:"El Escribano, La Rinconada, Resto de Las Flores 2a, Las Flores 3a, Carr. Fed. Col. Magisterial a entrada a Ceiba, Samanes, Villa Puerto Ceiba, Torno Largo, La Madrid, Ejido Banco, Secc. Tanques",
      horario:"7:00 am – 2:00 pm" },
    { nombre:"Moctezuma / Ifortab / El Bambú",
      colonias:"Entrada de los Moctezuma, Hueso de Puerco, Entrada a Ifortab, Entrada a los Prats, Nueva Esperanza, Santo Tomás, El Bambú, Pijijes, Chemón, La Islita, Carr. Fed. Tienditas Camellones y entradas Madero",
      horario:"7:00 am – 2:00 pm" },
    { nombre:"Las Palmas / Los Cocos / Deportiva",
      colonias:"Nicolás Bravo 3a, Libertad 1a y 2a, Blancas Mariposas, Monte Adentro, Carr. a Las Palmas y zonas aledañas, Fonhapo, Los Mangos, Deportiva, Ejido Quintín Arauz, Fracc. Las Palmas, Los Cocos 1 y 2 y Nueva Venecia, La Continuidad",
      horario:"7:00 am – 2:00 pm" },
  ]
};

const GUIA_DATA = [
  { clase:"g-plastico", icono:"fa-bottle-water", nombre:"Plástico PET",
    tips:["Enjuaga botellas y envases","Aplana para ahorrar espacio","Retira tapas y etiquetas","Acepta: PET, PEAD, PP"], keywords:"plastico botella envase pet" },
  { clase:"g-vidrio", icono:"fa-wine-bottle", nombre:"Vidrio",
    tips:["Enjuaga bien los envases","No mezcles con cerámica","Lleva sin romper al acopio","Algunos centros piden volumen mínimo"], keywords:"vidrio botella frasco cristal" },
  { clase:"g-carton", icono:"fa-box", nombre:"Cartón y papel",
    tips:["Dobla las cajas planas","No incluyas papel mojado o sucio","Retira cinta adhesiva","Separa del plástico y vidrio"], keywords:"carton papel caja periodico revista" },
  { clase:"g-pilas", icono:"fa-battery-half", nombre:"Pilas y baterías",
    tips:["NUNCA tires al bote común","Guárdalas en bolsa sellada","Lleva a punto de acopio especial","Tipos: AA, AAA, botón, recargables"], keywords:"pilas bateria battery celda" },
  { clase:"g-elec", icono:"fa-laptop", nombre:"Electrónicos (RAEE)",
    tips:["Borra tus datos antes de entregar","No desmontes los aparatos","Lleva completos al centro de acopio","Acepta: celulares, laptops, cables"], keywords:"electronicos celular laptop computadora cable cargador" },
  { clase:"g-aceite", icono:"fa-oil-can", nombre:"Aceite usado",
    tips:["Guarda en botella plástica cerrada","NUNCA al drenaje: 1L contamina 1M de litros de agua","Lleva al DIF municipal miércoles y viernes 9–13h","No mezcles con otros líquidos"], keywords:"aceite cocina grasa fritura" },
  { clase:"g-ropa", icono:"fa-shirt", nombre:"Ropa y textiles",
    tips:["Lava antes de donar","Dobla y empaca en bolsa","Separa lo que sirve de lo que no","Lleva a centros de acopio de ropa usada"], keywords:"ropa textil zapato tela donacion" },
  { clase:"g-metal", icono:"fa-wrench", nombre:"Metales y chatarra",
    tips:["Separa por tipo: aluminio, cobre, fierro","Retira plásticos adheridos","Lleva a chatarrera — te pueden pagar","Chatarras grandes: Consorcio EMCRO tel. 933 688 5861"], keywords:"metal chatarra aluminio cobre fierro lata" },
];

const TIPO_CFG = {
  reciclaje:{ color:"#4A8C2A", pulse:"#7ABF3A", emoji:"♻️", label:"Acopio / Reciclaje" },
  ruta:     { color:"#0F6E56", pulse:"#1D9E75", emoji:"🚛", label:"Ruta de recolección" },
  pilas:    { color:"#BA7517", pulse:"#EF9F27", emoji:"🔋", label:"Pilas" },
  tiradero: { color:"#A32D2D", pulse:"#E24B4A", emoji:"⚠️", label:"Tiradero reportado" },
};

// ── LOADER ────────────────────────────────────────────────────
const loaderMsgs = ["Cargando mapa...","Ubicando centros de acopio...","Trazando rutas de recolección...","Conectando con Firebase...","¡Listo!"];
let lp = 0;
const loaderInterval = setInterval(()=>{
  lp++;
  const bar = document.getElementById("loaderBar");
  const msg = document.getElementById("loaderMsg");
  if(bar) bar.style.width = (lp*22)+ "%";
  if(msg && loaderMsgs[lp-1]) msg.textContent = loaderMsgs[lp-1];
  if(lp >= 5){ clearInterval(loaderInterval); }
}, 400);

window.addEventListener("load",()=>{
  setTimeout(()=>{
    const l = document.getElementById("loader");
    if(l){ l.classList.add("hide"); setTimeout(()=>l.remove(),600); }
    animateStats();
  }, 2200);
});

function animateStats(){
  document.querySelectorAll(".hstat-n").forEach(el=>{
    const target = parseInt(el.dataset.target);
    let curr = 0;
    const step = Math.ceil(target/30);
    const t = setInterval(()=>{
      curr = Math.min(curr+step, target);
      el.textContent = curr + (target>=60?"+":"");
      if(curr>=target) clearInterval(t);
    }, 40);
  });
}

// ── PARTÍCULAS HERO ───────────────────────────────────────────
const pc = document.getElementById("particles");
if(pc){
  for(let i=0;i<25;i++){
    const p = document.createElement("div");
    p.className = "particle";
    p.style.left = Math.random()*100+"%";
    p.style.setProperty("--dur", (4+Math.random()*6)+"s");
    p.style.setProperty("--delay", (Math.random()*8)+"s");
    pc.appendChild(p);
  }
}

// ── NAVBAR SCROLL ─────────────────────────────────────────────
window.addEventListener("scroll",()=>{
  document.getElementById("navbar")?.classList.toggle("scrolled", window.scrollY>60);
  const sections = document.querySelectorAll("section[id]");
  const links = document.querySelectorAll(".nav-link");
  sections.forEach(s=>{
    const r = s.getBoundingClientRect();
    if(r.top<=80 && r.bottom>=80){
      links.forEach(l=>l.classList.remove("active"));
      const a = document.querySelector(`.nav-link[href="#${s.id}"]`);
      if(a) a.classList.add("active");
    }
  });
});

// ── MAPA LEAFLET ──────────────────────────────────────────────
const map = L.map("map",{ zoomControl:true }).setView(CENTRO, 13);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
  attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom:19
}).addTo(map);

let miniMap = null;
let todosMarkers = [];
let filtroActivo = "todos";

function crearIcono(tipo){
  const c = TIPO_CFG[tipo] || TIPO_CFG.reciclaje;
  if(tipo==="ruta"){
    return L.divIcon({ className:"",
      html:`<div style="background:${c.color};width:32px;height:32px;border-radius:6px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.3);font-size:15px">🚛</div>`,
      iconSize:[32,32], iconAnchor:[16,32], popupAnchor:[0,-34] });
  }
  return L.divIcon({ className:"",
    html:`<div style="position:relative;width:36px;height:36px">
      <div style="position:absolute;inset:0;background:${c.pulse};border-radius:50%;opacity:.35;animation:ripple 1.8s infinite"></div>
      <div style="position:absolute;top:4px;left:4px;width:28px;height:28px;background:${c.color};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,.3)">${c.emoji}</div>
    </div>
    <style>@keyframes ripple{0%,100%{transform:scale(1);opacity:.35}50%{transform:scale(1.5);opacity:.1}}</style>`,
    iconSize:[36,36], iconAnchor:[18,36], popupAnchor:[0,-38] });
}

function popupHTML(d){
  const c = TIPO_CFG[d.tipo] || TIPO_CFG.reciclaje;
  let rows = "";
  if(d.mat)      rows+=`<div class="popup-row"><i class="fa-solid fa-box-open"></i><span>${d.mat}</span></div>`;
  if(d.horario)  rows+=`<div class="popup-row"><i class="fa-solid fa-clock"></i><span>${d.horario}</span></div>`;
  if(d.tel)      rows+=`<div class="popup-row"><i class="fa-solid fa-phone"></i><span class="popup-tel">${d.tel}</span></div>`;
  if(d.dir)      rows+=`<div class="popup-row"><i class="fa-solid fa-location-dot"></i><span>${d.dir}</span></div>`;
  if(d.colonias) rows+=`<div class="popup-row"><i class="fa-solid fa-map"></i><span>${d.colonias}</span></div>`;
  if(d.descripcion) rows+=`<div class="popup-row"><i class="fa-solid fa-comment"></i><span>${d.descripcion}</span></div>`;
  if(d.fotoURL)  rows+=`<img src="${d.fotoURL}" class="popup-foto" alt="Foto"/>`;
  if(d.tipo==="tiradero") rows+=`<div class="popup-row" style="margin-top:6px"><i class="fa-solid fa-phone" style="color:#A32D2D"></i><span style="color:#A32D2D;font-weight:600">Reportar al municipio: 933 136 3054</span></div>`;
  return `<div class="popup-titulo">${d.nombre||"Punto reportado"}</div>
    <span class="popup-tipo" style="background:${c.color}20;color:${c.color}">${c.emoji} ${c.label}</span>
    ${rows}`;
}

function agregarAlMapa(d){
  const m = L.marker([d.lat,d.lng],{icon:crearIcono(d.tipo)});
  m.bindPopup(popupHTML(d),{maxWidth:290,maxHeight:380});
  m.addTo(map);
  todosMarkers.push({datos:d, marker:m});
  return m;
}

// Cargar puntos base
PUNTOS.forEach(p=>agregarAlMapa(p));
actualizarLista();

// Firebase: escuchar reportes en tiempo real
const reportesRef = collection(db,"reportes");
onSnapshot(reportesRef,(snap)=>{
  snap.docChanges().forEach(ch=>{
    if(ch.type==="added"){
      const d = ch.doc.data();
      if(d.lat && d.lng){
        agregarAlMapa({ nombre:d.nombre?`Reporte: ${d.nombre}`:"Reporte ciudadano",
          tipo:"tiradero", lat:d.lat, lng:d.lng,
          colonia:d.colonia||"", descripcion:d.descripcion||"", fotoURL:d.fotoURL||null });
      }
    }
  });
  actualizarLista();
});

// ── FILTROS ───────────────────────────────────────────────────
document.querySelectorAll(".filtro-btn").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelector(".filtro-btn.active")?.classList.remove("active");
    btn.classList.add("active");
    filtroActivo = btn.dataset.tipo;
    aplicarFiltro();
    actualizarLista();
  });
});

function aplicarFiltro(){
  todosMarkers.forEach(({datos,marker})=>{
    (filtroActivo==="todos"||datos.tipo===filtroActivo) ? marker.addTo(map) : map.removeLayer(marker);
  });
}

function actualizarLista(){
  const lista = document.getElementById("listaPuntos");
  const busq = (document.getElementById("searchInput")?.value||"").toLowerCase();
  const vis = todosMarkers.filter(({datos})=>{
    const tipoOk = filtroActivo==="todos"||datos.tipo===filtroActivo;
    const busqOk = !busq || (datos.nombre+datos.dir+datos.colonias+"").toLowerCase().includes(busq);
    return tipoOk && busqOk;
  });
  if(!vis.length){
    lista.innerHTML=`<div class="lista-loading">Sin resultados</div>`;
    return;
  }
  lista.innerHTML = vis.map(({datos},i)=>{
    const c = TIPO_CFG[datos.tipo]||TIPO_CFG.reciclaje;
    const sub = datos.dir||datos.colonias?.split(",")[0]||"";
    return `<div class="punto-item" data-i="${i}" style="animation-delay:${i*0.05}s">
      <div class="punto-nombre">${datos.nombre}</div>
      <span class="punto-tipo tipo-${datos.tipo}">${c.emoji} ${c.label}</span>
      ${sub?`<div style="font-size:.72rem;color:#888;margin-top:3px">📍 ${sub}</div>`:""}
    </div>`;
  }).join("");
  lista.querySelectorAll(".punto-item").forEach((el,i)=>{
    el.addEventListener("click",()=>{
      const p = vis[i];
      map.setView([p.datos.lat,p.datos.lng],16,{animate:true});
      setTimeout(()=>p.marker.openPopup(),350);
    });
  });
}

document.getElementById("searchInput")?.addEventListener("input",actualizarLista);

// ── RUTAS ─────────────────────────────────────────────────────
let rutaTab = "lmv";
renderRutas();

document.querySelectorAll(".rtab").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelector(".rtab.active")?.classList.remove("active");
    btn.classList.add("active");
    rutaTab = btn.dataset.rt;
    renderRutas();
  });
});

function renderRutas(){
  const g = document.getElementById("rutasGrid");
  if(!g) return;
  g.innerHTML = RUTAS_DATA[rutaTab].map((r,i)=>`
    <div class="ruta-card" style="animation-delay:${i*0.1}s">
      <h4><i class="fa-solid fa-route"></i>${r.nombre}</h4>
      <div class="ruta-horario"><i class="fa-solid fa-clock"></i> ${r.horario}</div>
      <div class="ruta-colonias">${r.colonias}</div>
    </div>`).join("");
}

// ── GUÍA ──────────────────────────────────────────────────────
const guiaGrid = document.getElementById("guiaGrid");
if(guiaGrid){
  guiaGrid.innerHTML = GUIA_DATA.map((g,i)=>`
    <div class="guia-card" data-kw="${g.keywords}" style="animation-delay:${i*0.07}s">
      <div class="guia-icon ${g.clase}"><i class="fa-solid ${g.icono}"></i></div>
      <h4>${g.nombre}</h4>
      <ul>${g.tips.map(t=>`<li>${t}</li>`).join("")}</ul>
    </div>`).join("");
}

document.getElementById("guiaBuscar")?.addEventListener("input",function(){
  const q = this.value.toLowerCase();
  document.querySelectorAll(".guia-card").forEach(c=>{
    c.classList.toggle("hidden-card", q && !c.dataset.kw.includes(q));
  });
});

// ── FORMULARIO ────────────────────────────────────────────────
let coordsGPS = null;

document.getElementById("btnGPS")?.addEventListener("click",()=>{
  const st = document.getElementById("gpsStatus");
  const mm = document.getElementById("miniMap");
  st.textContent = "Obteniendo ubicación...";
  if(!navigator.geolocation){ st.textContent="Tu navegador no soporta GPS."; return; }
  navigator.geolocation.getCurrentPosition(pos=>{
    coordsGPS = { lat:pos.coords.latitude, lng:pos.coords.longitude };
    st.textContent = `✅ ${coordsGPS.lat.toFixed(5)}, ${coordsGPS.lng.toFixed(5)}`;
    if(mm){
      mm.classList.remove("hidden");
      if(!miniMap){
        miniMap = L.map(mm,{zoomControl:false,dragging:false,scrollWheelZoom:false}).setView([coordsGPS.lat,coordsGPS.lng],15);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19}).addTo(miniMap);
        L.marker([coordsGPS.lat,coordsGPS.lng]).addTo(miniMap);
      }
    }
    map.setView([coordsGPS.lat,coordsGPS.lng],15);
    document.getElementById("mapa")?.scrollIntoView({behavior:"smooth"});
  }, ()=>{ st.textContent="No se pudo obtener ubicación. Verifica permisos."; });
});

document.getElementById("inp-foto")?.addEventListener("change",e=>{
  const file = e.target.files[0];
  if(!file) return;
  const pv = document.getElementById("previewFoto");
  pv.innerHTML=`<img src="${URL.createObjectURL(file)}" alt="Preview"/>`;
  pv.classList.remove("hidden");
});

document.getElementById("btnEnviar")?.addEventListener("click",async()=>{
  const btn  = document.getElementById("btnEnviar");
  const nombre = document.getElementById("inp-nombre").value.trim()||"Anónimo";
  const colonia = document.getElementById("inp-colonia").value.trim();
  const desc  = document.getElementById("inp-desc").value.trim();
  const foto  = document.getElementById("inp-foto");

  if(!colonia){ showMsg("Indica la colonia o zona.","error"); return; }
  if(!desc)   { showMsg("Describe el problema.","error"); return; }
  if(!coordsGPS){ showMsg("Obtén tu ubicación GPS primero.","error"); return; }

  btn.disabled=true;
  btn.innerHTML=`<i class="fa-solid fa-spinner fa-spin"></i> Enviando...`;

  try{
    let fotoURL=null; // Storage desactivado — sin foto
    await addDoc(reportesRef,{
      nombre,colonia,descripcion:desc,
      lat:coordsGPS.lat, lng:coordsGPS.lng,
      fotoURL, fecha:serverTimestamp()
    });
    showMsg("✅ ¡Reporte enviado! Ya aparece en el mapa.","exito");
    document.getElementById("inp-nombre").value="";
    document.getElementById("inp-colonia").value="";
    document.getElementById("inp-desc").value="";
    foto.value="";
    document.getElementById("previewFoto").innerHTML="";
    document.getElementById("previewFoto").classList.add("hidden");
    document.getElementById("gpsStatus").textContent="";
    coordsGPS=null;
  }catch(err){
    console.error(err);
    showMsg("Error al enviar. Intenta de nuevo.","error");
  }
  btn.disabled=false;
  btn.innerHTML=`<i class="fa-solid fa-paper-plane"></i> Enviar reporte al mapa`;
});

function showMsg(txt,tipo){
  const m=document.getElementById("msgEnvio");
  m.textContent=txt; m.className=`msg-envio msg-${tipo}`;
  m.classList.remove("hidden");
  setTimeout(()=>m.classList.add("hidden"),5000);
}

// ── INTERSECTION OBSERVER ANIMACIONES ────────────────────────
const io = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting) e.target.style.opacity="1";
  });
},{threshold:0.1});
document.querySelectorAll(".guia-card,.ruta-card,.punto-item").forEach(el=>{
  el.style.opacity="0";
  io.observe(el);
});

// ── AVISOS MUNICIPALES EN TIEMPO REAL ────────────────────────
const AVISO_CFG = {
  info:       { icon:"fa-circle-info",         clase:"aviso-info" },
  alerta:     { icon:"fa-triangle-exclamation", clase:"aviso-alerta" },
  suspension: { icon:"fa-truck",               clase:"aviso-suspension" },
  nuevo:      { icon:"fa-circle-check",        clase:"aviso-nuevo" },
};

onSnapshot(collection(db, "avisos"), (snap) => {
  const lista = document.getElementById("avisosPublicList");
  const count = document.getElementById("avisosCount");
  if (!lista) return;

  const avisos = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  if (!avisos.length) {
    lista.innerHTML = `<div class="avisos-empty"><i class="fa-solid fa-check-circle"></i> Sin avisos activos por el momento</div>`;
    if (count) count.style.display = "none";
    return;
  }

  if (count) {
    count.textContent = avisos.length + (avisos.length === 1 ? " aviso" : " avisos");
    count.style.display = "inline";
  }

  lista.innerHTML = avisos.map((a, i) => {
    const cfg = AVISO_CFG[a.tipo] || AVISO_CFG.info;
    const fechaStr = a.fecha ? `Válido hasta: ${a.fecha}` : "";
    return `<div class="aviso-pub-card ${cfg.clase}" style="animation-delay:${i*0.08}s">
      <div class="aviso-pub-icon"><i class="fa-solid ${cfg.icon}"></i></div>
      <div class="aviso-pub-body">
        <div class="aviso-pub-titulo">${a.titulo}</div>
        <div class="aviso-pub-msg">${a.msg}</div>
        ${fechaStr ? `<div class="aviso-pub-fecha"><i class="fa-solid fa-calendar" style="font-size:.65rem;margin-right:3px"></i>${fechaStr}</div>` : ""}
      </div>
    </div>`;
  }).join("");
});
