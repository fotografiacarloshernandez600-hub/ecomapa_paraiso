# EcoMapa Paraíso 🌿

Plataforma web interactiva de gestión de residuos para el municipio de Paraíso, Tabasco.

## Pasos para activarlo

### 1. Configura Firebase
1. Ve a https://console.firebase.google.com
2. Crea proyecto **ecomapa-paraiso**
3. Activa **Firestore Database** → modo prueba
4. Activa **Storage** → modo prueba
5. Clic en **</>** (Web) → registra la app → copia la config
6. Pega los valores en `firebase-config.js`

### 2. Ejecuta con Live Server
1. Abre la carpeta en VS Code
2. Instala la extensión **Live Server** (Ritwick Dey)
3. Click derecho sobre `index.html` → **Open with Live Server**
4. Se abre en `http://localhost:5500`

> ⚠️ No abras el HTML directamente con doble clic. Los módulos de Firebase necesitan un servidor HTTP.

### 3. Sube a internet (gratis)
1. Crea cuenta en https://vercel.com con tu cuenta de Google
2. Instala Vercel CLI: `npm i -g vercel`
3. Desde la carpeta del proyecto: `vercel`
4. Sigue los pasos → tu sitio queda en `https://ecomapa-paraiso.vercel.app`

## Estructura
```
ecomapa-paraiso/
├── index.html          — Estructura completa del sitio
├── style.css           — Estilos y animaciones
├── app.js              — Lógica, mapa y Firebase
├── firebase-config.js  — Tu configuración de Firebase
└── README.md           — Este archivo
```

## Funcionalidades
- 🗺️ Mapa interactivo con Leaflet + OpenStreetMap
- ♻️ 5 centros de acopio reales de Paraíso
- 🚛 9 rutas de recolección municipal con colonias
- 📸 Formulario de reporte ciudadano con foto y GPS
- 🔥 Tiempo real con Firebase Firestore
- 📱 Diseño responsive para celular
- ✨ Animaciones y loader

## Teléfono municipal de reportes
**933 136 3054** — Protección Ambiental y Desarrollo Sustentable

## Dashboard de administración

### Activar el login
1. En Firebase → **Authentication** → **Sign-in method** → activa **Email/contraseña**
2. Ve a **Authentication** → **Users** → **Agregar usuario**
3. Pon tu correo y contraseña de administrador
4. Abre `admin.html` en el navegador → inicia sesión

### URL del dashboard
`http://localhost:5500/admin.html` (desarrollo)
`https://tu-sitio.vercel.app/admin.html` (producción)

### Funciones del dashboard
- Ver y gestionar todos los reportes ciudadanos
- Cambiar estado: pendiente → en proceso → resuelto
- Exportar reportes a CSV
- Agregar nuevos centros de acopio sin tocar código
- Publicar avisos municipales
- Estadísticas: reportes por mes, top colonias, tasa de resolución
- Roles: admin completo / operador solo resuelve reportes
