import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';

const STAFF_DOMAIN = '@escapetsunamifordevelopers.com';

function isAuthorizedStaff(user) {
  if (!user) return false;
  const email = String(user.email || '').trim().toLowerCase();
  const isStaffMail = email.endsWith(STAFF_DOMAIN) && email.length > STAFF_DOMAIN.length;
  return Boolean(
    user.role === 'admin' ||
    user.role === 'staff' ||
    user.is_owner ||
    user.data?.is_owner ||
    isStaffMail
  );
}

function extractJsonObject(rawText) {
  const trimmed = String(rawText || '').trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced && fenced[1]) {
      try {
        return JSON.parse(fenced[1].trim());
      } catch {
        // continue
      }
    }
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function callGeminiApi(apiKey, prompt, responseJsonSchema) {
  const models = [
    'gemini-3.5-flash-lite',
    'gemini-3-flash-preview',
    'gemini-3.1-flash-lite',
    'gemini-flash-lite-latest',
  ];
  let lastError = null;

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const generationConfig = {
      temperature: 0.2,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    };
    if (responseJsonSchema && typeof responseJsonSchema === 'object') {
      generationConfig.responseSchema = responseJsonSchema;
    }

    let res;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig,
        }),
        signal: AbortSignal.timeout(25000),
      });
    } catch (fetchErr) {
      lastError = fetchErr;
      continue;
    }

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = payload?.error?.message || `Gemini HTTP ${res.status}`;
      console.warn(`Gemini model ${model} returned ${res.status}: ${msg}`);
      lastError = new Error(msg);
      if (res.status === 400 && /api_key_invalid|api key not valid/i.test(msg)) {
        throw lastError;
      }
      continue;
    }

    const text = (payload?.candidates?.[0]?.content?.parts || [])
      .map((p) => p?.text || '')
      .join('')
      .trim();

    const parsed = extractJsonObject(text);
    if (parsed && typeof parsed === 'object') {
      return { data: parsed, model };
    }
    lastError = new Error('Gemini returned an unreadable JSON response');
  }

  throw lastError || new Error('Gemini request failed');
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!isAuthorizedStaff(user)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const apiKey = String(secrets.get('GEMINI_API_KEY') || '').trim();

    if (body.action === 'status') {
      return Response.json({ configured: Boolean(apiKey) });
    }

    const prompt = String(body.prompt || '').trim();
    const responseJsonSchema = body.response_json_schema || null;
    if (!prompt) {
      return Response.json({ error: 'prompt is required' }, { status: 400 });
    }

    if (apiKey) {
      try {
        const { data, model } = await callGeminiApi(apiKey, prompt, responseJsonSchema);
        return Response.json({ data, provider: 'gemini', model });
      } catch (gemErr) {
        if (/api_key_invalid|api key not valid/i.test(gemErr?.message || '')) {
          return Response.json({ error: gemErr.message }, { status: 400 });
        }
      }
    }

    const builtinRes = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: responseJsonSchema,
    });
    return Response.json({ data: builtinRes, provider: 'builtin' });
  } catch (error) {
    return Response.json({ error: error.message || 'AI generation failed' }, { status: 500 });
  }
}