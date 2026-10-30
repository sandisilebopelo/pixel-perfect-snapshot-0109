import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarClock, Sparkles, Save } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel } from "@/components/AppShell";
import { AiResult } from "@/components/AiOutput";
import { TaskForm } from "@/components/TaskForm";
import { TaskRow } from "@/components/TaskRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAi } from "@/lib/use-ai";
import { logActivity, setState, sortByPriority, todayStr, uid, useAppState } from "@/lib/store";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — FlowDesk AI" },
      { name: "description", content: "Prioritize tasks and generate realistic daily or weekly schedules with AI." },
      { property: "og:title", content: "AI Task Planner — FlowDesk AI" },
      { property: "og:description", content: "Prioritized tasks and realistic daily or weekly schedules." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const { tasks } = useAppState();
  const pending = sortByPriority(tasks.filter((t) => !t.completed));
  const [mode, setMode] = useState<"daily" | "weekly">("daily");
  const [start, setStart] = useState("08:00");
  const [end, setEnd] = useState("17:00");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState("");
  const { run, loading } = useAi();

  const plan = async () => {
    if (pending.length === 0) return toast.error("Add at least one pending task first.");
    if (start >= end) return toast.error("End time must be after start time.");
    const list = pending
      .map((t, i) => `${i + 1}. ${t.title}${t.description ? ` — ${t.description}` : ""} | duration: ${t.duration} min | importance: ${t.importance} | deadline: ${t.deadline || "Not specified"}`)
      .join("\n");
    const text = await run(`Task: AI Task Planner/Scheduler.
Today is ${todayStr()} (${new Date().toLocaleDateString(undefined, { weekday: "long" })}). Create a ${mode} schedule.
Available working hours each day: ${start}–${end}.
${notes ? `User preferences/constraints: ${notes}` : ""}
Tasks:
${list}

Output Markdown sections:
## Priority Ranking (table: Rank | Task | Why | Deadline)
## ${mode === "daily" ? "Today's Timetable" : "Weekly Timetable"} (table: ${mode === "daily" ? "Time" : "Day | Time"} | Task | Duration) — include short breaks and buffer time, no overlaps; split long tasks if needed; flag anything overdue.
## Important Upcoming Deadlines
## Recommended Next Action`);
    if (text) setResult(text);
  };

  const save = () => {
    setState((s) => ({ ...s, plans: [{ id: uid(), mode, content: result, createdAt: Date.now() }, ...s.plans] }));
    logActivity("plan", `Generated ${mode} schedule for ${pending.length} tasks`);
    toast.success("Schedule saved to History");
  };

  return (
    <div>
      <PageHeader icon={CalendarClock} title="AI Task Planner" subtitle="Add tasks, then let AI prioritize and build your schedule." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="space-y-6">
          <Panel><h2 className="mb-4 font-semibold">New task</h2><TaskForm /></Panel>
          <Panel>
            <h2 className="mb-1 font-semibold">Pending tasks · recommended order</h2>
            {pending.length === 0 ? <p className="py-3 text-sm text-muted-foreground">No pending tasks yet.</p> : (
              <ul className="divide-y">{pending.map((t, i) => <TaskRow key={t.id} task={t} rank={i + 1} />)}</ul>
            )}
          </Panel>
        </div>
        <Panel className="space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
            {(["daily", "weekly"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} className={`rounded-lg py-1.5 text-sm font-medium capitalize transition ${mode === m ? "bg-card shadow-card" : "text-muted-foreground"}`}>{m}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Start</Label><Input type="time" value={start} onChange={(e) => setStart(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>End</Label><Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
          </div>
          <div className="space-y-1.5"><Label>Preferences (optional)</Label><Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. lunch at 12:30, deep work in the morning" /></div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={plan} disabled={loading}><Sparkles className="h-4 w-4" />{loading ? "Planning…" : `Generate ${mode} schedule`}</Button>
            {result && !loading && <Button variant="outline" onClick={save}><Save className="h-4 w-4" />Save</Button>}
          </div>
          <div className="border-t pt-4"><AiResult loading={loading} text={result} filename={`${mode}-schedule.md`} /></div>
        </Panel>
      </div>
    </div>
  );
}
