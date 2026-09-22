import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!data) throw new Error("Forbidden");
}

export type AdminData = {
  content: { key: string; label: string; value: string; multiline: boolean; sort_order: number }[];
  bioRows: { id: string; term: string; value: string; important: boolean; sort_order: number }[];
  resources: { id: string; type: string; title: string; detail: string; url: string; sort_order: number }[];
  messages: { id: string; name: string; email: string; message: string; created_at: string }[];
};

export const getAdminData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminData> => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [content, bio, res, msg] = await Promise.all([
      supabaseAdmin.from("site_content").select("key, label, value, multiline, sort_order").order("sort_order"),
      supabaseAdmin.from("bio_rows").select("id, term, value, important, sort_order").order("sort_order"),
      supabaseAdmin.from("resources").select("id, type, title, detail, url, sort_order").order("sort_order"),
      supabaseAdmin.from("messages").select("id, name, email, message, created_at").order("created_at", { ascending: false }),
    ]);
    return {
      content: content.data ?? [],
      bioRows: bio.data ?? [],
      resources: res.data ?? [],
      messages: msg.data ?? [],
    };
  });

export const saveContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { updates: { key: string; value: string }[] }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    for (const row of data.updates) {
      const { error } = await supabaseAdmin
        .from("site_content")
        .update({ value: row.value, updated_at: new Date().toISOString() })
        .eq("key", row.key);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const saveBioRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id?: string; term: string; value: string; important: boolean; sort_order: number }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload = { term: data.term, value: data.value, important: data.important, sort_order: data.sort_order };
    const { error } = data.id
      ? await supabaseAdmin.from("bio_rows").update(payload).eq("id", data.id)
      : await supabaseAdmin.from("bio_rows").insert(payload);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteBioRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("bio_rows").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const saveResource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id?: string; type: string; title: string; detail: string; url: string; sort_order: number }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload = {
      type: data.type,
      title: data.title,
      detail: data.detail,
      url: data.url,
      sort_order: data.sort_order,
    };
    const { error } = data.id
      ? await supabaseAdmin.from("resources").update(payload).eq("id", data.id)
      : await supabaseAdmin.from("resources").insert(payload);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteResource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("resources").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("messages").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
