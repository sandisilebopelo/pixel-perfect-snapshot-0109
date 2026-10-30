import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { History, Trash2, ChevronDown } from "lucide-react";
import { PageHeader, Panel } from "@/components/AppShell";
import { AiResult } from "@/components/AiOutput";
import { setState, useAppState, type AppState } from "@/lib/store";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — FlowDesk AI" },
      { name: "description", content: "Saved emails, meeting summaries, schedules and activity." },
      { property: "og:title", content: "History — FlowDesk AI" },
      { property: "og:description", content: "Saved emails, meeting summaries, schedules and activity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistoryPage,
});

type Tab = "emails" | "summaries" | "plans" | "activity";

function HistoryPage() {
  const s = useAppState();
  const [tab, setTab] = useState<Tab>("emails");
  const [open, setOpen] = useState<string | null>(null);

  const items =
    tab === "emails" ? s.emails.map((e) => ({ id: e.id, title: e.subject || `Email to ${e.recipient || "recipient"}`, meta: e.tone, content: e.content, createdAt: e.createdAt }))
    : tab === "summaries" ? s.summaries.map((m) => ({ id: m.id, title: m.title, meta: "Meeting", content: m.content, createdAt: m.createdAt }))
    : tab === "plans" ? s.plans.map((p) => ({ id: p.id, title: `${p.mode === "daily" ? "Daily" : "Weekly"} schedule`, meta: "Plan", content: p.content, createdAt: p.createdAt }))
    : [];

  const remove = (id: string) => setState((st) => ({ ...st, [tab]: (st[tab as Exclude<Tab, "activity">] as { id: string }[]).filter((x) => x.id !== id) }) as AppState);

  const tabs: [Tab, string, number][] = [["emails", "Emails", s.emails.length], ["summaries", "Meeting summaries", s.summaries.length], ["plans", "Schedules", s.plans.length], ["activity", "Activity", s.activity.length]];

  return (
    <div>
      <PageHeader icon={History} title="History" subtitle="Everything you've saved, kept on this device." />
      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map(([k, label, n]) => (
          <button key={k} onClick={() => setTab(k)} className={`rounded-full px-4 py-1.5 text-sm transition ${tab === k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>{label} · {n}</button>
        ))}
      </div>
      <Panel>
        {tab === "activity" ? (
          s.activity.length === 0 ? <p className="text-sm text-muted-foreground">No activity yet.</p> : (
            <ul className="divide-y">{s.activity.map((a) => (
              <li key={a.id} className="flex justify-between gap-4 py-3 text-sm"><span>{a.text}</span><span className="shrink-0 text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</span></li>
            ))}</ul>
          )
        ) : items.length === 0 ? <p className="text-sm text-muted-foreground">Nothing saved yet.</p> : (
          <ul className="divide-y">
            {items.map((it) => (
              <li key={it.id} className="py-3">
                <div className="flex items-center gap-3">
                  <button className="flex flex-1 items-center gap-2 text-left" onClick={() => setOpen(open === it.id ? null : it.id)}>
                    <ChevronDown className={`h-4 w-4 transition ${open === it.id ? "rotate-180" : ""}`} />
                    <span className="font-medium">{it.title}</span>
                    <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">{it.meta}</span>
                  </button>
                  <span className="hidden text-xs text-muted-foreground sm:inline">{new Date(it.createdAt).toLocaleString()}</span>
                  <button onClick={() => remove(it.id)} className="text-muted-foreground hover:text-destructive" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                </div>
                {open === it.id && <div className="mt-4 rounded-xl bg-muted/50 p-4"><AiResult loading={false} text={it.content} filename={`${it.title.replace(/\s+/g, "-").toLowerCase()}.md`} /></div>}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
