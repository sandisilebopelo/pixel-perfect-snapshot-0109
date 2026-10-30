import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Sparkles, RefreshCw, Save, Copy, Minimize2, Maximize2, Briefcase, Pencil, Eye } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel } from "@/components/AppShell";
import { AiResult, copyText, Markdown } from "@/components/AiOutput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAi } from "@/lib/use-ai";
import { logActivity, setState, uid } from "@/lib/store";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — FlowDesk AI" },
      { name: "description", content: "Generate professional emails in formal, friendly, persuasive or apologetic tones." },
      { property: "og:title", content: "Smart Email Generator — FlowDesk AI" },
      { property: "og:description", content: "Generate professional emails in any tone from a short description." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EmailPage,
});

const tones = ["Formal", "Friendly", "Persuasive", "Professional", "Apologetic"];

function EmailPage() {
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [purpose, setPurpose] = useState("");
  const [tone, setTone] = useState("Professional");
  const [result, setResult] = useState("");
  const [editing, setEditing] = useState(false);
  const { run, loading } = useAi();

  const generate = async () => {
    if (!purpose.trim()) return toast.error("Please describe the purpose of the email.");
    const text = await run(`Task: Smart Email Generator.
Write a complete email in a ${tone.toLowerCase()} tone.
Recipient: ${recipient || "Not specified"}
Subject idea: ${subject || "Suggest one"}
Purpose / key points: ${purpose}

Output format (Markdown): first line "**Subject:** ...", then a blank line, then the greeting, body paragraphs, and closing with sign-off. Use placeholders like [Your Name] for unknown details. Do not invent facts.`);
    if (text) { setResult(text); setEditing(false); }
  };

  const refine = async (instruction: string) => {
    if (!result) return;
    const text = await run(`Rewrite the following email: ${instruction}. Keep the same facts, the "**Subject:**" line format, and output only the email.\n\n${result}`);
    if (text) setResult(text);
  };

  const save = () => {
    setState((s) => ({ ...s, emails: [{ id: uid(), recipient, subject, tone, content: result, createdAt: Date.now() }, ...s.emails] }));
    logActivity("email", `Saved email${subject ? `: ${subject}` : ""} (${tone})`);
    toast.success("Email saved to History");
  };

  return (
    <div>
      <PageHeader icon={Mail} title="Smart Email Generator" subtitle="Describe what you need — AI writes the full email." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Panel className="space-y-4">
          <div className="space-y-1.5"><Label>Recipient</Label><Input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="e.g. Ms. Dlamini, HR Manager" /></div>
          <div className="space-y-1.5"><Label>Subject</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Optional — AI can suggest one" /></div>
          <div className="space-y-1.5"><Label>Purpose & key points *</Label><Textarea rows={6} value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Request leave from 10–14 Nov for a family event, handover plan ready" /></div>
          <div className="space-y-1.5">
            <Label>Tone</Label>
            <div className="flex flex-wrap gap-2">
              {tones.map((t) => (
                <button key={t} onClick={() => setTone(t)} className={`rounded-full border px-3.5 py-1.5 text-sm transition ${tone === t ? "border-highlight bg-accent text-accent-foreground" : "hover:bg-muted"}`}>{t}</button>
              ))}
            </div>
          </div>
          <Button className="w-full" onClick={generate} disabled={loading}><Sparkles className="h-4 w-4" />{loading ? "Generating…" : "Generate email"}</Button>
        </Panel>
        <Panel>
          {result && !loading ? (
            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => copyText(result)}><Copy className="h-4 w-4" />Copy</Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(!editing)}>{editing ? <Eye className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}{editing ? "Preview" : "Edit"}</Button>
                <Button size="sm" variant="outline" onClick={generate}><RefreshCw className="h-4 w-4" />Regenerate</Button>
                <Button size="sm" onClick={save}><Save className="h-4 w-4" />Save</Button>
              </div>
              <div className="mb-5 flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => refine("make it shorter and more concise")}><Minimize2 className="h-4 w-4" />Shorter</Button>
                <Button size="sm" variant="secondary" onClick={() => refine("make it longer with more detail")}><Maximize2 className="h-4 w-4" />Longer</Button>
                <Button size="sm" variant="secondary" onClick={() => refine("make it more professional")}><Briefcase className="h-4 w-4" />More professional</Button>
              </div>
              {editing ? <Textarea rows={18} value={result} onChange={(e) => setResult(e.target.value)} /> : <Markdown text={result} />}
            </div>
          ) : (
            <AiResult loading={loading} text="" />
          )}
        </Panel>
      </div>
    </div>
  );
}
