import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export type SiteData = {
  content: Record<string, string>;
  bioRows: { id: string; term: string; value: string; important: boolean }[];
  resources: { id: string; type: string; title: string; detail: string; url: string }[];
};

export const getSiteData = createServerFn({ method: "GET" }).handler(async (): Promise<SiteData> => {
  const supabase = publicClient();
  const [contentRes, bioRes, resRes] = await Promise.all([
    supabase.from("site_content").select("key, value").order("sort_order"),
    supabase.from("bio_rows").select("id, term, value, important").order("sort_order"),
    supabase.from("resources").select("id, type, title, detail, url").order("sort_order"),
  ]);

  const content: Record<string, string> = {};
  for (const row of contentRes.data ?? []) content[row.key] = row.value;

  if (content["portrait_path"]) {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data } = await supabaseAdmin.storage
        .from("portraits")
        .createSignedUrl(content["portrait_path"], 60 * 60 * 24 * 7);
      if (data?.signedUrl) content["portrait_url"] = data.signedUrl;
    } catch {
      /* portrait is optional */
    }
  }

  return {
    content,
    bioRows: bioRes.data ?? [],
    resources: resRes.data ?? [],
  };
});

export const sendMessage = createServerFn({ method: "POST" })
  .inputValidator((input: { name: string; email: string; message: string }) => {
    const name = input.name.trim().slice(0, 120);
    const email = input.email.trim().slice(0, 200);
    const message = input.message.trim().slice(0, 4000);
    if (!name || !email || !message) throw new Error("All fields are required.");
    return { name, email, message };
  })
  .handler(async ({ data }) => {
    const { error } = await publicClient().from("messages").insert(data);
    if (error) throw new Error("Message could not be sent.");
    return { ok: true };
  });
