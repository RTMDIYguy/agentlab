import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Plus,
  Edit2,
  Trash2,
  Clock,
  CheckCircle,
  FileText,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { PageLayout } from "@/components/PageLayout";

type ApiArticle = {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  status: string;
  artifactType: string;
  metadata: Record<string, unknown>;
  scheduledFor: string | null;
  createdAt: string;
};

type ClientArticle = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  category: string;
  status: string;
  scheduledFor: string | null;
  featuredImage: string;
  views: number;
  createdAt: string;
};

function mapApiToClient(api: ApiArticle): ClientArticle {
  return {
    id: api.id,
    title: api.title,
    excerpt: api.summary ?? "",
    content: api.content,
    slug: (api.metadata?.slug as string) || titleSlug(api.title),
    category: (api.metadata?.category as string) || "General",
    status: api.status,
    scheduledFor: api.scheduledFor ?? null,
    featuredImage: (api.metadata?.featuredImage as string) || "",
    views: (api.metadata?.views as number) || 0,
    createdAt: api.createdAt,
  };
}

function titleSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
}

export default function BlogManager() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [articles, setArticles] = useState<ClientArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem("manus-runtime-token");
      const headers: Record<string, string> = {
        Accept: "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      };
      const res = await fetch("/api/artifacts?type=post&status=all&limit=50", {
        credentials: "include",
        headers,
      });
      if (!res.ok) {
        throw new Error("Failed to load articles");
      }
      const json = await res.json();
      const mapped: ClientArticle[] = (json.artifacts ?? [])
        .filter((a: any) => a.targetPlatform === "blog" || a.artifactType === "post")
        .map(mapApiToClient);
      // Merge with already-known metadata for articles we've edited
      setArticles((prev) => {
        const map = new Map(prev.map((a) => [a.id, a]));
        mapped.forEach((m) => map.set(m.id, m));
        return Array.from(map.values());
      });
    } catch (err: any) {
      toast.error(err?.message || "Failed to load articles");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) fetchArticles();
  }, [isAuthenticated, fetchArticles]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const token = localStorage.getItem("manus-runtime-token");
      const headers: Record<string, string> = {
        Accept: "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      };
      const res = await fetch(`/api/artifacts/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers,
      });
      if (!res.ok) {
        // No DELETE endpoint — mark as archived via PATCH
        const patchRes = await fetch(`/api/artifacts/${id}`, {
          method: "PATCH",
          credentials: "include",
          headers,
          body: JSON.stringify({ status: "archived" }),
        });
        if (!patchRes.ok) {
          throw new Error("Failed to delete article");
        }
      }
      setArticles((prev) => prev.filter((a) => a.id !== id));
      toast.success("Article deleted successfully");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete article");
    } finally {
      setDeletingId(null);
      setDeleteConfirm(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
            <FileText className="w-3 h-3" />
            Draft
          </span>
        );
      case "scheduled":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
            <Clock className="w-3 h-3" />
            Scheduled
          </span>
        );
      case "published":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
            <CheckCircle className="w-3 h-3" />
            Published
          </span>
        );
      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return (
      <PageLayout>
        <div className="py-8">
          <div className="container max-w-6xl">
            <Card className="p-8 border border-border text-center">
              <p className="text-foreground mb-4">
                Please log in to manage articles.
              </p>
              <Button className="bg-primary hover:bg-primary/90">Sign In</Button>
            </Card>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="py-8">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Blog Manager</h1>
          </div>
          <Button
            onClick={() => navigate("/article/new")}
            className="bg-primary hover:bg-primary/90 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Write Article
          </Button>
        </div>

        {/* Content Calendar Section */}
        <Card className="p-6 border border-border mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Content Calendar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-600 font-medium mb-1">
                Drafts
              </div>
              <div className="text-3xl font-bold text-blue-900">
                {articles.filter((a) => a.status === "draft").length}
              </div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-sm text-yellow-600 font-medium mb-1">
                Scheduled
              </div>
              <div className="text-3xl font-bold text-yellow-900">
                {articles.filter((a) => a.status === "scheduled").length}
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm text-green-600 font-medium mb-1">
                Published
              </div>
              <div className="text-3xl font-bold text-green-900">
                {articles.filter((a) => a.status === "published").length}
              </div>
            </div>
          </div>
        </Card>

        {/* Articles List */}
        <Card className="border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">
              Your Articles
            </h2>
          </div>

          {isLoading && articles.length === 0 ? (
            <div className="p-8 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : articles.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                No articles yet. Start writing!
              </p>
              <Button
                onClick={() => navigate("/article/new")}
                className="bg-primary hover:bg-primary/90"
              >
                Write Your First Article
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr
                      key={article.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">
                          {article.title}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {article.excerpt}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(article.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {article.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {article.views}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(article.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/article/${article.slug}`)}
                            className="flex items-center gap-1"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteConfirm(article.id)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Delete Confirmation Modal */}
        {deleteConfirm !== null && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-6 border border-border max-w-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Delete Article?
              </h3>
              <p className="text-muted-foreground mb-6">
                This action cannot be undone. The article will be permanently
                deleted.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deletingId !== null}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deletingId !== null}
                  className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
                >
                  {deletingId ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : null}
                  Delete
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
      </div>
    </PageLayout>
  );
}
