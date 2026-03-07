import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Plus, Edit2, Trash2, Clock, CheckCircle, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function BlogManager() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Fetch user's articles
  const { data: articles = [], refetch, isLoading } = trpc.articles.getMyArticles.useQuery(
    { limit: 50 },
    { enabled: isAuthenticated }
  );

  // Delete mutation
  const deleteMutation = trpc.articles.delete.useMutation({
    onSuccess: () => {
      toast.success("Article deleted successfully");
      setDeleteConfirm(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete article");
    },
  });

  const handleDelete = (articleId: number) => {
    deleteMutation.mutate({ articleId });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
            <FileText className="w-3 h-3" />
            Draft
          </span>
        );
      case "scheduled":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
            <Clock className="w-3 h-3" />
            Scheduled
          </span>
        );
      case "published":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
            <CheckCircle className="w-3 h-3" />
            Published
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container max-w-4xl">
          <Card className="p-8 border border-border text-center">
            <p className="text-foreground mb-4">Please log in to manage your blog articles.</p>
            <Button className="bg-primary hover:bg-primary/90">Sign In</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">Blog Manager</h1>
          <Button
            onClick={() => navigate("/article/new")}
            className="bg-primary hover:bg-primary/90 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Article
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : articles.length === 0 ? (
          <Card className="p-12 border border-border text-center">
            <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No articles yet. Create your first article!</p>
            <Button
              onClick={() => navigate("/article/new")}
              className="bg-primary hover:bg-primary/90"
            >
              Create Article
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <Card key={article.id} className="p-6 border border-border hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground truncate">{article.title}</h3>
                      {getStatusBadge(article.status)}
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {article.excerpt || "No excerpt"}
                    </p>

                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span>Category: {article.category}</span>
                      <span>Created: {formatDate(article.createdAt)}</span>
                      {article.publishedAt && <span>Published: {formatDate(article.publishedAt)}</span>}
                      {article.scheduledFor && (
                        <span>Scheduled: {formatDate(article.scheduledFor)}</span>
                      )}
                      <span>{article.views || 0} views</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/article/${article.slug}`)}
                      className="flex items-center gap-1"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>

                    {deleteConfirm === article.id ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteConfirm(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handleDelete(article.id)}
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Confirm Delete"
                          )}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteConfirm(article.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
