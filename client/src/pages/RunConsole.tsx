import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useLocation } from "wouter";

/**
 * Operator console for client-facing run sharing (Tier 1 item 3).
 *
 * A share link gives a client a read-only view of real run state — status,
 * per-step costs, artifacts — without an OS account. The raw token is shown
 * exactly once at creation (the server stores only a hash); after that the
 * operator can copy it from this page's session only, or revoke it.
 */

type ShareToken = {
  id: string;
  label: string | null;
  scope: string;
  runId: string | null;
  createdAt: string;
  lastAccessedAt: string | null;
  revokedAt: string | null;
};

async function authedFetch(path: string, init?: RequestInit) {
  const token = localStorage.getItem("manus-runtime-token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(path, { ...init, headers, credentials: "include" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).error || `Request failed (${res.status})`);
  }
  return res.json();
}

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-800",
  running: "bg-blue-100 text-blue-800",
  pending: "bg-slate-100 text-slate-700",
  paused_for_approval: "bg-amber-100 text-amber-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-zinc-200 text-zinc-700",
};

export function statusBadgeClass(status: string): string {
  return STATUS_STYLES[status] || "bg-slate-100 text-slate-700";
}

export default function RunConsole() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth({
    redirectOnUnauthenticated: true,
    redirectPath: "/login",
  });
  const queryClient = useQueryClient();
  const [newLabel, setNewLabel] = useState("");
  const [scope, setScope] = useState<"all" | "single">("all");
  const [singleRunId, setSingleRunId] = useState("");
  const [freshToken, setFreshToken] = useState<{ token: string; label: string | null } | null>(null);
  const [copied, setCopied] = useState(false);

  const tokens = useQuery<{ tokens: ShareToken[] }>({
    queryKey: ["share-tokens"],
    queryFn: () => authedFetch("/api/share/tokens"),
    enabled: !!user,
  });

  const runs = useQuery<{ runs: any[] }>({
    queryKey: ["console-runs"],
    queryFn: () => authedFetch("/api/runs"),
    enabled: !!user,
  });

  const createToken = useMutation({
    mutationFn: () =>
      authedFetch("/api/share/tokens", {
        method: "POST",
        body: JSON.stringify({
          label: newLabel || null,
          scope,
          runId: scope === "single" ? singleRunId : undefined,
        }),
      }),
    onSuccess: (data: any) => {
      setFreshToken({ token: data.token, label: data.label });
      setNewLabel("");
      setSingleRunId("");
      queryClient.invalidateQueries({ queryKey: ["share-tokens"] });
    },
  });

  const revokeToken = useMutation({
    mutationFn: (tokenId: string) =>
      authedFetch(`/api/share/tokens/${tokenId}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["share-tokens"] }),
  });

  if (isLoading) return null;
  if (!user) return null;

  const activeTokens = (tokens.data?.tokens || []).filter((t) => !t.revokedAt);
  const revokedTokens = (tokens.data?.tokens || []).filter((t) => t.revokedAt);

  const copyToken = async () => {
    if (!freshToken) return;
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/shared/runs?token=${encodeURIComponent(freshToken.token)}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the token remains visible to copy manually */
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Run Console</h1>
            <p className="text-sm text-slate-500">
              Share read-only, live run reports with clients — every number is the real database value.
            </p>
          </div>
          <Button variant="outline" onClick={() => setLocation("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>

        {freshToken && (
          <Card className="border-emerald-300 bg-emerald-50">
            <CardHeader>
              <CardTitle className="text-emerald-900">
                Share link created{freshToken.label ? ` — ${freshToken.label}` : ""}
              </CardTitle>
              <CardDescription className="text-emerald-800">
                Copy it now — this link's secret is shown only once and cannot be recovered.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <code className="block overflow-x-auto rounded bg-white p-3 text-xs text-slate-800">
                {window.location.origin}/shared/runs?token={freshToken.token}
              </code>
              <div className="flex gap-2">
                <Button size="sm" onClick={copyToken}>
                  {copied ? "Copied!" : "Copy link"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setFreshToken(null)}>
                  Done
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Create a share link</CardTitle>
            <CardDescription>
              Clients see real run status, per-step cost and latency, and the artifacts — read-only. Nothing here can trigger or approve runs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Input
                placeholder="Label (e.g. “Acme Co — weekly report”)"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="max-w-xs"
              />
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as "all" | "single")}
                className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm"
              >
                <option value="all">All runs</option>
                <option value="single">Single run</option>
              </select>
              {scope === "single" && (
                <select
                  value={singleRunId}
                  onChange={(e) => setSingleRunId(e.target.value)}
                  className="h-9 max-w-xs rounded-md border border-slate-300 bg-white px-2 text-sm"
                >
                  <option value="">Select a run…</option>
                  {(runs.data?.runs || []).map((r) => (
                    <option key={r.id} value={r.id}>
                      {(r.workflowName || r.workflowId || "Run").slice(0, 40)} — {r.status} — {new Date(r.createdAt).toLocaleString()}
                    </option>
                  ))}
                </select>
              )}
              <Button
                onClick={() => createToken.mutate()}
                disabled={createToken.isPending || (scope === "single" && !singleRunId)}
              >
                {createToken.isPending ? "Creating…" : "Create link"}
              </Button>
            </div>
            {createToken.isError && (
              <p className="text-sm text-red-600">{(createToken.error as Error).message}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active links</CardTitle>
            <CardDescription>
              Revoking a link stops all access immediately; the audit record of its creation and use remains.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {tokens.isLoading && <p className="text-sm text-slate-500">Loading…</p>}
            {!tokens.isLoading && activeTokens.length === 0 && (
              <p className="text-sm text-slate-500">No active share links yet.</p>
            )}
            {activeTokens.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {t.label || "Untitled link"}{" "}
                    <Badge variant="outline" className="ml-1">
                      {t.scope === "single" ? "single run" : "all runs"}
                    </Badge>
                  </p>
                  <p className="text-xs text-slate-500">
                    Created {new Date(t.createdAt).toLocaleString()}
                    {t.lastAccessedAt
                      ? ` · last opened ${new Date(t.lastAccessedAt).toLocaleString()}`
                      : " · never opened"}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => revokeToken.mutate(t.id)}
                  disabled={revokeToken.isPending}
                >
                  Revoke
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {revokedTokens.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-500">Revoked links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {revokedTokens.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-3 opacity-60"
                >
                  <p className="text-sm text-slate-600">
                    {t.label || "Untitled link"} — revoked {new Date(t.revokedAt as string).toLocaleString()}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
