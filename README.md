# EcoMapa Paraíso — versión de transición a Supabase y Android

Esta versión arregla el refresco/tamaño del mapa Leaflet, conecta los **reportes ciudadanos del mapa** y el **registro móvil de residuos** con Supabase, y configura Cordova para empaquetar `index.html` dentro de Android.

> **Alcance real de esta entrega:** `reportes` y `residuos` usan Supabase (incluyendo imágenes). Los módulos de avisos, jornadas, acciones, resultados del cuestionario, pledges y el inicio de sesión/administración todavía usan Firebase. No borres ni desactives Firebase hasta migrar esos módulos. No se incluye un APK ya compilado porque requiere configurar tu proyecto Supabase y compilar con Android SDK en tu computadora.

## A. Configurar Supabase (una sola vez)

1. Entra en <https://supabase.com> y crea un proyecto. Guarda la contraseña de la base de datos.
2. Abre **Project Settings → API** (en algunas versiones aparece como **Connect**) y copia la **Project URL** y la clave pública **publishable** o `anon`.
3. La URL y la clave pública que compartiste ya están colocadas en `supabase-config.js`. Si rotas la clave en Supabase, actualiza ese archivo.
   - **Nunca** uses `service_role` o una clave secreta en el navegador ni dentro del APK.
4. Abre **SQL Editor → New query**, copia el contenido completo de `supabase-setup.sql`, pégalo y pulsa **Run**.
5. En **Database → Publications** (o la sección de Realtime), activa la tabla `public.reportes` en la publicación `supabase_realtime`. Si la tabla no aparece, guarda y vuelve a abrir la pantalla.
6. En **Storage**, verifica que existan los buckets públicos `reportes` y `residuos`. Cada imagen tiene límite de 5 MB y se aceptan JPG/JPEG, PNG y WebP.

### Seguridad antes de publicar

El SQL es una configuración inicial para pruebas: permite lectura pública de reportes y carga anónima de reportes/fotos, por lo que no debes guardar información privada. Antes de abrirlo al público, agrega protección contra spam (por ejemplo, CAPTCHA/Edge Function), límites y moderación; crea políticas administrativas autenticadas y restringe quién puede editar o borrar datos. Las claves públicas son visibles por diseño: la seguridad depende de RLS y las políticas de Storage.

## B. Probar la web en la computadora

1. Instala Node.js LTS desde <https://nodejs.org/>.
2. Descomprime este ZIP en una carpeta, por ejemplo `C:\EcoMapa`.
3. Abre esa carpeta en VS Code y abre una terminal en la carpeta que contiene `package.json`.
4. Ejecuta:

```bash
npm install
```

5. Para servir el sitio localmente puedes usar la extensión Live Server de VS Code y abrir `index.html`. No abras el HTML con doble clic.
6. Abre la página y permite ubicación. En el formulario, pulsa **Obtener GPS**, completa colonia y descripción, selecciona una imagen opcional y pulsa **Enviar reporte al mapa**.
7. Comprueba que el reporte aparezca como marcador; al tocarlo debe mostrar descripción y fotografía. Abre Supabase → **Table Editor → reportes** para confirmar que se guardó. Prueba también desde otro navegador para confirmar que Realtime propaga el nuevo reporte.
8. Si no aparece: revisa la consola del navegador (F12), que `supabase-config.js` tenga URL/clave correctas, que el SQL se ejecutó, que las políticas de RLS estén presentes y que Realtime esté habilitado.

## C. Generar el APK para Android

### Requisitos

- Windows 10/11 de 64 bits.
- Node.js LTS.
- Android Studio con Android SDK instalado.
- JDK compatible con la versión de `cordova-android` instalada (Android Studio instala un JDK que suele funcionar).
- Variables de entorno `JAVA_HOME` y `ANDROID_HOME`/`ANDROID_SDK_ROOT` configuradas si Cordova no detecta las herramientas.
- Internet durante la compilación y al enviar reportes (Supabase necesita conexión). Los registros móviles conservan un borrador en IndexedDB y pueden reintentarse cuando vuelva la conexión.

### Compilación paso a paso

1. En Android Studio abre **SDK Manager** e instala una plataforma Android reciente y **Android SDK Build-Tools**, **Platform-Tools** y **Command-line Tools**.
2. Abre PowerShell en la raíz del proyecto, donde está `package.json`.
3. Ejecuta:

```powershell
npm install
npx cordova platform add android
npm run android
```

Si dice que Android ya está añadido, no repitas `platform add`; ejecuta `npm run android`. El script `prepare:android` copia los archivos web actuales a `www/` antes de compilar.

4. Al terminar, el APK de depuración estará normalmente en:

`platforms/android/app/build/outputs/apk/debug/app-debug.apk`

5. Conecta el teléfono por USB, activa **Opciones de desarrollador → Depuración USB** y copia el APK al teléfono, o instala desde la terminal:

```powershell
adb install -r platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

6. Al abrir EcoMapa, concede los permisos de cámara/archivos y ubicación cuando Android los solicite. Prueba el reporte con GPS, la fotografía y la aparición del marcador. Si Android bloquea la instalación, autoriza temporalmente instalar aplicaciones desde el origen que utilizaste.
7. Para distribuirlo a otras personas, genera una compilación **release firmada** desde Android Studio/Gradle. No distribuyas un APK debug como versión oficial.

## D. Qué comprobar en el teléfono

- La página inicial debe ser el mapa completo (`index.html`), no solo la pantalla EcoReporte.
- GPS activo y permiso de ubicación concedido.
- El selector de imagen abre cámara/galería según el dispositivo y la imagen no supera 5 MB.
- Un reporte aparece en el mapa y en Supabase `reportes`.
- En `residuo.html`, el registro queda primero guardado localmente; al tener conexión, su fotografía sube a Storage `residuos` y los datos a la tabla `residuos`.
- Los reportes ciudadanos necesitan internet para sincronizarse con Supabase. IndexedDB conserva los registros de EcoReporte en el dispositivo, pero eso no significa que estén sincronizados hasta que el estado diga **Enviado**.

## E. Archivos clave

- `supabase-config.js`: URL y clave pública del proyecto Supabase.
- `supabase-setup.sql`: tablas, políticas iniciales y buckets.
- `app.js`: mapa, formulario de reporte, marcadores y suscripción Realtime.
- `residuo.js`: captura de foto, GPS, almacenamiento local y sincronización a Supabase.
- `config.xml`: configura Cordova para abrir `index.html` en Android.
- `scripts/prepare-cordova.mjs`: copia las páginas y scripts a `www/`.

## Nota de migración

La app aún inicializa Firebase para funciones que no se han migrado. Mantén `firebase-config.js` configurado para que esas secciones sigan funcionando. La migración completa también requiere adaptar `admin.js`, `app.js` (avisos, jornadas, acciones, quiz y pledges) y autenticación/roles a Supabase Auth y sus tablas/políticas. Esta entrega no afirma que esas funciones ya estén migradas.
