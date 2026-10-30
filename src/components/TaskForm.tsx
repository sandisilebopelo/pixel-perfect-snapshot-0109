import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { logActivity, setState, uid, type Priority } from "@/lib/store";

export function TaskForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [duration, setDuration] = useState("60");
  const [importance, setImportance] = useState<Priority>("medium");

  const add = () => {
    if (!title.trim()) return toast.error("Task title is required.");
    const d = Number(duration);
    if (!d || d < 5 || d > 1440) return toast.error("Duration must be between 5 and 1440 minutes.");
    setState((s) => ({
      ...s,
      tasks: [{ id: uid(), title: title.trim(), description: description.trim(), deadline, duration: d, importance, completed: false, createdAt: Date.now() }, ...s.tasks],
    }));
    logActivity("task", `Added task: ${title.trim()}`);
    setTitle(""); setDescription(""); setDeadline(""); setDuration("60"); setImportance("medium");
    toast.success("Task added");
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5"><Label>Task *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Prepare quarterly report" onKeyDown={(e) => e.key === "Enter" && add()} /></div>
      <div className="space-y-1.5"><Label>Description</Label><Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional details or dependencies" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Deadline</Label><Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Duration (min)</Label><Input type="number" min={5} max={1440} step={5} value={duration} onChange={(e) => setDuration(e.target.value)} /></div>
      </div>
      <div className="space-y-1.5">
        <Label>Importance</Label>
        <div className="grid grid-cols-3 gap-2">
          {(["high", "medium", "low"] as const).map((p) => (
            <button key={p} onClick={() => setImportance(p)} className={`rounded-lg border py-1.5 text-sm capitalize transition ${importance === p ? "border-highlight bg-accent text-accent-foreground" : "hover:bg-muted"}`}>{p}</button>
          ))}
        </div>
      </div>
      <Button variant="secondary" className="w-full" onClick={add}><Plus className="h-4 w-4" />Add task</Button>
    </div>
  );
}
