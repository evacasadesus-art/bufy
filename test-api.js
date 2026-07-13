// ─── Script de prova — Hospital de la Nevera ────────────────────────────────
// Ús: node test-api.js
// Canvia IMAGE_PATH per la ruta de la teva foto.

const fs = require('fs');
const path = require('path');

// ▼ CANVIA AQUÍ la ruta de la foto que vols provar
const IMAGE_PATH = 'C:/Users/evaca/nevera.webp';
// ▲ ─────────────────────────────────────────────

const API_URL = 'https://bufy.vercel.app/api/analyze-fridge';

async function main() {
  // Llegir i convertir la foto a base64
  const absolutePath = path.resolve(IMAGE_PATH);
  if (!fs.existsSync(absolutePath)) {
    console.error(`❌  No trobo la foto a: ${absolutePath}`);
    console.error('    Canvia IMAGE_PATH al script per apuntar a la teva foto.');
    process.exit(1);
  }

  const ext = path.extname(absolutePath).toLowerCase();
  const mediaTypeMap = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
  const mediaType = mediaTypeMap[ext] ?? 'image/jpeg';

  const imageBase64 = fs.readFileSync(absolutePath).toString('base64');
  console.log(`📷  Foto: ${absolutePath}`);
  console.log(`📦  Mida: ${(imageBase64.length * 0.75 / 1024).toFixed(0)} KB aprox.`);
  console.log(`🌐  Enviant a ${API_URL} ...\n`);

  // Crida al backend
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageBase64, mediaType }),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    console.error('❌  Error del servidor:', data);
    process.exit(1);
  }

  // Mostrar resultats
  console.log('✅  Resposta de Claude:\n');
  const { ingredients } = data;
  const icons = { red: '🔴', orange: '🟠', green: '🟢', aviso: '⚠️ ' };

  ingredients.forEach(({ nombre, urgencia }) => {
    const icon = icons[urgencia] ?? '❓';
    console.log(`  ${icon}  ${nombre}  (${urgencia})`);
  });

  console.log(`\nTotal: ${ingredients.length} ingredient${ingredients.length === 1 ? '' : 's'}`);
}

main().catch((err) => {
  console.error('❌  Error inesperat:', err.message);
  process.exit(1);
});
