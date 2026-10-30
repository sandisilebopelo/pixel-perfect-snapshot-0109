import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, FileText, CalendarClock, ListChecks, CheckCircle2, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import { Panel } from "@/components/AppShell";
import { sortByPriority, taskStatus, useAppState } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — FlowDesk AI" },
      { name: "description", content: "Your productivity overview: tasks, deadlines and AI tools in one place." },
      { property: "og:title", content: "Dashboard — FlowDesk AI" },
      { property: "og:description", content: "Your productivity overview: tasks, deadlines and AI tools in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const tools = [
  { to: "/email", title: "Smart Email Generator", desc: "Draft polished emails in any tone.", icon: Mail },
  { to: "/meetings", title: "Meeting Notes Summarizer", desc: "Decisions, actions and deadlines.", icon: FileText },
  { to: "/planner", title: "AI Task Planner", desc: "Prioritized daily & weekly schedules.", icon: CalendarClock },
] as const;

function Dashboard() {
  const s = useAppState();
  const total = s.tasks.length;
  const done = s.tasks.filter((t) => t.completed).length;
  const upcoming = sortByPriority(s.tasks.filter((t) => !t.completed && t.deadline)).slice(0, 5);
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const stats = [
    { label: "Total tasks", value: total, icon: ListChecks, tone: "text-primary" },
    { label: "Completed", value: done, icon: CheckCircle2, tone: "text-success" },
    { label: "Pending", value: total - done, icon: Clock, tone: "text-warning" },
    { label: "Upcoming deadlines", value: upcoming.length, icon: AlertTriangle, tone: "text-highlight" },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-brand p-7 text-primary-foreground sm:p-10">
        <p className="text-sm opacity-80">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{greet}{s.name ? `, ${s.name}` : ""}.</h1>
        <p className="mt-2 max-w-xl opacity-85">
          {total === 0 ? "Add your first task or try an AI tool to get started." : `You have ${total - done} pending task${total - done === 1 ? "" : "s"} and ${done} completed.`}
        </p>
        {total > 0 && (
          <div className="mt-6 h-2 max-w-md overflow-hidden rounded-full bg-primary-foreground/20">
            <div className="h-full rounded-full bg-primary-foreground" style={{ width: `${(done / total) * 100}%` }} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <Panel key={label}>
            <Icon className={`h-5 w-5 ${tone}`} />
            <p className="mt-3 font-display text-3xl font-semibold">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </Panel>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {tools.map(({ to, title, desc, icon: Icon }) => (
          <Link key={to} to={to} className="group rounded-2xl border bg-card p-6 shadow-card transition hover:-translate-y-0.5 hover:border-highlight/50">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground"><Icon className="h-5 w-5" /></div>
            <h3 className="mt-4 font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-highlight">Open <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Upcoming deadlines</h2><Link to="/tasks" className="text-sm text-highlight">All tasks</Link></div>
          {upcoming.length === 0 ? <p className="text-sm text-muted-foreground">No upcoming deadlines.</p> : (
            <ul className="divide-y">
              {upcoming.map((t) => {
                const st = taskStatus(t);
                return (
                  <li key={t.id} className="flex items-center justify-between py-3 text-sm">
                    <span className="font-medium">{t.title}</span>
                    <span className={st === "overdue" ? "text-destructive" : st === "urgent" ? "text-warning" : "text-muted-foreground"}>
                      {st === "overdue" ? "Overdue · " : ""}{new Date(t.deadline).toLocaleDateString()}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
        <Panel>
          <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Recent activity</h2><Link to="/history" className="text-sm text-highlight">History</Link></div>
          {s.activity.length === 0 ? <p className="text-sm text-muted-foreground">No activity yet.</p> : (
            <ul className="divide-y">
              {s.activity.slice(0, 6).map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <span className="truncate">{a.text}</span>
                  <span className="shrink-0 text-muted-foreground">{new Date(a.createdAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
