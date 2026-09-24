import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, LogOut, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { claimFirstAdmin, listMembers, setAdmin } from "@/lib/admin.functions";
import {
  deleteBioRow,
  deleteMessage,
  deletePublication,
  deleteResource,
  getAdminData,
  saveBioRow,
  saveContent,
  savePublication,
  saveResource,
  type AdminData,
} from "@/lib/cms.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin | Harun Chaudhari" },
      { name: "description", content: "Manage the content of the Harun Chaudhari academic portfolio." },
      { property: "og:title", content: "Admin | Harun Chaudhari" },
      { property: "og:description", content: "Content management for the academic portfolio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const TABS = ["Content", "Bio-data", "Resources", "Publications", "Messages", "Members"] as const;
type Tab = (typeof TABS)[number];

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchAdmin = useServerFn(getAdminData);
  const claim = useServerFn(claimFirstAdmin);
  const [tab, setTab] = useState<Tab>("Content");
  const [claimed, setClaimed] = useState(false);

  const query = useQuery<AdminData>({ queryKey: ["admin-data", claimed], queryFn: () => fetchAdmin(), retry: false });

  useEffect(() => {
    if (!query.error || claimed) return;
    claim({} as never)
      .then((r) => {
        if (r?.granted) {
          setClaimed(true);
          toast.success("You are now the administrator.");
        }
      })
      .catch(() => undefined);
  }, [query.error, claimed, claim]);

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-data", claimed] });

  return (
    <div className="min-h-screen bg-secondary">
      <header className="sticky top-0 z-40 border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center border border-primary-foreground/30 font-serif text-sm font-bold">HC</span>
            <span className="font-serif">Site administration</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="heroOutline" size="sm" asChild>
              <Link to="/">View site</Link>
            </Button>
            <Button variant="heroOutline" size="sm" onClick={signOut}>
              <LogOut className="size-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        {query.isLoading && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading…
          </p>
        )}
        {query.error && !query.isLoading && (
          <div className="border border-border bg-card p-8">
            <h1 className="font-serif text-2xl">Access pending</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              This account does not have administrator access yet. Ask an existing administrator to grant it, then reload this page.
            </p>
          </div>
        )}

        {query.data && (
          <>
            <div className="mb-8 flex flex-wrap gap-2">
              {TABS.map((item) => (
                <button
                  key={item}
                  onClick={() => setTab(item)}
                  className={`border px-4 py-2 text-sm transition-colors ${
                    tab === item
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-primary"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {tab === "Content" && <ContentPanel data={query.data} onSaved={refresh} />}
            {tab === "Bio-data" && <BioPanel data={query.data} onSaved={refresh} />}
            {tab === "Resources" && <ResourcePanel data={query.data} onSaved={refresh} />}
            {tab === "Publications" && <PublicationsPanel data={query.data} onSaved={refresh} />}
            {tab === "Messages" && <MessagesPanel data={query.data} onSaved={refresh} />}
            {tab === "Members" && <MembersPanel />}
          </>
        )}
      </div>
    </div>
  );
}

function Panel({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="border border-border bg-card p-6 sm:p-8">
      <h2 className="font-serif text-2xl">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <div className="mt-7">{children}</div>
    </section>
  );
}

const inputClass = "w-full border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-accent";

function ContentPanel({ data, onSaved }: { data: AdminData; onSaved: () => void }) {
  const save = useServerFn(saveContent);
  const [values, setValues] = useState<Record<string, string>>(
    () => Object.fromEntries(data.content.map((row) => [row.key, row.value])),
  );
  const [busy, setBusy] = useState(false);
  const dirty = useMemo(() => data.content.some((row) => values[row.key] !== row.value), [data.content, values]);

  const submit = async () => {
    setBusy(true);
    try {
      const updates = data.content.filter((row) => values[row.key] !== row.value).map((row) => ({ key: row.key, value: values[row.key] ?? "" }));
      await save({ data: { updates } });
      toast.success("Content saved.");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel title="Page text" description="Edit every headline, paragraph and link shown on the public page.">
      <div className="grid gap-5">
        {data.content.map((row) =>
          row.key === "portrait_path" ? (
            <PortraitField
              key={row.key}
              label={row.label}
              value={values[row.key] ?? ""}
              onChange={(next) => setValues({ ...values, [row.key]: next })}
            />
          ) : (
            <label key={row.key} className="grid gap-2 text-sm">
              <span className="font-semibold text-primary">{row.label}</span>
              {row.multiline ? (
                <textarea rows={4} className={`${inputClass} resize-y`} value={values[row.key] ?? ""} onChange={(e) => setValues({ ...values, [row.key]: e.target.value })} />
              ) : (
                <input className={inputClass} value={values[row.key] ?? ""} onChange={(e) => setValues({ ...values, [row.key]: e.target.value })} />
              )}
            </label>
          ),
        )}
      </div>
      <Button className="mt-7" size="lg" disabled={!dirty || busy} onClick={submit}>
        {busy ? <Loader2 className="animate-spin" /> : <Check />} Save changes
      </Button>
    </Panel>
  );
}

function PortraitField({ label, value, onChange }: { label: string; value: string; onChange: (next: string) => void }) {
  const [preview, setPreview] = useState<string>("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    if (!value) {
      setPreview("");
      return;
    }
    supabase.storage
      .from("portraits")
      .createSignedUrl(value, 3600)
      .then(({ data }) => {
        if (active) setPreview(data?.signedUrl ?? "");
      });
    return () => {
      active = false;
    };
  }, [value]);

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `portrait-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("portraits").upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      onChange(path);
      toast.success("Photo uploaded. Remember to save changes.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-3 border border-border p-4 text-sm">
      <span className="font-semibold text-primary">{label}</span>
      <div className="flex flex-wrap items-center gap-5">
        {preview ? (
          <img src={preview} alt="Current portrait" className="size-28 border border-border object-cover" />
        ) : (
          <div className="grid size-28 place-items-center border border-dashed border-border text-xs text-muted-foreground">No photo</div>
        )}
        <div className="grid gap-2">
          <input
            type="file"
            accept="image/*"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
            }}
            className="text-xs text-muted-foreground file:mr-3 file:border file:border-border file:bg-background file:px-3 file:py-2 file:text-xs"
          />
          <p className="text-xs text-muted-foreground">
            {busy ? "Uploading…" : value ? "A photo is set. Click “Save changes” below to publish it." : "JPG or PNG, portrait orientation works best."}
          </p>
          {value && (
            <Button size="sm" variant="ghost" className="justify-self-start" onClick={() => onChange("")}>
              <Trash2 className="size-4" /> Remove photo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function BioPanel({ data, onSaved }: { data: AdminData; onSaved: () => void }) {
  const save = useServerFn(saveBioRow);
  const remove = useServerFn(deleteBioRow);
  const [draft, setDraft] = useState({ term: "", value: "" });

  const update = async (row: AdminData["bioRows"][number], patch: Partial<AdminData["bioRows"][number]>) => {
    await save({ data: { id: row.id, term: row.term, value: row.value, important: row.important, sort_order: row.sort_order, ...patch } });
    toast.success("Bio-data updated.");
    onSaved();
  };

  return (
    <Panel title="Bio-data rows" description="The personal particulars card in the About section.">
      <div className="grid gap-4">
        {data.bioRows.map((row) => (
          <BioRowEditor key={row.id} row={row} onSave={update} onDelete={async () => { await remove({ data: { id: row.id } }); toast.success("Row deleted."); onSaved(); }} />
        ))}
      </div>
      <div className="mt-8 border-t border-border pt-6">
        <p className="text-sm font-semibold text-primary">Add a row</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-[0.4fr_0.6fr_auto]">
          <input className={inputClass} placeholder="Label (e.g. Age)" value={draft.term} onChange={(e) => setDraft({ ...draft, term: e.target.value })} />
          <input className={inputClass} placeholder="Value" value={draft.value} onChange={(e) => setDraft({ ...draft, value: e.target.value })} />
          <Button
            disabled={!draft.term || !draft.value}
            onClick={async () => {
              await save({ data: { term: draft.term, value: draft.value, important: false, sort_order: data.bioRows.length + 1 } });
              setDraft({ term: "", value: "" });
              toast.success("Row added.");
              onSaved();
            }}
          >
            <Plus /> Add
          </Button>
        </div>
      </div>
    </Panel>
  );
}

function BioRowEditor({
  row,
  onSave,
  onDelete,
}: {
  row: AdminData["bioRows"][number];
  onSave: (row: AdminData["bioRows"][number], patch: Partial<AdminData["bioRows"][number]>) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [term, setTerm] = useState(row.term);
  const [value, setValue] = useState(row.value);
  const [important, setImportant] = useState(row.important);
  const changed = term !== row.term || value !== row.value || important !== row.important;

  return (
    <div className="grid gap-3 border border-border p-4 sm:grid-cols-[0.35fr_0.45fr_auto_auto_auto] sm:items-center">
      <input className={inputClass} value={term} onChange={(e) => setTerm(e.target.value)} />
      <input className={inputClass} value={value} onChange={(e) => setValue(e.target.value)} />
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <input type="checkbox" checked={important} onChange={(e) => setImportant(e.target.checked)} /> Highlight
      </label>
      <Button size="sm" disabled={!changed} onClick={() => onSave(row, { term, value, important })}>
        Save
      </Button>
      <Button size="sm" variant="ghost" aria-label="Delete row" onClick={onDelete}>
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

const emptyResource = { type: "Study guide", title: "", detail: "", url: "" };

function ResourcePanel({ data, onSaved }: { data: AdminData; onSaved: () => void }) {
  const save = useServerFn(saveResource);
  const remove = useServerFn(deleteResource);
  const [draft, setDraft] = useState(emptyResource);

  return (
    <Panel title="Resources" description="Downloadable guides, course materials and notes. Paste a link to the file.">
      <div className="grid gap-4">
        {data.resources.map((row) => (
          <ResourceEditor
            key={row.id}
            row={row}
            onSave={async (patch) => {
              await save({ data: { id: row.id, sort_order: row.sort_order, ...patch } });
              toast.success("Resource updated.");
              onSaved();
            }}
            onDelete={async () => {
              await remove({ data: { id: row.id } });
              toast.success("Resource deleted.");
              onSaved();
            }}
          />
        ))}
      </div>
      <div className="mt-8 border-t border-border pt-6">
        <p className="text-sm font-semibold text-primary">Add a resource</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input className={inputClass} placeholder="Category" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })} />
          <input className={inputClass} placeholder="Title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          <input className={inputClass} placeholder="Detail (e.g. PDF · 12 pages)" value={draft.detail} onChange={(e) => setDraft({ ...draft, detail: e.target.value })} />
          <input className={inputClass} placeholder="File link (optional)" value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} />
        </div>
        <Button
          className="mt-4"
          disabled={!draft.title}
          onClick={async () => {
            await save({ data: { ...draft, sort_order: data.resources.length + 1 } });
            setDraft(emptyResource);
            toast.success("Resource added.");
            onSaved();
          }}
        >
          <Plus /> Add resource
        </Button>
      </div>
    </Panel>
  );
}

function ResourceEditor({
  row,
  onSave,
  onDelete,
}: {
  row: AdminData["resources"][number];
  onSave: (patch: { type: string; title: string; detail: string; url: string }) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [form, setForm] = useState({ type: row.type, title: row.title, detail: row.detail, url: row.url });
  const changed = form.type !== row.type || form.title !== row.title || form.detail !== row.detail || form.url !== row.url;

  return (
    <div className="border border-border p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <input className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
        <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className={inputClass} value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} />
        <input className={inputClass} placeholder="File link" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" disabled={!changed} onClick={() => onSave(form)}>
          Save
        </Button>
        <Button size="sm" variant="ghost" onClick={onDelete}>
          <Trash2 className="size-4" /> Delete
        </Button>
      </div>
    </div>
  );
}

const PUB_CATEGORIES = ["Journal article", "Conference presentation", "Working paper", "Abstract", "Book chapter", "Other"];
type PubForm = { category: string; title: string; venue: string; year: string; authors: string; abstract: string; url: string };
const emptyPub: PubForm = { category: "Journal article", title: "", venue: "", year: "", authors: "", abstract: "", url: "" };

function PubFields({ form, setForm }: { form: PubForm; setForm: (f: PubForm) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
        {PUB_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
      </select>
      <input className={inputClass} placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
      <input className={`${inputClass} sm:col-span-2`} placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <input className={inputClass} placeholder="Journal / conference / venue" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
      <input className={inputClass} placeholder="Authors" value={form.authors} onChange={(e) => setForm({ ...form, authors: e.target.value })} />
      <textarea className={`${inputClass} sm:col-span-2 min-h-24`} placeholder="Abstract" value={form.abstract} onChange={(e) => setForm({ ...form, abstract: e.target.value })} />
      <input className={`${inputClass} sm:col-span-2`} placeholder="Link to full text (optional)" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
    </div>
  );
}

function PublicationsPanel({ data, onSaved }: { data: AdminData; onSaved: () => void }) {
  const save = useServerFn(savePublication);
  const remove = useServerFn(deletePublication);
  const [draft, setDraft] = useState<PubForm>(emptyPub);
  return (
    <Panel title="Publications" description="Journal articles, conference presentations, working papers and abstracts.">
      <div className="grid gap-4">
        {data.publications.map((row) => (
          <PublicationEditor
            key={row.id}
            row={row}
            onSave={async (patch) => {
              await save({ data: { id: row.id, sort_order: row.sort_order, ...patch } });
              toast.success("Publication updated.");
              onSaved();
            }}
            onDelete={async () => {
              await remove({ data: { id: row.id } });
              toast.success("Publication deleted.");
              onSaved();
            }}
          />
        ))}
      </div>
      <div className="mt-8 border-t border-border pt-6">
        <p className="mb-3 text-sm font-semibold text-primary">Add a publication</p>
        <PubFields form={draft} setForm={setDraft} />
        <Button
          className="mt-4"
          disabled={!draft.title}
          onClick={async () => {
            await save({ data: { ...draft, sort_order: data.publications.length + 1 } });
            setDraft(emptyPub);
            toast.success("Publication added.");
            onSaved();
          }}
        >
          <Plus /> Add publication
        </Button>
      </div>
    </Panel>
  );
}

function PublicationEditor({ row, onSave, onDelete }: { row: AdminData["publications"][number]; onSave: (p: PubForm) => Promise<void>; onDelete: () => Promise<void> }) {
  const initial: PubForm = { category: row.category, title: row.title, venue: row.venue, year: row.year, authors: row.authors, abstract: row.abstract, url: row.url };
  const [form, setForm] = useState<PubForm>(initial);
  const changed = JSON.stringify(form) !== JSON.stringify(initial);
  return (
    <div className="border border-border p-4">
      <PubFields form={form} setForm={setForm} />
      <div className="mt-3 flex gap-2">
        <Button size="sm" disabled={!changed || !form.title} onClick={() => onSave(form)}>Save</Button>
        <Button size="sm" variant="ghost" onClick={onDelete}><Trash2 className="size-4" /> Delete</Button>
      </div>
    </div>
  );
}

function MessagesPanel({ data, onSaved }: { data: AdminData; onSaved: () => void }) {
  const remove = useServerFn(deleteMessage);
  return (
    <Panel title="Messages" description="Enquiries submitted through the contact form.">
      {data.messages.length === 0 ? (
        <p className="text-sm text-muted-foreground">No messages yet.</p>
      ) : (
        <div className="grid gap-4">
          {data.messages.map((m) => (
            <article key={m.id} className="border border-border p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-primary">{m.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.email} · {new Date(m.created_at).toLocaleString()}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    await remove({ data: { id: m.id } });
                    toast.success("Message deleted.");
                    onSaved();
                  }}
                >
                  <Trash2 className="size-4" /> Delete
                </Button>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{m.message}</p>
            </article>
          ))}
        </div>
      )}
    </Panel>
  );
}

function MembersPanel() {
  const fetchMembers = useServerFn(listMembers);
  const toggle = useServerFn(setAdmin);
  const queryClient = useQueryClient();
  const members = useQuery({ queryKey: ["admin-members"], queryFn: () => fetchMembers(), retry: false });

  return (
    <Panel title="Members" description="Everyone who has signed in. Grant or remove administrator access.">
      {members.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      <div className="grid gap-3">
        {(members.data ?? []).map((m: any) => (
          <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 border border-border p-4">
            <div>
              <p className="text-sm font-semibold text-primary">{m.display_name || m.email}</p>
              <p className="text-xs text-muted-foreground">{m.email}</p>
            </div>
            <Button
              size="sm"
              variant={m.isAdmin ? "ghost" : "default"}
              onClick={async () => {
                try {
                  await toggle({ data: { userId: m.id, isAdmin: !m.isAdmin } });
                  toast.success(m.isAdmin ? "Administrator access removed." : "Administrator access granted.");
                  queryClient.invalidateQueries({ queryKey: ["admin-members"] });
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Could not update.");
                }
              }}
            >
              {m.isAdmin ? "Remove admin" : "Make admin"}
            </Button>
          </div>
        ))}
      </div>
    </Panel>
  );
}
