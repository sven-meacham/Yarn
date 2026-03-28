import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { z } from "npm:zod@3.23.8";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ParsedSchema = z.object({
  brand: z.string(),
  materials: z.array(
    z.object({
      name: z.string(),
      percent: z.coerce.number(),
    }),
  ),
  country: z.string(),
  rawText: z.string(),
  explanation: z.string(),
});

type Body = {
  imageBase64?: string;
  mimeType?: string;
  rawText?: string;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return json(
        { ok: false, error: "OPENAI_API_KEY not configured on Edge Function" },
        500,
      );
    }

    const body = (await req.json()) as Body;

    let userMessage:
      | string
      | Array<
          | { type: "text"; text: string }
          | { type: "image_url"; image_url: { url: string } }
        >;

    if (body.rawText && !body.imageBase64) {
      userMessage =
        `Extract structured data from this clothing tag text.\n\nTag text:\n"""${body.rawText}"""\n\nReturn JSON only with keys: brand, materials (array of {name, percent}), country, rawText (copy of input), explanation (2-3 sentences for shoppers; demo tone).`;
    } else if (body.imageBase64) {
      const mime = body.mimeType ?? "image/jpeg";
      const dataUrl = `data:${mime};base64,${body.imageBase64}`;
      userMessage = [
        {
          type: "text",
          text:
            `Read this clothing care/composition tag image. Extract brand, material percentages, and country of origin (e.g. Made in X). Return JSON only with keys: brand, materials (array of {name, percent}), country, rawText (all text you read from the tag), explanation (2-3 short sentences for a consumer app demo). Use lowercase material names where possible (cotton, polyester). Country as plain English name.`,
        },
        { type: "image_url", image_url: { url: dataUrl } },
      ];
    } else {
      return json({ ok: false, error: "Send imageBase64 or rawText" }, 400);
    }

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a precise assistant for a clothing tag scanner app. Output valid JSON only.",
          },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error("OpenAI error", openaiRes.status, errText);
      return json(
        { ok: false, error: `OpenAI error ${openaiRes.status}` },
        502,
      );
    }

    const openaiJson = (await openaiRes.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = openaiJson.choices?.[0]?.message?.content;
    if (!content) {
      return json({ ok: false, error: "Empty OpenAI response" }, 502);
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(content);
    } catch {
      return json({ ok: false, error: "Invalid JSON from model" }, 502);
    }

    const parsed = ParsedSchema.safeParse(parsedJson);
    if (!parsed.success) {
      console.error(parsed.error.flatten());
      return json({ ok: false, error: "Response failed validation" }, 502);
    }

    const out = parsed.data;
    return json({
      ok: true,
      rawText: out.rawText,
      parsed: {
        brand: out.brand,
        materials: out.materials,
        country: out.country,
      },
      explanation: out.explanation,
    });
  } catch (e) {
    console.error(e);
    return json(
      { ok: false, error: e instanceof Error ? e.message : "Server error" },
      500,
    );
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
