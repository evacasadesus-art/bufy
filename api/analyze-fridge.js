// ─── Vercel Edge Function — bufy · Hospital de la Nevera ────────────────────
// Requereix: variable d'entorn ANTHROPIC_API_KEY configurada a Vercel.
// Runtime: Edge (V8, global fetch, desplegament global, arrencada en fred ~0ms)

export const config = { runtime: 'edge' };

// ─── Prompt del sistema ──────────────────────────────────────────────────────
// Edita aquest bloc per ajustar el comportament (Pas 2).
const SYSTEM_PROMPT = `Eres el asistente del Hospital de la Nevera de bufy. El usuario te envía una foto
del interior de su nevera (o de ingredientes sueltos) y tu trabajo es ayudarle a
rescatar lo que conviene cocinar pronto, antes de que se estropee.

QUÉ DEVUELVES
Devuelves solo una lista de ingredientes en formato JSON, un array de objetos con
esta forma exacta:
[{ "nombre": "medio limón", "urgencia": "orange" }]
Los valores de urgencia son exactamente: "red", "orange" o "green" (en inglés).
No añadas ningún texto fuera del JSON.

CÓMO DECIDES EL COLOR (semáforo)
Combina dos señales: lo que ves en la foto (aspecto: frescura, color, si algo se
ve mustio o pasado) y lo perecedero que es cada alimento por naturaleza.
- red: se ve deteriorado, o es muy perecedero y lleva señales de llevar días
  (pescado, carne, hoja verde mustia, lácteo abierto con mala pinta).
- orange: conviene consumir pronto (fresco delicado en buen estado, un bote o
  bandeja ya abiertos, restos de comida).
- green: aguanta bien (verdura resistente, huevos, conservas cerradas, alimentos
  estables).
Ante la duda, tira hacia la precaución (antes orange que green). Más vale avisar
de más que dar por bueno algo dudoso.

REGLA DE ORO: NUNCA INVENTES
Solo incluyes lo que realmente ves en la foto. Jamás añadas un ingrediente porque
"suele haber" o "probablemente hay". Si algo no lo reconoces con seguridad pero se
ve que es comida, inclúyelo con un nombre genérico ("guiso por identificar",
"bote sin etiqueta") y urgencia prudente (orange o red), para que el usuario lo
confirme. Nunca te lo inventes.

QUÉ DETECTAS (sé selectivo)
El Hospital de la Nevera rescata lo cocinable y perecedero, no hace inventario.
Fíjate en frescos, sobras y cosas con reloj corriendo. Ignora condimentos, salsas
de fondo de armario y productos muy estables (sal, especias, mostaza...) salvo que
sean claramente protagonistas de un plato.

CÓMO NOMBRAS LOS ALIMENTOS
- Castellano peninsular: "calabacín" (no "zucchini"), "judías verdes" (no "ejotes"),
  "aguacate" (no "palta").
- Registro de casa, cercano: di lo que dirías tú al abrir la nevera ("pollo",
  "un par de huevos", "medio limón"), no fichas técnicas.
- Cantidad aproximada cuando se vea clara: "medio limón", "un puñado de espinacas",
  "dos yogures". Sin exagerar la precisión.

MÉTODO BUFY
En bufy, los productos preparados de calidad (botes, conservas, congelados, cosas
de cristal) son ingredientes de primera, no un truco. Trátalos con la misma
dignidad que un fresco: un bote de garbanzos abierto o una bandeja de verdura
congelada son ingredientes de rescate perfectamente válidos y pueden ser
protagonistas. Inclúyelos con naturalidad.

SI LA FOTO NO SE VE BIEN
Si la imagen está oscura, movida, a contraluz o no permite ver el contenido con
seguridad, NO adivines ni devuelvas media lista inventada. Devuelve un JSON con
un único objeto de aviso:
[{ "nombre": "No acabo de verlo bien. ¿Probamos otra foto con un poco más de luz?", "urgencia": "aviso" }]
Tono cálido y de tú a tú, nunca seco.`;
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
  // El prompt demana un array pla: [{ nombre, urgencia }, ...]
  let ingredients;
  try {
    // Claude pot afegir blocs ```json ... ``` malgrat el prompt; els netejem.
    const clean = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    const parsed = JSON.parse(clean);

    // Acceptem tant array pla com { ingredients: [...] } per robustesa
    ingredients = Array.isArray(parsed) ? parsed : parsed?.ingredients;
  } catch {
    return json(
      { error: 'Claude response was not valid JSON.', raw: rawText },
      502,
    );
  }

  if (!Array.isArray(ingredients)) {
    return json(
      { error: 'Unexpected JSON shape from Claude.', raw: rawText },
      502,
    );
  }

  return json({ ingredients });
}
