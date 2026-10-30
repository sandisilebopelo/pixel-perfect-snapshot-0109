import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ListChecks, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader, Panel } from "@/components/AppShell";
import { TaskForm } from "@/components/TaskForm";
import { TaskRow } from "@/components/TaskRow";
import { Button } from "@/components/ui/button";
import { sortByPriority, taskStatus, todayStr, useAppState } from "@/lib/store";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "My Tasks — FlowDesk AI" },
      { name: "description", content: "Track, prioritize and complete your tasks with a calendar view." },
      { property: "og:title", content: "My Tasks — FlowDesk AI" },
      { property: "og:description", content: "Track, prioritize and complete your tasks." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TasksPage,
});

const filters = ["all", "pending", "urgent", "overdue", "completed"] as const;

function iso(d: Date) {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function TasksPage() {
  const { tasks } = useAppState();
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [weekOffset, setWeekOffset] = useState(0);

  const filtered = sortByPriority(tasks).filter((t) => {
    const st = taskStatus(t);
    if (filter === "pending") return !t.completed;
    if (filter === "completed") return t.completed;
    if (filter === "urgent") return st === "urgent";
    if (filter === "overdue") return st === "overdue";
    return true;
  });
  const sorted = [...filtered.filter((t) => !t.completed), ...filtered.filter((t) => t.completed)];

  const monday = new Date(todayStr());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) + weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(monday); d.setDate(d.getDate() + i); return d; });

  return (
    <div>
      <PageHeader icon={ListChecks} title="My Tasks" subtitle="Everything on your plate, sorted by urgency and importance." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Panel>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {filters.map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1 text-sm capitalize transition ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>{f}</button>
              ))}
            </div>
            <div className="flex rounded-lg bg-muted p-0.5">
              {(["list", "calendar"] as const).map((v) => (
                <button key={v} onClick={() => setView(v)} className={`rounded-md px-3 py-1 text-sm capitalize ${view === v ? "bg-card shadow-card" : "text-muted-foreground"}`}>{v}</button>
              ))}
            </div>
          </div>
          {view === "list" ? (
            sorted.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No tasks here.</p> : <ul className="divide-y">{sorted.map((t) => <TaskRow key={t.id} task={t} />)}</ul>
          ) : (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <Button size="icon" variant="ghost" onClick={() => setWeekOffset(weekOffset - 1)} aria-label="Previous week"><ChevronLeft className="h-4 w-4" /></Button>
                <span className="text-sm font-medium">Week of {monday.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                <Button size="icon" variant="ghost" onClick={() => setWeekOffset(weekOffset + 1)} aria-label="Next week"><ChevronRight className="h-4 w-4" /></Button>
              </div>
              <div className="grid gap-2 sm:grid-cols-7">
                {days.map((d) => {
                  const key = iso(d);
                  const dayTasks = filtered.filter((t) => t.deadline === key);
                  const isToday = key === todayStr();
                  return (
                    <div key={key} className={`min-h-28 rounded-xl border p-2 ${isToday ? "border-highlight bg-accent/40" : ""}`}>
                      <p className="text-xs font-medium text-muted-foreground">{d.toLocaleDateString(undefined, { weekday: "short" })} {d.getDate()}</p>
                      <div className="mt-1.5 space-y-1">
                        {dayTasks.map((t) => {
                          const st = taskStatus(t);
                          return (
                            <div key={t.id} className={`truncate rounded-md px-1.5 py-1 text-xs ${st === "done" ? "bg-success/12 text-success line-through" : st === "overdue" ? "bg-destructive/12 text-destructive" : st === "urgent" ? "bg-warning/15 text-warning" : "bg-secondary text-secondary-foreground"}`} title={t.title}>{t.title}</div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Tasks appear on their deadline date.</p>
            </div>
          )}
        </Panel>
        <Panel className="h-fit"><h2 className="mb-4 font-semibold">Add task</h2><TaskForm /></Panel>
      </div>
    </div>
  );
}
