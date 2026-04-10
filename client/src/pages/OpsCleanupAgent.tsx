import { useMemo, useState } from "react";
import { Bot, FolderTree, Sparkles } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const starterTasks = [
  "Review the current operating docs and tell me the top 3 cleanup actions I should take this week.",
  "Help me triage recovered files into keep, archive, and review based on the current business architecture.",
  "Identify the likely source-of-truth docs for URC, Bootstrapper Capital, Tactix, and Ownable OS planning.",
];

export default function OpsCleanupAgent() {
  const { loading } = useAuth({ redirectOnUnauthenticated: true });
  const [task, setTask] = useState(starterTasks[0]);
  const analyzeMutation = trpc.opsCleanup.analyze.useMutation();

  const recoverySummary = useMemo(() => {
    if (!analyzeMutation.data) return [];
    return analyzeMutation.data.inventory.recoveryInventories.map(item => ({
      path: item.path,
      count: item.entries.length,
    }));
  }, [analyzeMutation.data]);

  if (loading) {
    return (
      <PageLayout className="bg-stone-50">
        <div className="container py-16 text-sm text-stone-600">Loading Ops Cleanup Agent...</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="bg-stone-50">
      <div className="container py-10">
        <div className="mb-8 max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-emerald-800">
            <Bot className="h-3.5 w-3.5" />
            Internal Agent
          </div>
          <h1 className="font-serif text-4xl text-stone-950">Ops Cleanup Agent</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-700">
            This internal agent reads your operating docs, samples the recovered folders, and
            helps you clean up the business system without rebuilding everything from scratch.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-stone-900">
              <Sparkles className="h-4 w-4" />
              Ask the agent
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {starterTasks.map(starter => (
                <button
                  key={starter}
                  type="button"
                  onClick={() => setTask(starter)}
                  className="rounded-full border border-stone-300 px-3 py-1.5 text-xs text-stone-700 transition hover:border-stone-950 hover:text-stone-950"
                >
                  {starter}
                </button>
              ))}
            </div>

            <textarea
              value={task}
              onChange={event => setTask(event.target.value)}
              rows={8}
              className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm leading-7 outline-none transition focus:border-stone-950"
              placeholder="Describe the cleanup or operating-system task you want help with..."
            />

            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => analyzeMutation.mutate({ task })}
                disabled={analyzeMutation.isPending || task.trim().length < 10}
                className="rounded-xl bg-stone-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
              >
                {analyzeMutation.isPending ? "Analyzing..." : "Run analysis"}
              </button>
              <div className="text-xs text-stone-500">
                {analyzeMutation.data?.mode === "openai"
                  ? "Using OpenAI-powered analysis"
                  : "Using fallback analysis if no API key is configured"}
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-stone-950 p-5 text-sm leading-7 text-stone-100">
              <div className="mb-3 text-xs uppercase tracking-[0.2em] text-stone-400">
                Agent Output
              </div>
              {analyzeMutation.data ? (
                <pre className="whitespace-pre-wrap font-sans">{analyzeMutation.data.reply}</pre>
              ) : (
                <p className="text-stone-300">
                  Run a task and the agent will return a cleanup plan, keep/archive/review guidance,
                  and the next actions to take.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-900">
                <FolderTree className="h-4 w-4" />
                Context Files
              </div>
              <div className="space-y-2 text-sm text-stone-700">
                {analyzeMutation.data?.contextFiles?.length ? (
                  analyzeMutation.data.contextFiles.map(file => (
                    <div key={file.filePath} className="rounded-xl bg-stone-50 px-3 py-2">
                      <div className="font-medium text-stone-900">{file.label}</div>
                      <div className="break-all text-xs text-stone-500">{file.filePath}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-stone-500">
                    The agent will load repo docs and the business cleanup docs when you run an analysis.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="mb-3 text-sm font-semibold text-stone-900">Recovery Snapshot</div>
              <div className="space-y-2 text-sm text-stone-700">
                {recoverySummary.length ? (
                  recoverySummary.map(item => (
                    <div key={item.path} className="rounded-xl bg-stone-50 px-3 py-2">
                      <div className="font-medium text-stone-900">{item.path}</div>
                      <div className="text-xs text-stone-500">
                        Sampled {item.count} top-level entries
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-stone-500">
                    Run the agent to sample the recovered folders and the active business workspace.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
