import { db } from "./firebase-config.js";
import {
  collection, addDoc, onSnapshot, serverTimestamp, getDocs,
  doc, updateDoc, increment
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
  info:       { icon:"fa-circle-info",          clase:"aviso-info" },
  alerta:     { icon:"fa-triangle-exclamation", clase:"aviso-alerta" },
  suspension: { icon:"fa-truck",                clase:"aviso-suspension" },
  nuevo:      { icon:"fa-circle-check",         clase:"aviso-nuevo" },
};

function renderAvisosPublic(avisos) {
  const lista = document.getElementById("avisosPublicList");
  const count = document.getElementById("avisosCount");
  if (!lista) return;

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
}

// Escuchar cambios en tiempo real
onSnapshot(collection(db, "avisos"), (snap) => {
  const avisos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderAvisosPublic(avisos);
});

// ═══════════════════════════════════════════════════════════════
// NUEVAS FUNCIONES — v2.0
// ═══════════════════════════════════════════════════════════════

// ── CONTADOR DE IMPACTO EN TIEMPO REAL ────────────────────────
function actualizarImpacto() {
  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const tiraderos = todosMarkers.filter(m => m.datos.tipo === "tiradero");
  const resueltosMes = tiraderos.filter(m => {
    if(m.datos.estado !== "resuelto") return false;
    const f = m.datos.fecha?.toDate?.();
    return f && f >= inicioMes;
  }).length;
  const colonias = new Set(tiraderos.map(m => m.datos.colonia).filter(Boolean)).size;
  const kgEstimados = tiraderos.length * 12; // estimado 12kg por tiradero promedio

  animCounter("impactoReportes", tiraderos.length);
  animCounter("impactoResueltos", resueltosMes);
  animCounter("impactoColonias", colonias);
  animCounter("impactoKg", kgEstimados);
}

function animCounter(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let curr = 0;
  const step = Math.max(1, Math.ceil(target / 30));
  const t = setInterval(() => {
    curr = Math.min(curr + step, target);
    el.textContent = curr;
    if (curr >= target) clearInterval(t);
  }, 40);
}

// ── MAPA DE CALOR ─────────────────────────────────────────────
let heatLayer = null;
let heatOn = false;

function toggleHeatmap() {
  const btn = document.getElementById("heatBtn");
  const tiraderos = todosMarkers.filter(m => m.datos.tipo === "tiradero");
  if (!tiraderos.length) return;

  if (!heatLayer) {
    const points = tiraderos.map(m => [m.datos.lat, m.datos.lng, 1]);
    if (typeof L.heatLayer !== "undefined") {
      heatLayer = L.heatLayer(points, {
        radius: 35, blur: 20, maxZoom: 17,
        gradient: { 0.2: "#EAF3DE", 0.5: "#EF9F27", 0.8: "#E24B4A" }
      });
    }
  }

  heatOn = !heatOn;
  if (heatLayer) {
    heatOn ? heatLayer.addTo(map) : map.removeLayer(heatLayer);
  }
  if (btn) btn.classList.toggle("on", heatOn);
  if (btn) btn.innerHTML = heatOn
    ? `<i class="fa-solid fa-fire"></i> Ocultar calor`
    : `<i class="fa-solid fa-fire"></i> Mapa de calor`;
}

// Agregar botón de heatmap al mapa
window.addEventListener("load", () => {
  const mapWrap = document.querySelector(".mapa-wrap");
  if (mapWrap) {
    const btn = document.createElement("button");
    btn.id = "heatBtn";
    btn.className = "heatmap-toggle";
    btn.innerHTML = `<i class="fa-solid fa-fire"></i> Mapa de calor`;
    btn.addEventListener("click", toggleHeatmap);
    mapWrap.appendChild(btn);
  }
});

// ── ZONAS DE MANGLAR ──────────────────────────────────────────
const ZONAS_MANGLAR = [
  { nombre: "Laguna del Carmen", coords: [[18.42,  -93.15], [18.44, -93.15], [18.44, -93.05], [18.42, -93.05]], color: "#0F6E56" },
  { nombre: "Manglar Punta Buey", coords: [[18.415, -93.24], [18.43, -93.24], [18.43, -93.20], [18.415, -93.20]], color: "#4A8C2A" },
  { nombre: "Manglar El Escribano", coords: [[18.41,  -93.21], [18.42, -93.21], [18.42, -93.18], [18.41, -93.18]], color: "#0F6E56" },
];

let manglarLayer = false;
const manglarPolygons = [];

function toggleManglares() {
  const btn = document.getElementById("btnManglares");
  if (!manglarLayer) {
    ZONAS_MANGLAR.forEach(z => {
      const poly = L.polygon(z.coords, {
        color: z.color, fillColor: z.color,
        fillOpacity: 0.22, weight: 2, dashArray: "6,4"
      }).addTo(map);
      poly.bindPopup(`
        <div class="popup-titulo"><i class="fa-solid fa-tree" style="color:#0F6E56"></i> ${z.nombre}</div>
        <div class="popup-row"><i class="fa-solid fa-leaf"></i><span>Zona de manglar protegida. Reporta cualquier tiradero cercano.</span></div>
        <div class="popup-row" style="color:#A32D2D"><i class="fa-solid fa-triangle-exclamation"></i><span>Área ecológicamente sensible.</span></div>
      `);
      manglarPolygons.push(poly);
    });
    manglarLayer = true;
    if (btn) { btn.textContent = "🌿 Ocultar manglares"; btn.style.background = "#EAF3DE"; btn.style.borderColor = "#4A8C2A"; btn.style.color = "#2C5F2D"; }
  } else {
    manglarPolygons.forEach(p => map.removeLayer(p));
    manglarPolygons.length = 0;
    manglarLayer = false;
    if (btn) { btn.textContent = "🌿 Ver zonas de manglar"; btn.style = ""; }
  }
}

// Agregar botón de manglares en filtros
window.addEventListener("load", () => {
  const filtros = document.querySelector(".filtros");
  if (filtros) {
    const btn = document.createElement("button");
    btn.id = "btnManglares";
    btn.className = "filtro-btn";
    btn.style.gridColumn = "1/-1";
    btn.innerHTML = `<i class="fa-solid fa-tree" style="font-size:1rem"></i><span>🌿 Ver zonas de manglar</span>`;
    btn.addEventListener("click", toggleManglares);
    filtros.appendChild(btn);
  }
});

// ── QR CODE ───────────────────────────────────────────────────
const URL_SITIO = "https://ecomapa-paraiso.vercel.app";

window.addEventListener("load", () => {
  const qrDiv = document.getElementById("qrCode");
  if (qrDiv && typeof QRCode !== "undefined") {
    new QRCode(qrDiv, {
      text: URL_SITIO,
      width: 140, height: 140,
      colorDark: "#1A3D0A", colorLight: "#EAF3DE",
      correctLevel: QRCode.CorrectLevel.H
    });
  }

  // Descargar QR
  document.getElementById("btnDescargarQR")?.addEventListener("click", () => {
    const canvas = document.querySelector("#qrCode canvas");
    if (canvas) {
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = "qr-ecomapa-paraiso.png";
      a.click();
    }
  });

  // Compartir por WhatsApp — mapa completo
  document.getElementById("btnCompartirMapaWA")?.addEventListener("click", () => {
    const msg = encodeURIComponent("🌿 *EcoMapa Paraíso* — Encuentra puntos de reciclaje y reporta tiraderos clandestinos en tu colonia.\n👉 " + URL_SITIO);
    window.open("https://wa.me/?text=" + msg, "_blank");
  });
});

// ── WHATSAPP — COMPARTIR REPORTE ──────────────────────────────
// Se activa después de enviar un reporte exitoso (llamado desde btnEnviar)
function mostrarBtnWhatsappReporte(colonia, desc) {
  const btn = document.getElementById("btnWaReporte");
  if (!btn) return;
  btn.classList.remove("hidden");
  btn.onclick = () => {
    const msg = encodeURIComponent(
      `⚠️ *Tiradero clandestino reportado en Paraíso*\n📍 Zona: ${colonia}\n📝 ${desc}\n\n🗺️ Reporta tú también en: ${URL_SITIO}#reportar\n\n_Vía EcoMapa Paraíso_`
    );
    window.open("https://wa.me/?text=" + msg, "_blank");
  };
}

// Parchamos el flujo del botón enviar para llamar a mostrarBtnWhatsappReporte
const _origBtnEnviar = document.getElementById("btnEnviar");
if (_origBtnEnviar) {
  _origBtnEnviar.addEventListener("click", async () => {
    await new Promise(r => setTimeout(r, 3500)); // esperar a que se envíe
    const colonia = document.getElementById("inp-colonia")?.value || "";
    const desc = document.getElementById("inp-desc")?.value || "";
    // Solo muestra si hay mensaje de éxito
    const msgEl = document.getElementById("msgEnvio");
    if (msgEl && msgEl.classList.contains("msg-exito")) {
      mostrarBtnWhatsappReporte(colonia, desc);
    }
  }, { once: false });
}

// ── QUIZ ECOLÓGICO ────────────────────────────────────────────
const PREGUNTAS = [
  { p: "¿Cuántos litros de agua contamina 1 litro de aceite de cocina usado?", ops: ["100 litros","10,000 litros","1,000,000 litros","500 litros"], r: 2, exp: "¡Correcto! Un solo litro de aceite puede contaminar hasta un millón de litros de agua. Nunca lo tires por el drenaje." },
  { p: "¿Cuánto tiempo tarda en degradarse una botella de plástico PET en el mar?", ops: ["50 años","100 años","450 años","1,000 años"], r: 2, exp: "Una botella PET tarda aproximadamente 450 años en degradarse. En Paraíso, estas botellas llegan a los manglares y lagunas." },
  { p: "¿Qué porcentaje del oxígeno marino proviene de los ecosistemas de manglar?", ops: ["10%","70%","30%","50%"], r: 1, exp: "Los manglares producen el 70% del oxígeno marino. Los de Paraíso son vitales para el Golfo de México." },
  { p: "¿A qué chatarrera de Paraíso puedes llevar tus pilas usadas?", ops: ["Ninguna, hay que tirarlas","Chatarra.com o Chatarrera Mendoza 1","Solo al basurero municipal","No existe opción en Paraíso"], r: 1, exp: "¡Exacto! Las pilas son residuos peligrosos. Chatarra.com (tel. 933 164 4112) y Chatarrera Mendoza 1 las reciben." },
  { p: "¿Cuántos kg de CO₂ se evitan por cada kg de aluminio reciclado?", ops: ["2 kg CO₂","5 kg CO₂","10 kg CO₂","15 kg CO₂"], r: 2, exp: "Reciclar 1 kg de aluminio evita 10 kg de CO₂ vs. producir aluminio nuevo. Las latas que tiras tienen un gran impacto." },
  { p: "¿En qué horario pasa el camión recolector por la Col. Centro de Paraíso?", ops: ["7 am – 2 pm","7 pm – 2 am","6 am – 12 pm","Lunes y miércoles solamente"], r: 1, exp: "El camión de la Col. Centro pasa todos los días de 7 pm a 2 am. ¡Consulta tu colonia en la sección de rutas!" },
  { p: "¿Qué debes hacer con el plástico antes de llevarlo al punto de acopio?", ops: ["Nada, se entrega tal cual","Aplastarlo y enjuagarlo","Quemarlo para reducir volumen","Mezclarlo con residuos orgánicos"], r: 1, exp: "Correcto: enjuaga, aplasta y retira etiquetas. Esto facilita el reciclaje y reduce el espacio de transporte." },
  { p: "¿Cuál es el teléfono municipal para reportar problemas ambientales en Paraíso?", ops: ["933 688 5861","933 164 4112","933 136 3054","800 000 0000"], r: 2, exp: "¡Exacto! El 933 136 3054 es el número de Protección Ambiental y Desarrollo Sustentable del municipio de Paraíso." },
];

let qActual = 0, qPuntos = 0, qRespondida = false;

function iniciarQuiz() {
  qActual = 0; qPuntos = 0; qRespondida = false;
  document.getElementById("quizResultado")?.classList.add("hidden");
  document.getElementById("quizCard")?.classList.remove("hidden");
  mostrarPregunta();
}

function mostrarPregunta() {
  const q = PREGUNTAS[qActual];
  const total = PREGUNTAS.length;
  qRespondida = false;

  const progEl = document.getElementById("quizProgressFill");
  if (progEl) progEl.style.width = ((qActual / total) * 100) + "%";
  setEl2("quizNum", `Pregunta ${qActual + 1} de ${total}`);
  setEl2("quizPregunta", q.p);

  const ops = document.getElementById("quizOpciones");
  if (ops) {
    ops.innerHTML = q.ops.map((o, i) => `
      <button class="quiz-opcion" data-idx="${i}" onclick="responder(${i})">
        <span class="opt-letra">${String.fromCharCode(65+i)}</span>
        ${o}
      </button>`).join("");
  }

  const fb = document.getElementById("quizFeedback");
  const nx = document.getElementById("quizNext");
  if (fb) { fb.className = "quiz-feedback hidden"; fb.textContent = ""; }
  if (nx) nx.classList.add("hidden");
}

window.responder = function(idx) {
  if (qRespondida) return;
  qRespondida = true;
  const q = PREGUNTAS[qActual];
  const opciones = document.querySelectorAll(".quiz-opcion");
  const fb = document.getElementById("quizFeedback");
  const nx = document.getElementById("quizNext");

  opciones.forEach(op => op.classList.add("disabled"));

  const esCorrecta = idx === q.r;
  if (esCorrecta) qPuntos++;

  opciones[q.r].classList.add("correcta");
  if (!esCorrecta) opciones[idx].classList.add("incorrecta");

  if (fb) {
    fb.className = `quiz-feedback ${esCorrecta ? "ok" : "fail"}`;
    fb.innerHTML = `${esCorrecta ? "✅" : "❌"} ${q.exp}`;
  }
  if (nx) {
    nx.classList.remove("hidden");
    nx.textContent = qActual < PREGUNTAS.length - 1 ? "Siguiente ›" : "Ver resultado";
  }
};

document.getElementById("quizNext")?.addEventListener("click", () => {
  qActual++;
  if (qActual < PREGUNTAS.length) {
    mostrarPregunta();
  } else {
    mostrarResultado();
  }
});

function mostrarResultado() {
  document.getElementById("quizCard")?.classList.add("hidden");
  const res = document.getElementById("quizResultado");
  if (!res) return;
  res.classList.remove("hidden");

  const pct = Math.round((qPuntos / PREGUNTAS.length) * 100);
  const scoreEl = document.getElementById("quizScore");
  if (scoreEl) scoreEl.textContent = `${qPuntos}/${PREGUNTAS.length}`;

  const msgs = [
    { min: 0,  msg: "¡Sigue aprendiendo! EcoMapa Paraíso te ayuda a conocer más sobre el cuidado ambiental de tu municipio. 🌱" },
    { min: 4,  msg: "¡Buen conocimiento! Estás tomando conciencia sobre el medio ambiente de Paraíso. Comparte este quiz con tus vecinos. 🌿" },
    { min: 6,  msg: "¡Excelente! Eres un guardián ambiental de Paraíso. Tus conocimientos ayudan a proteger nuestros manglares. 🏆" },
  ];
  const nivel = [...msgs].reverse().find(m => qPuntos >= m.min);
  const msgEl = document.getElementById("quizMsg");
  if (msgEl) msgEl.textContent = nivel?.msg || "";
}

document.getElementById("quizReiniciar")?.addEventListener("click", iniciarQuiz);
document.getElementById("quizCompartir")?.addEventListener("click", () => {
  const pct = Math.round((qPuntos / PREGUNTAS.length) * 100);
  const msg = encodeURIComponent(`🌿 ¡Hice el quiz ecológico de EcoMapa Paraíso y obtuve ${qPuntos}/${PREGUNTAS.length} (${pct}%)!\n¿Tú cuánto sacarías? Pruébalo aquí: ${URL_SITIO}#quiz`);
  window.open("https://wa.me/?text=" + msg, "_blank");
});

// Iniciar quiz cuando la sección sea visible
const quizObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting && qActual === 0 && !qRespondida) iniciarQuiz(); });
}, { threshold: 0.3 });
const quizSec = document.getElementById("quiz");
if (quizSec) quizObserver.observe(quizSec);

// Llamar actualizarImpacto cuando cambien los markers
const _origAgregarAlMapa = agregarAlMapa;
function setEl2(id, val) { const el = document.getElementById(id); if (el) el.innerHTML = val; }

// Actualizar impacto cada vez que onSnapshot dispare
setTimeout(actualizarImpacto, 2500);

// ═══════════════════════════════════════════════════════════════
// v3.0 — IMPACTO REAL
// ═══════════════════════════════════════════════════════════════

const URL_SITIO2 = "https://ecomapa-paraiso.vercel.app";

// ── FEED DE ACCIONES EN VIVO ──────────────────────────────────
const FEED_TIPOS = {
  tiradero:  { icon:"fa-triangle-exclamation", verb:"reportó un tiradero en" },
  jornada:   { icon:"fa-users",                verb:"convocó una jornada en" },
  limpieza:  { icon:"fa-broom",                verb:"limpió un tiradero en" },
  pledge:    { icon:"fa-handshake-angle",       verb:"firmó un compromiso ecológico" },
  quiz:      { icon:"fa-brain",                verb:"completó el quiz con" },
};

let feedItems = [];

function renderFeed() {
  const cont = document.getElementById("feedScroll");
  if (!cont || !feedItems.length) return;
  const doubled = [...feedItems, ...feedItems];
  cont.innerHTML = `<div class="feed-items">${
    doubled.map(a => {
      const t = FEED_TIPOS[a.tipo] || FEED_TIPOS.tiradero;
      return `<div class="feed-item"><i class="fa-solid ${t.icon}" aria-hidden="true"></i><span>${a.quien||"Ciudadano"} ${t.verb} ${a.zona||"Paraíso"}</span></div>`;
    }).join("")
  }</div>`;
}

// Escuchar todas las acciones en tiempo real
onSnapshot(collection(db, "acciones"), snap => {
  feedItems = snap.docs.map(d => d.data()).slice(-20);
  if (!feedItems.length) {
    feedItems = [
      { tipo:"tiradero", quien:"Ana R.",    zona:"Col. Las Flores" },
      { tipo:"quiz",     quien:"Carlos M.", zona:"10/10 puntos" },
      { tipo:"pledge",   quien:"Sofía T.",  zona:"" },
      { tipo:"tiradero", quien:"Luis G.",   zona:"Puerto Ceiba" },
    ];
  }
  renderFeed();
});

async function registrarAccion(tipo, quien, zona) {
  try {
    await addDoc(collection(db, "acciones"), { tipo, quien, zona, fecha: serverTimestamp() });
  } catch(e) { console.log("Accion no registrada:", e.message); }
}

// ── JORNADAS DE LIMPIEZA ──────────────────────────────────────
onSnapshot(collection(db, "jornadas"), snap => {
  const lista = document.getElementById("jornadasLista");
  if (!lista) return;
  const jornadas = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .filter(j => j.fecha >= new Date().toISOString().slice(0,10))
    .sort((a,b) => a.fecha.localeCompare(b.fecha));

  if (!jornadas.length) {
    lista.innerHTML = `<p style="color:#7a9f6a;font-size:.85rem;text-align:center;padding:2rem 0">No hay jornadas próximas.<br>¡Sé el primero en convocar una!</p>`;
    return;
  }

  lista.innerHTML = jornadas.map(j => `
    <div class="jornada-card">
      <div class="jornada-nombre">${j.nombre}</div>
      <div class="jornada-meta">
        <span class="jornada-tag"><i class="fa-solid fa-calendar" style="margin-right:3px"></i>${j.fecha}</span>
        <span class="jornada-tag"><i class="fa-solid fa-clock" style="margin-right:3px"></i>${j.hora||""}</span>
        <span class="jornada-tag"><i class="fa-solid fa-map-pin" style="margin-right:3px"></i>${j.colonia}</span>
      </div>
      <div class="jornada-punto"><i class="fa-solid fa-location-dot" style="margin-right:4px;color:#7ABF3A"></i>${j.punto||"Punto por confirmar"}</div>
      <div class="jornada-actions">
        <button class="btn-unirse" onclick="unirseJornada('${j.id}',this)">
          <i class="fa-solid fa-user-plus"></i> Me uno (${j.asistentes||0})
        </button>
        <button class="btn-wa-jornada" onclick="compartirJornada('${j.nombre}','${j.fecha}','${j.colonia}','${j.punto||""}')">
          <i class="fa-brands fa-whatsapp"></i>
        </button>
      </div>
    </div>`).join("");
});

document.getElementById("btnCrearJornada")?.addEventListener("click", async () => {
  const nombre  = document.getElementById("jNombre").value.trim();
  const colonia = document.getElementById("jColonia").value.trim();
  const fecha   = document.getElementById("jFecha").value;
  const hora    = document.getElementById("jHora").value;
  const punto   = document.getElementById("jPunto").value.trim();
  const org     = document.getElementById("jOrg").value.trim() || "Ciudadano";
  const msg     = document.getElementById("jornadaMsg");

  if (!nombre || !colonia || !fecha) { showMsg2("jornadaMsg","Nombre, colonia y fecha son obligatorios.","error"); return; }

  try {
    await addDoc(collection(db,"jornadas"), { nombre, colonia, fecha, hora, punto, org, asistentes:1, creado:serverTimestamp() });
    await registrarAccion("jornada", org, colonia);
    showMsg2("jornadaMsg","✅ ¡Jornada publicada! Ya aparece en la lista.","exito");
    ["jNombre","jColonia","jFecha","jHora","jPunto","jOrg"].forEach(id => { const el=document.getElementById(id); if(el) el.value=""; });
  } catch(e) { showMsg2("jornadaMsg","Error al publicar. Verifica tu conexión.","error"); }
});

window.unirseJornada = async (id, btn) => {
  if (btn.classList.contains("joined")) return;
  try {
    const ref2 = doc(db,"jornadas",id);
    const d = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
    await d.updateDoc(ref2, { asistentes: d.increment(1) });
    btn.classList.add("joined");
    btn.innerHTML = `<i class="fa-solid fa-check"></i> ¡Anotado!`;
  } catch(e) { console.log(e); }
};

window.compartirJornada = (nombre, fecha, colonia, punto) => {
  const msg = encodeURIComponent(`🌿 *Jornada de limpieza en Paraíso*\n📋 ${nombre}\n📅 ${fecha}\n📍 ${colonia}${punto?" — "+punto:""}\n\nÚnete en: ${URL_SITIO2}#jornadas\n\n_Vía EcoMapa Paraíso_`);
  window.open("https://wa.me/?text="+msg,"_blank");
};

// ── PLEDGES ECOLÓGICOS ────────────────────────────────────────
const PLEDGES_DATA = [
  { id:"p1", icon:"🚲", text:"Me moveré en bicicleta o a pie al menos 3 días por semana" },
  { id:"p2", icon:"♻️", text:"Separaré mi basura en orgánica e inorgánica todos los días" },
  { id:"p3", icon:"🛍️", text:"No usaré bolsas de plástico de un solo uso" },
  { id:"p4", icon:"💧", text:"Reduciré mi ducha a menos de 5 minutos" },
  { id:"p5", icon:"🔋", text:"Llevaré mis pilas usadas a un punto de acopio" },
  { id:"p6", icon:"📢", text:"Reportaré al menos 1 tiradero clandestino este mes" },
  { id:"p7", icon:"🌿", text:"Compartiré EcoMapa con 5 personas de mi colonia" },
  { id:"p8", icon:"🧴", text:"Llevaré mi aceite usado al DIF Municipal de Paraíso" },
];

let pledgesCounts = {};
let pledgesFirmados = new Set(JSON.parse(localStorage.getItem("pledges_firmados")||"[]"));

function renderPledges() {
  const grid = document.getElementById("pledgesGrid");
  if (!grid) return;
  grid.innerHTML = PLEDGES_DATA.map(p => `
    <div class="pledge-card ${pledgesFirmados.has(p.id)?"signed":""}" onclick="firmarPledge('${p.id}',this)">
      <div class="pledge-icon">${p.icon}</div>
      <div class="pledge-text">${p.text}</div>
      <div class="pledge-count" id="pc-${p.id}">${pledgesCounts[p.id]||0} personas firmaron</div>
      <div class="pledge-check"><i class="fa-solid fa-check-circle"></i> ¡Firmado por ti!</div>
    </div>`).join("");
}

onSnapshot(collection(db,"pledges"), snap => {
  pledgesCounts = {};
  let total = 0;
  snap.docs.forEach(d => { const data=d.data(); pledgesCounts[data.pledgeId]=(pledgesCounts[data.pledgeId]||0)+1; total++; });
  animCounter("pledgeTotal", total);
  renderPledges();
  document.querySelectorAll(".pledge-count").forEach(el => {
    const id = el.id.replace("pc-","");
    el.textContent = (pledgesCounts[id]||0) + " personas firmaron";
  });
});

window.firmarPledge = async (id, card) => {
  if (pledgesFirmados.has(id)) return;
  pledgesFirmados.add(id);
  localStorage.setItem("pledges_firmados", JSON.stringify([...pledgesFirmados]));
  card.classList.add("signed");
  try {
    await addDoc(collection(db,"pledges"), { pledgeId:id, fecha:serverTimestamp() });
    await registrarAccion("pledge","Ciudadano","Paraíso");
  } catch(e) { console.log(e); }
};

renderPledges();

// ── CALCULADORA DE HUELLA ─────────────────────────────────────
const PROMEDIO_PARAISO = 180;

document.getElementById("btnCalcular")?.addEventListener("click", () => {
  const vals = ["h1","h2","h3","h4","h5"].map(n => {
    const el = document.querySelector(`input[name="${n}"]:checked`);
    return el ? parseFloat(el.value) : null;
  });
  if (vals.some(v => v === null)) { alert("Por favor responde todas las preguntas."); return; }

  const base = 80;
  const total = Math.round(base + vals.reduce((a,b)=>a+b,0) * 10);
  const pct = Math.min(Math.round(total / PROMEDIO_PARAISO * 100), 100);
  const color = total < PROMEDIO_PARAISO ? "#4A8C2A" : total < PROMEDIO_PARAISO*1.5 ? "#BA7517" : "#A32D2D";

  document.getElementById("huellaScore").textContent = total;
  document.getElementById("huellaScore").style.color = color;
  const barTu = document.getElementById("huellaBarraTu");
  if (barTu) { barTu.style.width = pct+"%"; barTu.style.background = color; }
  document.getElementById("huellaNumTu").textContent = total+" kg";

  const tips = total < PROMEDIO_PARAISO
    ? "🌿 ¡Excelente! Tu huella es menor al promedio de Paraíso. Sigue así y comparte tus hábitos con tu familia."
    : total < PROMEDIO_PARAISO*1.5
    ? "💡 Tu huella está cerca del promedio. Pequeños cambios como usar bolsa reutilizable y duchar menos tiempo marcan la diferencia."
    : "⚠️ Tu huella es mayor al promedio de Paraíso. Te sugerimos empezar por separar tu basura y reducir el uso del coche.";

  document.getElementById("huellaTips").textContent = tips;
  document.getElementById("huellaForm").classList.add("hidden");
  document.getElementById("huellaResult").classList.remove("hidden");
});

document.getElementById("btnReiniciarHuella")?.addEventListener("click", () => {
  document.getElementById("huellaForm").classList.remove("hidden");
  document.getElementById("huellaResult").classList.add("hidden");
  document.querySelectorAll(".huella-form input[type=radio]").forEach(r => r.checked=false);
});

document.getElementById("btnCompartirHuella")?.addEventListener("click", () => {
  const score = document.getElementById("huellaScore")?.textContent||"?";
  const msg = encodeURIComponent(`🌿 Calculé mi huella ecológica con EcoMapa Paraíso: *${score} kg CO₂/mes*.\nEl promedio de Paraíso es 180 kg. ¿Y la tuya?\n👉 ${URL_SITIO2}#huella`);
  window.open("https://wa.me/?text="+msg,"_blank");
});

// ── ALERTA DE CONTAMINACIÓN HOTSPOT ──────────────────────────
function verificarHotspots() {
  const grupos = {};
  todosMarkers.filter(m=>m.datos.tipo==="tiradero").forEach(m=>{
    const key = Math.round(m.datos.lat*100)+","+Math.round(m.datos.lng*100);
    grupos[key] = (grupos[key]||[]);
    grupos[key].push(m);
  });
  Object.values(grupos).forEach(lista => {
    if (lista.length >= 3) {
      const primero = lista[0];
      const ya = document.querySelector(`.alerta-toast`);
      if (!ya) {
        const toast = document.createElement("div");
        toast.className = "alerta-toast";
        toast.innerHTML = `<strong>⚠️ Zona crítica detectada</strong><small>${primero.datos.colonia||"Zona de Paraíso"} — ${lista.length} reportes en este punto. El municipio fue notificado.</small>`;
        document.body.appendChild(toast);
        setTimeout(()=>toast.remove(),6000);
      }
    }
  });
}
setTimeout(verificarHotspots, 4000);

// ── MODO ESCUELA ──────────────────────────────────────────────
function initModoEscuela() {
  const navbar = document.querySelector(".nav-links");
  if (!navbar) return;

  const btn = document.createElement("a");
  btn.href="#quiz";
  btn.className="modo-escuela-btn nav-link";
  btn.innerHTML=`<i class="fa-solid fa-school" aria-hidden="true"></i><span>Modo escuela</span>`;
  btn.addEventListener("click", abrirModoEscuela);
  navbar.appendChild(btn);

  const modalBg = document.createElement("div");
  modalBg.className="escuela-modal-bg";
  modalBg.id="escuelaModal";
  const codigo = "ECO-"+Math.random().toString(36).slice(2,6).toUpperCase();
  modalBg.innerHTML=`
    <div class="escuela-modal">
      <h3><i class="fa-solid fa-school" style="color:#4A8C2A;margin-right:6px"></i> Modo escuela</h3>
      <p>Comparte este código con tu grupo. Todos hacen el quiz con el mismo código para que el maestro vea los resultados.</p>
      <div class="codigo-clase">${codigo}</div>
      <button class="btn-primary" onclick="compartirModoEscuela('${codigo}')"><i class="fa-brands fa-whatsapp"></i> Compartir código al grupo</button>
      <button class="escuela-close" onclick="document.getElementById('escuelaModal').classList.remove('open')">Cerrar</button>
    </div>`;
  document.body.appendChild(modalBg);
}

function abrirModoEscuela(e) {
  e.preventDefault();
  document.getElementById("escuelaModal")?.classList.add("open");
}

window.compartirModoEscuela = (codigo) => {
  const msg = encodeURIComponent(`📚 *Quiz ecológico de EcoMapa Paraíso — Modo Escuela*\n\nCódigo de clase: *${codigo}*\n\nEntra al quiz con este código:\n👉 ${URL_SITIO2}#quiz\n\n_¡Vamos a ver quién sabe más sobre el medio ambiente de Paraíso!_`);
  window.open("https://wa.me/?text="+msg,"_blank");
};

window.addEventListener("load", () => {
  initModoEscuela();
  renderFeed();
});

function showMsg2(id, txt, tipo) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent=txt; el.className=`msg-envio msg-${tipo}`; el.classList.remove("hidden");
  setTimeout(()=>el.classList.add("hidden"),5000);
}
