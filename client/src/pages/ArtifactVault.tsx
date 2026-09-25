import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import {
  FileText,
  Download,
  Trash2,
  Save,
  X,
  FileEdit,
  Database,
  Search,
  CalendarDays,
  Workflow,
} from "lucide-react";

type VaultArtifact = {
  id: string;
  title: string;
  artifactType: string;
  status: string;
  summary: string | null;
  content?: string;
  targetPlatform: string | null;
  qualityScore: number | null;
  qualityGrade: string | null;
  createdAt: string;
  updatedAt: string;
  workflowName?: string | null;
};

const TYPE_BADGE: Record<string, string> = {
  document: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  post: "bg-teal-500/10 text-teal-600 border-teal-500/30",
  sop: "bg-violet-500/10 text-violet-600 border-violet-500/30",
  report: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  csv: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  crm_diff: "bg-rose-500/10 text-rose-600 border-rose-500/30",
  calendar_entry: "bg-cyan-500/10 text-cyan-600 border-cyan-500/30",
  file: "bg-zinc-500/10 text-zinc-600 border-zinc-500/30",
};

export default function ArtifactVault() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [viewContent, setViewContent] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Vault list (no heavy content field — the list stays fast).
  const { data, isLoading } = useQuery<{ artifacts: VaultArtifact[] }>({
    queryKey: ["artifact-vault", typeFilter],
    queryFn: async () => {
      const url =
        typeFilter === "all" ? "/api/artifacts?limit=200" : `/api/artifacts?limit=200&type=${typeFilter}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch artifacts");
      return res.json();
    },
  });

  // Full single read when opening a document (view or edit).
  const fetchFull = async (id: string): Promise<VaultArtifact | null> => {
    const res = await fetch(`/api/artifacts/${id}`);
    if (!res.ok) return null;
    const j = await res.json();
    return j.artifact ?? null;
  };

  const openView = async (id: string) => {
    const a = await fetchFull(id);
    if (!a) {
      toast.error("Could not load document.");
      return;
    }
    setViewContent(a.content ?? "");
    setViewingId(id);
  };

  const openEdit = async (a: VaultArtifact) => {
    const full = await fetchFull(a.id);
    if (!full) {
      toast.error("Could not load document for editing.");
      return;
    }
    setEditTitle(full.title);
    setEditContent(full.content ?? "");
    setEditingId(a.id);
    setViewingId(null);
  };

  const saveMutation = useMutation({
    mutationFn: async ({ id, title, content }: { id: string; title: string; content: string }) => {
      const res = await fetch(`/api/artifacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Failed to save document");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Document saved.");
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ["artifact-vault"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const replaceMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const res = await fetch(`/api/artifacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          metadata: { replacedManuallyAt: new Date().toISOString() },
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Failed to replace document");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Document content replaced.");
      queryClient.invalidateQueries({ queryKey: ["artifact-vault"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/artifacts/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Failed to delete document");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Document deleted.");
      setConfirmDeleteId(null);
      setViewingId(null);
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ["artifact-vault"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const artifacts = (data?.artifacts || []) as VaultArtifact[];
  const filtered = artifacts.filter(
    a =>
      !search ||
      a.title?.toLowerCase().includes(search.toLowerCase()) ||
      a.summary?.toLowerCase().includes(search.toLowerCase())
  );
  const types = Array.from(new Set(artifacts.map(a => a.artifactType)));

  if (!user) {
    return (
      <DashboardLayout>
        <div className="p-8 text-sm text-muted-foreground">Sign in to access your Artifact Vault.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card/60 backdrop-blur px-6 py-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">Artifact Vault</h1>
            <Badge variant="secondary" className="text-[10px] font-mono">
              {filtered.length} document{filtered.length === 1 ? "" : "s"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Every document your workflows and agents produce — revisit, edit, replace, download, or delete it here.
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search titles and summaries..."
                className="pl-9 text-sm"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setTypeFilter("all")}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                  typeFilter === "all" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                }`}
              >
                All
              </button>
              {types.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTypeFilter(t)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                    typeFilter === t ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Document list */}
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading vault...</div>
          ) : filtered.length === 0 ? (
            <Card className="p-10 text-center border-dashed">
              <Database className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground">Vault is empty</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                Documents appear here automatically when workflows and agents produce deliverables. Run a workflow from
                the Command Center to populate your vault.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filtered.map(a => {
                const isEditing = editingId === a.id;
                const isViewing = viewingId === a.id;
                return (
                  <Card key={a.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className={`p-2 rounded-lg border shrink-0 ${TYPE_BADGE[a.artifactType] || "bg-muted text-muted-foreground border-border"}`}>
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <CardTitle className="text-sm font-semibold truncate">{a.title}</CardTitle>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge variant="outline" className="text-[9px] font-mono uppercase">
                                {a.artifactType}
                              </Badge>
                              <Badge variant="secondary" className="text-[9px] font-mono">
                                {a.status}
                              </Badge>
                              {a.qualityGrade && (
                                <Badge variant="outline" className="text-[9px] font-mono">
                                  {a.qualityGrade}
                                  {a.qualityScore != null ? ` · ${a.qualityScore}` : ""}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      {a.workflowName && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono mt-1">
                          <Workflow className="w-3 h-3" />
                          via {a.workflowName}
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {a.summary && !isEditing && !isViewing && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{a.summary}</p>
                      )}

                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                        <CalendarDays className="w-3 h-3" />
                        updated {new Date(a.updatedAt || a.createdAt).toLocaleDateString()}
                      </div>

                      {/* View pane */}
                      {isViewing && (
                        <pre className="max-h-64 overflow-auto p-3 rounded-lg bg-muted/40 border border-border text-[11px] whitespace-pre-wrap font-mono">
                          {viewContent}
                        </pre>
                      )}

                      {/* Edit pane */}
                      {isEditing && (
                        <div className="space-y-2">
                          <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="text-xs" placeholder="Document title" />
                          <textarea
                            value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                            className="w-full h-48 p-3 rounded-lg bg-input border border-border text-xs font-mono resize-y"
                            placeholder="Document content"
                          />
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              className="h-7 text-xs gap-1.5"
                              disabled={saveMutation.isPending}
                              onClick={() => saveMutation.mutate({ id: a.id, title: editTitle, content: editContent })}
                            >
                              <Save className="w-3.5 h-3.5" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              disabled={replaceMutation.isPending}
                              onClick={() => replaceMutation.mutate({ id: a.id, content: editContent })}
                              title="Replace content wholesale (marks the artifact as manually replaced)"
                            >
                              Replace Content
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => setEditingId(null)}>
                              <X className="w-3.5 h-3.5" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      {!isEditing && (
                        <div className="flex items-center gap-1.5 pt-1 border-t border-border/60">
                          <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => (isViewing ? setViewingId(null) : openView(a.id))}>
                            <FileText className="w-3.5 h-3.5" />
                            {isViewing ? "Close" : "View"}
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => openEdit(a)}>
                            <FileEdit className="w-3.5 h-3.5" />
                            Edit
                          </Button>
                          <a href={`/api/artifacts/${a.id}/download`} className="flex-contents">
                            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1">
                              <Download className="w-3.5 h-3.5" />
                              Download
                            </Button>
                          </a>
                          <Button
                            size="sm"
                            variant="ghost"
                            className={`h-7 text-xs gap-1 ml-auto ${
                              confirmDeleteId === a.id ? "text-red-600 font-bold" : "text-muted-foreground hover:text-red-500"
                            }`}
                            onClick={() => {
                              if (confirmDeleteId === a.id) {
                                deleteMutation.mutate(a.id);
                              } else {
                                setConfirmDeleteId(a.id);
                                setTimeout(() => setConfirmDeleteId(cur => (cur === a.id ? null : cur)), 4000);
                              }
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            {confirmDeleteId === a.id ? "Confirm?" : ""}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
