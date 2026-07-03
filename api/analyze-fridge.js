// ─── Vercel Edge Function — bufy · Hospital de la Nevera ────────────────────
// Requereix: variable d'entorn ANTHROPIC_API_KEY configurada a Vercel.
// Runtime: Edge (V8, global fetch, desplegament global, arrencada en fred ~0ms)

export const config = { runtime: 'edge' };

// ─── Prompt del sistema ──────────────────────────────────────────────────────
// Edita aquest bloc per ajustar el comportament en el Pas 2.
const SYSTEM_PROMPT = `Eres un asistente de cocina experto en gestión del frigorífico.
Analiza la foto de una nevera e identifica todos los ingredientes y alimentos visibles.
Para cada ingrediente, evalúa su urgencia de uso basándote en su aspecto visual:

- "red":    úsalo hoy o mañana (aspecto muy maduro, señales de deterioro, envase abierto sin tapar, etc.)
- "orange": puedes esperar 2-3 días (buen estado pero no en su punto óptimo)
- "green":  está fresco, puede esperar más de una semana

Responde SIEMPRE y ÚNICAMENTE con JSON válido con este formato exacto:
{
  "ingredients": [
    { "nombre": "Nombre del ingrediente", "urgencia": "green" }
  ]
}

Los valores de urgencia son EXACTAMENTE "red", "orange" o "green". Nunca otro valor.
Sin texto adicional, sin explicaciones, sin bloques markdown. Solo el JSON.`;
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

  const { image, mediaType = 'image/jpeg' } = body;

  if (!image || typeof image !== 'string') {
    return json({ error: 'Missing required field: image (base64 string).' }, 400);
  }

  // ── Clau d'API ──
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json({ error: 'Server configuration error: ANTHROPIC_API_KEY not set.' }, 500);
  }

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
                type: 'image',
                source: { type: 'base64', media_type: mediaType, data: image },
              },
              {
                type: 'text',
                text: 'Identifica los ingredientes visibles en esta nevera.',
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
  let parsed;
  try {
    // Claude pot afegir blocs ```json ... ``` malgrat el prompt; els netejem.
    const clean = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    parsed = JSON.parse(clean);
  } catch {
    return json(
      { error: 'Claude response was not valid JSON.', raw: rawText },
      502,
    );
  }

  // Validació mínima de l'estructura
  if (!Array.isArray(parsed?.ingredients)) {
    return json(
      { error: 'Unexpected JSON shape from Claude.', raw: rawText },
      502,
    );
  }

  return json({ ingredients: parsed.ingredients });
}
