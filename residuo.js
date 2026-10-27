import { supabase } from './supabase-config.js';

const $ = id => document.getElementById(id);
const DB_NAME = 'ecomapa-residuos';
let image = null;
let coords = null;
let modelPromise;
// No deshabilitar el botón: el evento deviceready puede llegar antes de cargar el módulo.
let cordovaReady = !!navigator.camera;
document.addEventListener('deviceready',()=>{
  cordovaReady=true;
  msg(navigator.camera ? 'Cámara lista para tomar fotografías.' : 'Plugin de cámara no disponible.');
},false);
const TYPES = [
  [/bottle|plastic|water bottle|pop bottle/i,'Plástico PET'],
  [/glass|wine bottle|beer bottle|jar/i,'Vidrio'],
  [/carton|paper|book|envelope|cardboard/i,'Papel y cartón'],
  [/can|aluminum|metal|tin/i,'Metal'],
  [/battery|cell phone battery/i,'Pilas y baterías'],
  [/laptop|cell phone|keyboard|computer|television|remote control/i,'Electrónicos'],
  [/oil|frying pan/i,'Aceite usado'],
  [/shirt|jersey|jean|coat|textile/i,'Textiles'],
  [/banana|apple|orange|food/i,'Orgánico']
];
const msg = value => { $('status').textContent = value; };
function openDb(){
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open(DB_NAME,1);
    request.onupgradeneeded=()=>request.result.createObjectStore('records',{keyPath:'id'});
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
  });
}
async function transaction(mode,operation){
  const db=await openDb();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction('records',mode); const request=operation(tx.objectStore('records'));
    request.onsuccess=()=>resolve(request.result); request.onerror=()=>reject(request.error);
    tx.oncomplete=()=>db.close(); tx.onerror=()=>reject(tx.error);
  });
}
const save=record=>transaction('readwrite',store=>store.put(record));
const all=()=>transaction('readonly',store=>store.getAll());
function fileFromDataUrl(data){
  const [header,encoded]=data.split(','); const bytes=atob(encoded);
  const array=new Uint8Array(bytes.length); for(let i=0;i<bytes.length;i++) array[i]=bytes.charCodeAt(i);
  return new Blob([array],{type:header.match(/data:(.*?);/)[1]});
}
async function normalizePhoto(source){
  const img=new Image(); const url=typeof source==='string'?(source.startsWith('data:')||source.startsWith('file:')||source.startsWith('content:')?source:`data:image/jpeg;base64,${source}`):URL.createObjectURL(source);
  try {
    await new Promise((resolve,reject)=>{ img.onload=resolve; img.onerror=reject; img.src=url; });
    const scale=Math.min(1,1280/Math.max(img.width,img.height));
    const canvas=document.createElement('canvas'); canvas.width=Math.round(img.width*scale); canvas.height=Math.round(img.height*scale);
    canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
    image=canvas.toDataURL('image/jpeg',.78); $('preview').src=image; $('preview').hidden=false;
    $('prediction').textContent='Analizando imagen…'; classifyPhoto();
  } finally { if(typeof source!=='string') URL.revokeObjectURL(url); }
}
async function classifyPhoto(){
  try {
    // MobileNet suggests common objects. It cannot reliably identify every material.
    modelPromise ||= (async()=>{
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js');
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.1/dist/mobilenet.min.js');
      return window.mobilenet.load();
    })().catch(error=>{modelPromise=null;throw error});
    const predictions=await (await modelPromise).classify($('preview'));
    const match=predictions.map(p=>({ ...p,type:TYPES.find(([regex])=>regex.test(p.className))?.[1] })).find(p=>p.type && p.probability>=.25);
    if(match){ $('type').value=match.type; $('prediction').textContent=`Tipo sugerido: ${match.type}. Confirma o corrige antes de enviar.`; }
    else $('prediction').textContent='No pude identificar el tipo con confianza. Selecciónalo manualmente.';
  } catch(error){ console.warn('Clasificador no disponible',error); $('prediction').textContent='Clasificación automática no disponible sin conexión. Selecciona el tipo manualmente.'; }
}
function loadScript(src){return new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=reject;document.head.append(script);});}
$('photo').addEventListener('change',event=>{if(event.target.files[0]) normalizePhoto(event.target.files[0]).then(()=>captureLocation()).catch(error=>msg('No pude leer esa foto: '+(error?.message||error)));});
// FILE_URI evita transferir fotografías grandes como cadenas base64 por el puente nativo.
function cameraFileToBlob(uri){
  return new Promise((resolve,reject)=>{
    if(typeof window.resolveLocalFileSystemURL!=='function'){
      reject(new Error('Falta cordova-plugin-file. Instálalo y vuelve a generar el APK.'));return;
    }
    window.resolveLocalFileSystemURL(uri,entry=>{
      entry.file(file=>{
        const reader=new FileReader();
        reader.onload=()=>resolve(new Blob([reader.result],{type:file.type||'image/jpeg'}));
        reader.onerror=()=>reject(reader.error||new Error('No se pudo leer el archivo de la cámara'));
        reader.readAsArrayBuffer(file);
      },reject);
    },reject);
  });
}
function captureLocation(){
  $('coordinates').textContent='📍 Detectando ubicación GPS automáticamente…';
  navigator.geolocation.getCurrentPosition(({coords:point})=>{
    coords={lat:point.latitude,lng:point.longitude};
    $('coordinates').textContent=`📍 ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)} (precisión ±${Math.round(point.accuracy)} m)`;
    $('maplink').href=`https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}#map=17/${coords.lat}/${coords.lng}`;
    $('maplink').hidden=false;
  },error=>{
    $('coordinates').textContent=`GPS automático falló: ${error.message}. Pulsa «Marcar mi ubicación» para reintentar.`;
  },{enableHighAccuracy:true,timeout:30000,maximumAge:0});
}
$('camera').addEventListener('click',()=>{
  if(window.cordova && !cordovaReady && navigator.camera) cordovaReady=true;
  if(!navigator.camera){msg('El plugin nativo de cámara no está disponible. Comprueba que instalaste el APK actualizado.');return;}
  msg('Abriendo cámara…');
  navigator.camera.getPicture(uri=>handleCameraResult(uri),
    error=>msg('Cámara: '+(error?.message||error)),{
    quality:65,destinationType:Camera.DestinationType.FILE_URI,sourceType:Camera.PictureSourceType.CAMERA,
    encodingType:Camera.EncodingType.JPEG,targetWidth:1024,targetHeight:1024,correctOrientation:true,
    saveToPhotoAlbum:false
  });
});
async function handleCameraResult(uri){
  try{
    msg('Procesando fotografía tomada…');
    const blob=await cameraFileToBlob(uri);
    await normalizePhoto(blob);
    msg('Fotografía cargada. Detectando ubicación…');
    captureLocation();
  }catch(error){
    console.error('Error de cámara',error);
    msg('No se pudo recuperar la foto: '+(error?.message||String(error)));
  }
}
// Android puede destruir el WebView mientras se abre la aplicación de cámara.
// Cordova devuelve entonces el resultado pendiente mediante el evento resume.
document.addEventListener('resume',event=>{
  const pending=event?.pendingResult;
  if(!pending || pending.pluginService!=='Camera')return;
  if(pending.pluginStatus==='OK' && pending.result){
    handleCameraResult(pending.result);
  }else if(pending.pluginStatus!=='OK'){
    msg('La cámara no devolvió la fotografía: '+(pending.result||pending.pluginStatus));
  }
},false);
$('location').addEventListener('click',captureLocation);
$('contacts').addEventListener('click',()=>{
  if(!navigator.contacts?.pickContact){msg('Selector de contactos disponible en la app Android. Puedes escribir el nombre manualmente.');return;}
  navigator.contacts.pickContact(contact=>{ $('responsible').value=contact.displayName||contact.name?.formatted||''; },error=>msg(`No se seleccionó contacto: ${error}`),{filter:['displayName','name']});
});
function scheduleReminder(record){
  if(!record.reminder)return;
  const when=new Date(record.reminder);
  if(when<=new Date())return;
  if(window.cordova?.plugins?.notification?.local){
    cordova.plugins.notification.local.schedule({id:Math.abs(hash(record.id)),title:'Seguimiento de EcoReporte',text:`Revisa el residuo ${record.type} en ${record.zone}`,trigger:{at:when}});
  }
}
function hash(value){let h=0;for(const c of value)h=((h<<5)-h+c.charCodeAt(0))|0;return h;}
async function send(record){
  let foto_url = null;
  if(record.image){
    const blob=fileFromDataUrl(record.image);
    const path=`residuos/${record.id}.jpg`;
    const {error:uploadError}=await supabase.storage.from('residuos').upload(path,blob,{contentType:'image/jpeg',upsert:true});
    if(uploadError) throw uploadError;
    foto_url=supabase.storage.from('residuos').getPublicUrl(path).data.publicUrl;
  }
  const {data,error}=await supabase.from('residuos').upsert({
    local_id:record.id,tipo:record.type,descripcion:record.description,colonia:record.zone,
    lat:record.coords.lat,lng:record.coords.lng,responsable:record.responsible||null,
    foto_url,estado:'pendiente',recorded_at:record.created
  },{onConflict:'local_id'}).select('id').single();
  if(error) throw error;
  record.remoteId=data.id;record.status='enviado';await save(record);
}
async function render(){
  const records=(await all()).sort((a,b)=>b.created.localeCompare(a.created));
  $('records').replaceChildren();
  if(!records.length){$('records').textContent='Todavía no tienes registros.';return;}
  for(const r of records){
    const box=document.createElement('article');box.className='record';
    const photo=document.createElement('img');photo.src=r.image;photo.alt=`Residuo: ${r.type}`;box.append(photo);
    const title=document.createElement('strong');title.textContent=`${r.type} · ${r.zone}`;box.append(title);
    const detail=document.createElement('small');detail.textContent=`${new Date(r.created).toLocaleString('es-MX')} · ${r.status==='enviado'?'Enviado':'Pendiente de envío'} · ${r.description}`;box.append(detail);
    const point=document.createElement('a');point.href=`https://www.openstreetmap.org/?mlat=${r.coords.lat}&mlon=${r.coords.lng}`;point.target='_blank';point.rel='noopener';point.textContent='Ver ubicación';box.append(point);
    if(r.status!=='enviado'){const retry=document.createElement('button');retry.textContent='Reintentar';retry.onclick=()=>sync(r);box.append(retry);}
    $('records').append(box);
  }
}
async function sync(record){
  try{await send(record);msg('Reporte enviado con fotografía y ubicación.');}
  catch(error){console.error(error);msg('Guardado en el celular, pendiente de envío: '+(error?.message||String(error)));}
  await render();
}
$('submit').addEventListener('click',async()=>{
  const type=$('type').value,description=$('description').value.trim(),zone=$('zone').value.trim();
  if(!image||!type||!description||!zone||!coords){msg('Completa foto, tipo, descripción, zona y ubicación GPS.');return;}
  const record={id:(globalThis.crypto?.randomUUID?.()||('r-'+Date.now()+'-'+Math.random().toString(36).slice(2))),type,description,zone,coords,image,responsible:$('responsible').value.trim(),reminder:$('reminder').value,created:new Date().toISOString(),status:'pendiente'};
  $('submit').disabled=true;
  try{await save(record);scheduleReminder(record);msg('Registro guardado en el dispositivo. Enviando…');await sync(record);}
  catch(error){console.error(error);msg('No se pudo guardar en el dispositivo. Libera espacio e inténtalo de nuevo.');}
  finally{$('submit').disabled=false;}
});
$('sync').addEventListener('click',async()=>{for(const record of await all())if(record.status!=='enviado')await sync(record);});
render().catch(error=>{console.error(error);msg('No se pudo abrir el historial local.');});
