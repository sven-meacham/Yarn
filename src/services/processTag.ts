import * as FileSystem from 'expo-file-system/legacy';

const fnUrl = () => {
  const base = process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  return base ? `${base}/functions/v1/process-tag` : '';
};

export type ProcessTagResponse = {
  ok: true;
  rawText: string;
  parsed: {
    brand: string;
    materials: { name: string; percent: number }[];
    country: string;
  };
  explanation: string;
};

export type ProcessTagError = {
  ok: false;
  error: string;
};

export async function processTagImage(
  imageUri: string,
  mimeType: string,
): Promise<ProcessTagResponse | ProcessTagError> {
  const url = fnUrl();
  const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    return { ok: false, error: 'Supabase URL or anon key missing. Check .env' };
  }

  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: 'base64',
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${anon}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imageBase64: base64,
      mimeType: mimeType || 'image/jpeg',
    }),
  });

  const json = (await res.json()) as ProcessTagResponse | ProcessTagError;

  if (!res.ok) {
    const err = json as ProcessTagError;
    return { ok: false, error: err.error ?? res.statusText ?? 'Request failed' };
  }

  if (json && typeof json === 'object' && 'ok' in json && json.ok === false) {
    return json as ProcessTagError;
  }

  return json as ProcessTagResponse;
}

/** Local / offline: skip Edge Function, use heuristic on placeholder text */
export async function processTagLocalFallback(rawText: string) {
  const { parseTagHeuristic } = await import('@/src/services/parseTag');
  const parsed = parseTagHeuristic(rawText);
  return {
    ok: true as const,
    rawText,
    parsed,
    explanation:
      'Offline parse: connect Supabase Edge Function `process-tag` with OPENAI_API_KEY for full AI parsing.',
  };
}
