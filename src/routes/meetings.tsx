import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Sparkles, Upload, Save } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel } from "@/components/AppShell";
import { AiResult } from "@/components/AiOutput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAi } from "@/lib/use-ai";
import { logActivity, setState, uid } from "@/lib/store";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — FlowDesk AI" },
      { name: "description", content: "Turn long meeting notes into summaries, decisions, action items and deadlines." },
      { property: "og:title", content: "Meeting Notes Summarizer — FlowDesk AI" },
      { property: "og:description", content: "Summaries, decisions, action items and deadlines from any meeting notes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState("");
  const { run, loading } = useAi();

  const onFile = async (f?: File) => {
    if (!f) return;
    if (f.size > 500_000) return toast.error("File is too large (max 500 KB).");
    setNotes(await f.text());
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
    toast.success(`Loaded ${f.name}`);
  };

  const summarize = async () => {
    if (notes.trim().length < 30) return toast.error("Please paste more meeting notes (at least a few sentences).");
    const text = await run(`Task: Meeting Notes Summarizer.
Meeting title: ${title || "Not specified"}
Summarize the notes below using exactly these Markdown sections:
## Meeting Summary
## Key Discussion Points
## Decisions Made  (only confirmed decisions; list suggestions separately as "Suggestions (not confirmed)")
## Action Items  (a table: Task | Responsible | Deadline — use "Not specified" when missing)
## Deadlines & Important Dates
## Open Questions / Follow-ups

Notes:
"""
${notes}
"""`);
    if (text) setResult(text);
  };

  const save = () => {
    setState((s) => ({ ...s, summaries: [{ id: uid(), title: title || "Untitled meeting", content: result, createdAt: Date.now() }, ...s.summaries] }));
    logActivity("summary", `Summarized meeting: ${title || "Untitled meeting"}`);
    toast.success("Summary saved to History");
  };

  return (
    <div>
      <PageHeader icon={FileText} title="Meeting Notes Summarizer" subtitle="Paste notes or upload a text file — get decisions, actions and deadlines." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="space-y-4">
          <div className="space-y-1.5"><Label>Meeting title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Q4 planning sync" /></div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Meeting notes *</Label>
              <label className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-highlight">
                <Upload className="h-4 w-4" />Upload .txt / .md
                <input type="file" accept=".txt,.md,text/plain,text/markdown" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
              </label>
            </div>
            <Textarea rows={16} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Paste your raw meeting notes or transcript here…" />
            <p className="text-xs text-muted-foreground">{notes.length.toLocaleString()} characters</p>
          </div>
          <Button className="w-full" onClick={summarize} disabled={loading}><Sparkles className="h-4 w-4" />{loading ? "Summarizing…" : "Summarize notes"}</Button>
        </Panel>
        <Panel>
          {result && !loading && (
            <div className="mb-3 flex justify-end"><Button size="sm" onClick={save}><Save className="h-4 w-4" />Save</Button></div>
          )}
          <AiResult loading={loading} text={result} filename={`${(title || "meeting-summary").replace(/\s+/g, "-").toLowerCase()}.md`} />
        </Panel>
      </div>
    </div>
  );
}
