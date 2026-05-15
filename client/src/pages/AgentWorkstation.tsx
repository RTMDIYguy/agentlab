import { useAuth } from "@/_core/hooks/useAuth";
import { PageLayout } from "@/components/PageLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  ClipboardList,
  Copy,
  Link2,
  Loader2,
  PlayCircle,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type TaskPriority = "low" | "medium" | "high" | "critical";
type TaskOwner = "ai" | "human" | "hybrid";
type TaskStatus = "backlog" | "in_progress" | "blocked" | "review" | "done";
type TaskTab = "all" | TaskStatus;

type WorkstationTask = {
  id: string;
  title: string;
  objective: string;
  context: string;
  acceptanceCriteria: string;
  priority: TaskPriority;
  owner: TaskOwner;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

type TaskFormState = {
  title: string;
  objective: string;
  context: string;
  acceptanceCriteria: string;
  priority: TaskPriority;
  owner: TaskOwner;
};

const STORAGE_KEY = "agentlab-agent-workstation-tasks-v1";

const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: "Backlog",
  in_progress: "In Progress",
  blocked: "Blocked",
  review: "Review",
  done: "Done",
};

const STATUS_BADGE_VARIANTS: Record<
  TaskStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  backlog: "outline",
  in_progress: "default",
  blocked: "destructive",
  review: "secondary",
  done: "secondary",
};

const PRIORITY_BADGE_VARIANTS: Record<
  TaskPriority,
  "default" | "secondary" | "destructive" | "outline"
> = {
  low: "outline",
  medium: "secondary",
  high: "default",
  critical: "destructive",
};

const OWNER_LABELS: Record<TaskOwner, string> = {
  ai: "AI Agent",
  human: "Human",
  hybrid: "Hybrid",
};

const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  backlog: "in_progress",
  in_progress: "review",
  blocked: "in_progress",
  review: "done",
  done: "backlog",
};

function makeTaskId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getInitialFormState(): TaskFormState {
  return {
    title: "",
    objective: "",
    context: "",
    acceptanceCriteria: "",
    priority: "medium",
    owner: "hybrid",
  };
}

function createStarterTasks(): WorkstationTask[] {
  const now = Date.now();
  return [
    {
      id: makeTaskId(),
      title: "Triage incoming tasks",
      objective:
        "Collect and prioritize all open requests so work starts from one source of truth.",
      context:
        "Use this as the daily intake gate before assigning work to AI, human, or hybrid execution.",
      acceptanceCriteria:
        "All incoming requests are captured with clear owner, status, and priority.",
      priority: "high",
      owner: "hybrid",
      status: "backlog",
      createdAt: new Date(now - 60_000).toISOString(),
      updatedAt: new Date(now - 60_000).toISOString(),
    },
    {
      id: makeTaskId(),
      title: "Prepare AI handoff brief template",
      objective:
        "Standardize how tasks are handed to agents so output quality is consistent.",
      context:
        "Reference business constraints, deliverables, and acceptance criteria in one prompt.",
      acceptanceCriteria:
        "Brief includes objective, context, deliverables, and completion definition.",
      priority: "medium",
      owner: "ai",
      status: "in_progress",
      createdAt: new Date(now - 45_000).toISOString(),
      updatedAt: new Date(now - 30_000).toISOString(),
    },
  ];
}

function buildHandoffBrief(task: WorkstationTask): string {
  return [
    `Task Title: ${task.title}`,
    "",
    "Primary Objective:",
    task.objective,
    "",
    "Task Context:",
    task.context || "No additional context provided.",
    "",
    "Acceptance Criteria:",
    task.acceptanceCriteria || "No explicit acceptance criteria provided.",
    "",
    `Priority: ${task.priority.toUpperCase()}`,
    `Execution Owner: ${OWNER_LABELS[task.owner]}`,
    `Current Status: ${STATUS_LABELS[task.status]}`,
    "",
    "Execution Rules:",
    "- Work from this brief as the source of truth.",
    "- Keep changes scoped to the objective.",
    "- Return clear completion notes and unresolved blockers.",
  ].join("\n");
}

export default function AgentWorkstation() {
  const { loading } = useAuth({ redirectOnUnauthenticated: true });
  const [tasks, setTasks] = useState<WorkstationTask[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [taskTab, setTaskTab] = useState<TaskTab>("all");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [form, setForm] = useState<TaskFormState>(getInitialFormState());
  const analyzeMutation = trpc.opsCleanup.analyze.useMutation();

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setTasks(createStarterTasks());
      } else {
        const parsed = JSON.parse(raw) as WorkstationTask[];
        if (Array.isArray(parsed)) {
          setTasks(parsed);
        } else {
          setTasks(createStarterTasks());
        }
      }
    } catch {
      setTasks(createStarterTasks());
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, hydrated]);

  useEffect(() => {
    if (!tasks.length) {
      setSelectedTaskId(null);
      return;
    }
    if (!selectedTaskId || !tasks.some(task => task.id === selectedTaskId)) {
      setSelectedTaskId(tasks[0].id);
    }
  }, [tasks, selectedTaskId]);

  const sortedTasks = useMemo(
    () =>
      [...tasks].sort(
        (left, right) =>
          new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
      ),
    [tasks],
  );

  const visibleTasks = useMemo(() => {
    if (taskTab === "all") return sortedTasks;
    return sortedTasks.filter(task => task.status === taskTab);
  }, [sortedTasks, taskTab]);

  const selectedTask = useMemo(() => {
    if (!sortedTasks.length) return null;
    return sortedTasks.find(task => task.id === selectedTaskId) ?? sortedTasks[0];
  }, [sortedTasks, selectedTaskId]);

  const handoffBrief = useMemo(
    () => (selectedTask ? buildHandoffBrief(selectedTask) : ""),
    [selectedTask],
  );

  const statusCounts = useMemo(
    () => ({
      total: tasks.length,
      backlog: tasks.filter(task => task.status === "backlog").length,
      inProgress: tasks.filter(task => task.status === "in_progress").length,
      blocked: tasks.filter(task => task.status === "blocked").length,
      review: tasks.filter(task => task.status === "review").length,
      done: tasks.filter(task => task.status === "done").length,
    }),
    [tasks],
  );

  function patchTask(taskId: string, patch: Partial<WorkstationTask>) {
    setTasks(previous =>
      previous.map(task =>
        task.id === taskId
          ? {
              ...task,
              ...patch,
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
    );
  }

  function addTask() {
    if (form.title.trim().length < 3) {
      toast.error("Add a task title with at least 3 characters.");
      return;
    }

    if (form.objective.trim().length < 10) {
      toast.error("Add a clear objective (at least 10 characters).");
      return;
    }

    const nowIso = new Date().toISOString();
    const task: WorkstationTask = {
      id: makeTaskId(),
      title: form.title.trim(),
      objective: form.objective.trim(),
      context: form.context.trim(),
      acceptanceCriteria: form.acceptanceCriteria.trim(),
      priority: form.priority,
      owner: form.owner,
      status: "backlog",
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    setTasks(previous => [task, ...previous]);
    setSelectedTaskId(task.id);
    setForm(getInitialFormState());
    toast.success("Task added to workstation queue.");
  }

  async function copyHandoffBrief() {
    if (!handoffBrief) return;

    if (!navigator.clipboard?.writeText) {
      toast.error("Clipboard is not available in this browser.");
      return;
    }

    try {
      await navigator.clipboard.writeText(handoffBrief);
      toast.success("Handoff brief copied.");
    } catch {
      toast.error("Could not copy handoff brief.");
    }
  }

  function runAiDraft() {
    if (!handoffBrief || handoffBrief.length < 10) {
      toast.error("Select a task first.");
      return;
    }
    analyzeMutation.mutate({ task: handoffBrief });
  }

  if (loading) {
    return (
      <PageLayout className="bg-slate-50">
        <div className="container py-16 text-sm text-slate-600">
          Loading Agent Workstation...
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="bg-slate-50">
      <div className="container py-10 space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-800">
                <ClipboardList className="h-3.5 w-3.5" />
                Central Workstation
              </div>
              <h1 className="text-3xl font-semibold text-slate-950">
                Agent & AI Task Hub
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Run one queue for human, AI, and hybrid execution. Capture tasks, assign
                ownership, track lifecycle status, and generate reusable handoff briefs.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3 lg:grid-cols-5">
              <div className="rounded-xl bg-slate-900 px-3 py-2 text-white">
                <div className="text-slate-300">Total</div>
                <div className="text-lg font-semibold">{statusCounts.total}</div>
              </div>
              <div className="rounded-xl bg-slate-100 px-3 py-2 text-slate-900">
                <div className="text-slate-500">Backlog</div>
                <div className="text-lg font-semibold">{statusCounts.backlog}</div>
              </div>
              <div className="rounded-xl bg-blue-50 px-3 py-2 text-blue-900">
                <div className="text-blue-600">In Progress</div>
                <div className="text-lg font-semibold">{statusCounts.inProgress}</div>
              </div>
              <div className="rounded-xl bg-amber-50 px-3 py-2 text-amber-900">
                <div className="text-amber-600">Blocked</div>
                <div className="text-lg font-semibold">{statusCounts.blocked}</div>
              </div>
              <div className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-900">
                <div className="text-emerald-600">Done</div>
                <div className="text-lg font-semibold">{statusCounts.done}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Create a task</CardTitle>
                <CardDescription>
                  Add work once, then route it to AI, human, or hybrid execution.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Task title
                    </label>
                    <Input
                      value={form.title}
                      onChange={event =>
                        setForm(current => ({ ...current, title: event.target.value }))
                      }
                      placeholder="Example: Build weekly operating dashboard"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Priority
                      </label>
                      <select
                        value={form.priority}
                        onChange={event =>
                          setForm(current => ({
                            ...current,
                            priority: event.target.value as TaskPriority,
                          }))
                        }
                        className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Owner
                      </label>
                      <select
                        value={form.owner}
                        onChange={event =>
                          setForm(current => ({
                            ...current,
                            owner: event.target.value as TaskOwner,
                          }))
                        }
                        className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      >
                        <option value="ai">AI Agent</option>
                        <option value="human">Human</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Objective
                  </label>
                  <Textarea
                    value={form.objective}
                    onChange={event =>
                      setForm(current => ({ ...current, objective: event.target.value }))
                    }
                    rows={4}
                    placeholder="What should be delivered and why does it matter?"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Context
                  </label>
                  <Textarea
                    value={form.context}
                    onChange={event =>
                      setForm(current => ({ ...current, context: event.target.value }))
                    }
                    rows={3}
                    placeholder="Useful links, constraints, known risks, dependencies..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Acceptance criteria
                  </label>
                  <Textarea
                    value={form.acceptanceCriteria}
                    onChange={event =>
                      setForm(current => ({
                        ...current,
                        acceptanceCriteria: event.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="How do we know this task is complete?"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button onClick={addTask}>Add to queue</Button>
                  <Button
                    variant="outline"
                    onClick={() => setForm(getInitialFormState())}
                  >
                    Reset form
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Task queue</CardTitle>
                <CardDescription>
                  Move items through backlog, execution, review, and completion.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs
                  value={taskTab}
                  onValueChange={value => setTaskTab(value as TaskTab)}
                  className="gap-4"
                >
                  <TabsList className="h-auto w-full flex-wrap justify-start gap-1 p-1">
                    <TabsTrigger value="all">All ({statusCounts.total})</TabsTrigger>
                    <TabsTrigger value="backlog">
                      Backlog ({statusCounts.backlog})
                    </TabsTrigger>
                    <TabsTrigger value="in_progress">
                      In Progress ({statusCounts.inProgress})
                    </TabsTrigger>
                    <TabsTrigger value="blocked">
                      Blocked ({statusCounts.blocked})
                    </TabsTrigger>
                    <TabsTrigger value="review">
                      Review ({statusCounts.review})
                    </TabsTrigger>
                    <TabsTrigger value="done">Done ({statusCounts.done})</TabsTrigger>
                  </TabsList>

                  <TabsContent value={taskTab}>
                    <div className="space-y-3">
                      {visibleTasks.length ? (
                        visibleTasks.map(task => (
                          <div
                            key={task.id}
                            className="rounded-2xl border border-slate-200 bg-white p-4"
                          >
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                              <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-sm font-semibold text-slate-900">
                                    {task.title}
                                  </h3>
                                  <Badge variant={STATUS_BADGE_VARIANTS[task.status]}>
                                    {STATUS_LABELS[task.status]}
                                  </Badge>
                                  <Badge variant={PRIORITY_BADGE_VARIANTS[task.priority]}>
                                    {task.priority.toUpperCase()}
                                  </Badge>
                                  <Badge variant="outline">{OWNER_LABELS[task.owner]}</Badge>
                                </div>
                                <p className="text-sm leading-6 text-slate-700">
                                  {task.objective}
                                </p>
                                {task.context ? (
                                  <p className="text-xs leading-5 text-slate-500">
                                    {task.context}
                                  </p>
                                ) : null}
                                <p className="text-xs text-slate-400">
                                  Updated {new Date(task.updatedAt).toLocaleString()}
                                </p>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    patchTask(task.id, { status: NEXT_STATUS[task.status] })
                                  }
                                >
                                  <ArrowRight className="h-3.5 w-3.5" />
                                  Next stage
                                </Button>
                                <Button
                                  size="sm"
                                  variant={task.status === "blocked" ? "secondary" : "outline"}
                                  onClick={() =>
                                    patchTask(task.id, {
                                      status:
                                        task.status === "blocked"
                                          ? "in_progress"
                                          : "blocked",
                                    })
                                  }
                                >
                                  <AlertTriangle className="h-3.5 w-3.5" />
                                  {task.status === "blocked" ? "Unblock" : "Block"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedTaskId(task.id)}
                                >
                                  <Link2 className="h-3.5 w-3.5" />
                                  Use in handoff
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    setTasks(previous =>
                                      previous.filter(item => item.id !== task.id),
                                    )
                                  }
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                          No tasks in this view yet. Add one above to start routing work.
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4" />
                  Execution lanes
                </CardTitle>
                <CardDescription>
                  Keep ownership explicit so tasks can move without confusion.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="font-semibold text-slate-900">AI Agent Lane</div>
                  <div className="mt-1 text-slate-600">
                    Best for research, drafting, analysis, and repeatable processing.
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="font-semibold text-slate-900">Human Lane</div>
                  <div className="mt-1 text-slate-600">
                    Best for approvals, judgment-heavy decisions, and relationship tasks.
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="font-semibold text-slate-900">Hybrid Lane</div>
                  <div className="mt-1 text-slate-600">
                    AI drafts and proposes; human validates and signs off.
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bot className="h-4 w-4" />
                  AI handoff studio
                </CardTitle>
                <CardDescription>
                  Turn any queued task into an execution-ready brief.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {sortedTasks.length ? (
                  <>
                    <select
                      className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      value={selectedTask?.id ?? ""}
                      onChange={event => setSelectedTaskId(event.target.value)}
                    >
                      {sortedTasks.map(task => (
                        <option key={task.id} value={task.id}>
                          {task.title}
                        </option>
                      ))}
                    </select>

                    <Textarea value={handoffBrief} readOnly rows={16} className="font-mono" />

                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" onClick={copyHandoffBrief}>
                        <Copy className="h-3.5 w-3.5" />
                        Copy brief
                      </Button>
                      <Button
                        onClick={runAiDraft}
                        disabled={analyzeMutation.isPending || handoffBrief.length < 10}
                      >
                        {analyzeMutation.isPending ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Running...
                          </>
                        ) : (
                          <>
                            <PlayCircle className="h-3.5 w-3.5" />
                            Run Ops AI draft
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                    Create at least one task to generate a handoff brief.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 className="h-4 w-4" />
                  AI output
                </CardTitle>
                <CardDescription>
                  Draft guidance generated from the current handoff brief.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analyzeMutation.data ? (
                  <div className="space-y-4">
                    <pre className="whitespace-pre-wrap rounded-xl bg-slate-950 p-4 text-sm leading-7 text-slate-100">
                      {analyzeMutation.data.reply}
                    </pre>
                    {analyzeMutation.data.contextFiles?.length ? (
                      <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                        <div className="mb-2 font-semibold text-slate-800">
                          Loaded context files
                        </div>
                        <div className="space-y-1">
                          {analyzeMutation.data.contextFiles.map(file => (
                            <div key={`${file.label}-${file.filePath}`}>
                              <span className="font-medium">{file.label}:</span>{" "}
                              <span className="break-all">{file.filePath}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                    Select a task and run <span className="font-medium">Ops AI draft</span> to
                    generate execution guidance here.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
