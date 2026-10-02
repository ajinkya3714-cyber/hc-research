import { createOpenAI } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";
import { streamText } from "ai";
import { z } from "zod";

const RUN_ID = "X-Lovable-AIG-Run-ID";

function runIdFetch() {
  let runId: string | undefined;
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    if (runId && !headers.has(RUN_ID)) headers.set(RUN_ID, runId);
    const res = await fetch(input, { ...init, headers });
    runId ??= res.headers.get(RUN_ID)?.trim() || undefined;
    return res;
  };
}

const Body = z.object({ entryId: z.string().uuid(), question: z.string().trim().min(3).max(500) });

export async function handleExplain(request: Request): Promise<Response> {
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new Response("Please write a question (3–500 characters).", { status: 400 });

  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return new Response("AI is not configured.", { status: 500 });

  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const supabase = createClient(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  const { data: entry } = await supabase
    .from("browne_chronology")
    .select("year, title, category, summary, quote")
    .eq("id", parsed.data.entryId)
    .maybeSingle();
  if (!entry) return new Response("Chronology entry not found.", { status: 404 });

  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch(),
  });

  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    abortSignal: request.signal,
    system:
      "You are a scholar of seventeenth-century English literature and history, specialising in Sir Thomas Browne. Explain historical context clearly for students in 120–220 words of plain prose (no headings, no markdown lists). Stay on the topic of the given chronology entry and its era; politely decline unrelated requests. Do not invent quotations or dates; say when something is uncertain.",
    prompt: `Chronology entry:\nYear: ${entry.year}\nTitle: ${entry.title}\nCategory: ${entry.category}\nSummary: ${entry.summary}\n${entry.quote ? `Quotation: ${entry.quote}\n` : ""}\nVisitor's question: ${parsed.data.question}`,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const part of result.fullStream) {
          if (part.type === "text-delta") controller.enqueue(encoder.encode(part.text));
          else if (part.type === "error") {
            const e = part.error as { statusCode?: number; message?: string };
            const msg =
              e?.statusCode === 429 ? "Too many requests right now — please try again in a minute."
              : e?.statusCode === 402 ? "The AI allowance for this site has run out."
              : "Sorry, the explanation could not be generated.";
            controller.enqueue(encoder.encode(`\n\u0000ERR:${msg}`));
          }
        }
      } catch (err) {
        if (!request.signal.aborted) controller.enqueue(encoder.encode("\n\u0000ERR:Sorry, the explanation could not be generated."));
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache, no-transform" },
  });
}
