import { useEffect, useMemo, useState } from "react";
import { Droplet, Leaf, Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  buildTasks,
  dueLabel,
  isOverdue,
  loadCare,
  mergeTasks,
  saveCare,
  TASK_LABEL,
  type CareState,
  type MergedTask,
  type TaskKind,
} from "@/lib/care-schedule";
import type { AnalysisResult } from "@/lib/demo-analysis";
import type { IrrigationAdvice } from "@/lib/irrigation-advisor";

export function CareScheduler({
  history,
  watering,
}: {
  history: AnalysisResult[];
  watering: IrrigationAdvice["action"] | undefined;
}) {
  const [state, setState] = useState<CareState>({ done: {}, custom: [], removed: [] });
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<TaskKind>("inspect");
  const [when, setWhen] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => setState(loadCare()), []);

  const tasks = useMemo(
    () => mergeTasks(buildTasks(history, watering ?? "water"), state),
    [history, watering, state],
  );
  const open = tasks.filter((task) => !task.doneAt);
  const done = tasks
    .filter((task) => task.doneAt)
    .slice(-8)
    .reverse();
  const overdue = open.filter(isOverdue);

  function update(next: CareState) {
    setState(next);
    saveCare(next);
  }

  function toggle(task: MergedTask) {
    const nextDone = { ...state.done };
    if (task.doneAt) delete nextDone[task.id];
    else nextDone[task.id] = new Date().toISOString();
    update({ ...state, done: nextDone });
    if (!task.doneAt) toast.success("Task marked as done.");
  }

  function remove(task: MergedTask) {
    if (task.custom)
      update({ ...state, custom: state.custom.filter((item) => item.id !== task.id) });
    else update({ ...state, removed: [...state.removed, task.id] });
  }

  function add() {
    const clean = title.trim();
    if (!clean) return;
    const due = new Date(`${when}T08:00:00`);
    update({
      ...state,
      custom: [
        ...state.custom,
        {
          id: `custom-${Date.now()}`,
          kind,
          title: clean,
          why: "You added this task yourself.",
          due: due.toISOString(),
          priority: "Medium",
          custom: true,
        },
      ],
    });
    setTitle("");
    toast.success("Task added to your calendar.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Droplet className="size-5 text-primary" aria-hidden="true" /> Care calendar
          {overdue.length > 0 && <Badge variant="destructive">{overdue.length} missed</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_150px_150px_auto]">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Add your own task"
            maxLength={80}
            aria-label="Task name"
          />
          <Select value={kind} onValueChange={(value) => setKind(value as TaskKind)}>
            <SelectTrigger aria-label="Task type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TASK_LABEL).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={when}
            onChange={(event) => setWhen(event.target.value)}
            aria-label="Due date"
          />
          <Button onClick={add} className="min-h-11">
            <Plus aria-hidden="true" /> Add
          </Button>
        </div>

        {open.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nothing to do right now. Scan a leaf to build your calendar.
          </p>
        )}

        <ul className="space-y-2">
          {open.map((task) => (
            <li
              key={task.id}
              className={`flex flex-wrap items-start justify-between gap-3 rounded-xl border p-3 ${
                isOverdue(task) ? "border-destructive/50 bg-destructive/5" : ""
              }`}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-foreground">{task.title}</span>
                  <Badge variant="secondary">{TASK_LABEL[task.kind]}</Badge>
                  {task.priority === "High" && <Badge variant="destructive">High priority</Badge>}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{task.why}</p>
                <p className="mt-1 text-sm font-medium text-foreground">{dueLabel(task.due)}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="min-h-11" onClick={() => toggle(task)}>
                  <ShieldCheck aria-hidden="true" /> Done
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="min-h-11 min-w-11"
                  onClick={() => remove(task)}
                  aria-label={`Remove ${task.title}`}
                >
                  <Leaf aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ul>

        {done.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-foreground">Finished</p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {done.map((task) => (
                <li key={task.id} className="flex items-center justify-between gap-2">
                  <span className="line-through">{task.title}</span>
                  <Button variant="ghost" size="sm" onClick={() => toggle(task)}>
                    Undo
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
