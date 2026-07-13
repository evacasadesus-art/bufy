// ─── Vercel Edge Function — bufy · Receta Comodín ───────────────────────────
// Requereix: variable d'entorn ANTHROPIC_API_KEY configurada a Vercel.
// Runtime: Edge (V8, global fetch, desplegament global, arrencada en fred ~0ms)

export const config = { runtime: 'edge' };

// ─── Prompt del sistema ──────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Eres el cocinero de bufy. El usuario te da una lista de ingredientes que tiene
en la nevera, con su nivel de urgencia (red = hay que gastarlo ya, orange =
pronto, green = aguanta). Tu trabajo es proponer UNA sola receta que rescate
lo que corre prisa.

REGLAS
- Los ingredientes en "red" son el CORAZÓN del plato. Constrúyelo alrededor de
  ellos. Los "orange" y "green" acompañan solo si encajan de forma natural.
- NO metas todos los ingredientes con calzador. Mejor un plato rico con cuatro
  cosas que un revuelto triste con ocho. Prioriza que apetezca comerlo.
- Puedes dar por hecho la despensa universal: aceite, sal, pimienta, ajo,
  cebolla, harina, huevos, especias básicas. NO la des por hecha si es algo
  menos universal (nata, vino, soja, piñones...). Si la receta lo necesitaría,
  cambia de plato.
- Receta realista y rápida, de casa. Nada de alta cocina.

MÉTODO BUFY
Los productos preparados de calidad (botes, conservas, congelados) son
ingredientes de primera. Úsalos con naturalidad y sin complejos.

FORMATO DE RESPUESTA (JSON, nada más):
{
  "nombre": "Boloñesa rápida con tortellini",
  "tiempo": "25 min",
  "necesitas": ["carne picada", "tortellini", "tomates", "cebolla", "aceite"],
  "pasos": [
    "Dora la carne picada con un poco de aceite y sal.",
    "Añade los tomates troceados y deja reducir 10 min.",
    "Cuece los tortellini 3 min en agua hirviendo.",
    "Mezcla y sirve."
  ]
}

- "necesitas": TODO lo que hace falta, incluyendo lo de la despensa. Es lo que
  el usuario mira antes de empezar para saber si puede.
- "pasos": entre 3 y 6. Cortos, claros, ejecutables. Castellano de casa, tú a tú.`;
// ─────────────────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS_HEADERS });
}

export default async function handler(request) {
  // Preflight CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed. Use POST.' }, 405);
  }

  // ── Llegir cos de la petició ──
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const { ingredients } = body;

  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return json({ error: 'Missing required field: ingredients (non-empty array).' }, 400);
  }

  // ── Clau d'API ──
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json({ error: 'Server configuration error: ANTHROPIC_API_KEY not set.' }, 500);
  }

  const ingredientsList = ingredients
    .map(({ nombre, urgencia }) => `- ${nombre} (${urgencia})`)
    .join('\n');

  // ── Crida a l'API d'Anthropic ──
  let anthropicRes;
  try {
    anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Aquí tienes los ingredientes que tengo en la nevera:\n\n${ingredientsList}`,
              },
            ],
          },
        ],
      }),
    });
  } catch (err) {
    return json({ error: `Network error reaching Anthropic: ${err.message}` }, 502);
  }

  if (!anthropicRes.ok) {
    const errText = await anthropicRes.text().catch(() => '(no body)');
    return json(
      { error: `Anthropic API returned ${anthropicRes.status}`, detail: errText },
      502,
    );
  }

  const anthropicData = await anthropicRes.json().catch(() => null);
  const rawText = anthropicData?.content?.find((c) => c.type === 'text')?.text ?? '';

  if (!rawText) {
    return json({ error: 'Claude returned an empty response.' }, 502);
  }

  // ── Parsejar la resposta de Claude ──
  let recipe;
  try {
    // Claude pot afegir blocs ```json ... ``` malgrat el prompt; els netejem.
    const clean = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    recipe = JSON.parse(clean);
  } catch {
    return json(
      { error: 'Claude response was not valid JSON.', raw: rawText },
      502,
    );
  }

  const isValidShape =
    recipe &&
    typeof recipe.nombre === 'string' &&
    typeof recipe.tiempo === 'string' &&
    Array.isArray(recipe.necesitas) &&
    Array.isArray(recipe.pasos);

  if (!isValidShape) {
    return json(
      { error: 'Unexpected JSON shape from Claude.', raw: rawText },
      502,
    );
  }

  return json({ recipe });
}
