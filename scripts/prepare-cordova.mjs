import { copyFileSync, mkdirSync } from 'node:fs';
mkdirSync('www', { recursive: true });
for (const file of ['index.html','style.css','app.js','firebase-config.js','admin.html','admin.css','admin.js','escuela.html','residuo.html','residuo.css','residuo.js']) copyFileSync(file, `www/${file}`);
console.log('Archivos web copiados a www/.');
