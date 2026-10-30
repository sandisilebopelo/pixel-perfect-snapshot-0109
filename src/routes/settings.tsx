import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Settings } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { setState, useAppState } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — FlowDesk AI" },
      { name: "description", content: "Personalize your FlowDesk AI workspace." },
      { property: "og:title", content: "Settings — FlowDesk AI" },
      { property: "og:description", content: "Personalize your FlowDesk AI workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const s = useAppState();
  const [name, setName] = useState(s.name);
  useEffect(() => setName(s.name), [s.name]);

  return (
    <div>
      <PageHeader icon={Settings} title="Settings" subtitle="Personalize your workspace." />
      <div className="max-w-xl space-y-6">
        <Panel className="space-y-4">
          <div className="space-y-1.5"><Label>Your name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Used in your dashboard greeting" /></div>
          <Button onClick={() => { setState((st) => ({ ...st, name: name.trim() })); toast.success("Saved"); }}>Save</Button>
        </Panel>
        <Panel className="flex items-center justify-between">
          <div><p className="font-medium">Dark mode</p><p className="text-sm text-muted-foreground">Easier on the eyes at night.</p></div>
          <Switch checked={s.theme === "dark"} onCheckedChange={(v) => setState((st) => ({ ...st, theme: v ? "dark" : "light" }))} />
        </Panel>
        <Panel className="flex items-center justify-between gap-4">
          <div><p className="font-medium">Clear all data</p><p className="text-sm text-muted-foreground">Deletes tasks, saved items and history on this device.</p></div>
          <Button variant="destructive" onClick={() => {
            if (!confirm("Delete all data? This cannot be undone.")) return;
            setState((st) => ({ ...st, tasks: [], emails: [], summaries: [], plans: [], activity: [] }));
            toast.success("All data cleared");
          }}>Clear</Button>
        </Panel>
      </div>
    </div>
  );
}
