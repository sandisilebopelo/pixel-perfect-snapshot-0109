import { Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { logActivity, setState, taskStatus, type Task } from "@/lib/store";

const badge: Record<string, string> = {
  overdue: "bg-destructive/12 text-destructive",
  urgent: "bg-warning/15 text-warning",
  done: "bg-success/12 text-success",
};

export function TaskRow({ task, rank }: { task: Task; rank?: number }) {
  const st = taskStatus(task);
  const toggle = () => {
    setState((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t)) }));
    if (!task.completed) logActivity("task", `Completed task: ${task.title}`);
  };
  const remove = () => setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== task.id) }));
  return (
    <li className="flex items-start gap-3 py-3">
      <Checkbox checked={task.completed} onCheckedChange={toggle} className="mt-0.5" aria-label={`Mark ${task.title} complete`} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {rank !== undefined && <span className="text-xs font-semibold text-muted-foreground">#{rank}</span>}
          <span className={`font-medium ${task.completed ? "text-muted-foreground line-through" : ""}`}>{task.title}</span>
          {st !== "normal" && <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${badge[st]}`}>{st}</span>}
        </div>
        {task.description && <p className="mt-0.5 text-sm text-muted-foreground">{task.description}</p>}
        <p className="mt-1 text-xs text-muted-foreground">
          {task.duration} min · <span className="capitalize">{task.importance}</span> importance{task.deadline ? ` · due ${new Date(task.deadline).toLocaleDateString()}` : ""}
        </p>
      </div>
      <button onClick={remove} className="text-muted-foreground hover:text-destructive" aria-label="Delete task"><Trash2 className="h-4 w-4" /></button>
    </li>
  );
}
