import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2, Save, Clock, Send, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

type ApiArtifact = {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  status: string;
  artifactType: string;
  targetPlatform: string;
  metadata: Record<string, unknown>;
  scheduledFor: string | null;
  createdAt: string;
};

type LocalArticle = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  category: string;
  status: "draft" | "scheduled" | "published";
  scheduledFor: string | null;
  featuredImage: string;
  views: number;
  createdAt: string;
};

function mapApiToLocal(api: ApiArtifact): LocalArticle {
  return {
    id: api.id,
    title: api.title,
    excerpt: api.summary ?? "",
    content: api.content,
    slug: (api.metadata?.slug as string) || slugify(api.title),
    category: (api.metadata?.category as string) || "General",
    status: api.status as "draft" | "scheduled" | "published",
    scheduledFor: api.scheduledFor ?? null,
    featuredImage: (api.metadata?.featuredImage as string) || "",
    views: (api.metadata?.views as number) ?? 0,
    createdAt: api.createdAt,
  };
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("manus-runtime-token");
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export default function ArticleEditor() {
  const { slug } = useParams<{ slug?: string }>();
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [status, setStatus] = useState<"draft" | "scheduled" | "published">("draft");
  const [scheduledFor, setScheduledFor] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Local article state (loaded from API when editing)
  const [localArticle, setLocalArticle] = useState<LocalArticle | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch article by slug when editing
  const loadArticle = useCallback(async () => {
    if (!slug || slug === "new" || !isAuthenticated) return;
    setIsLoading(true);
    try {
      const headers = authHeaders();
      const res = await fetch("/api/artifacts?type=post&limit=50", {
        credentials: "include",
        headers,
      });
      if (!res.ok) throw new Error("Failed to load article");
      const json = await res.json();
      const posts: ApiArtifact[] = json.articles ?? [];
      const found = posts.find(
        (a) =>
          (a.metadata?.slug as string) === slug &&
          (a.targetPlatform === "blog" || a.artifactType === "post")
      );
      if (found) {
        const local = mapApiToLocal(found);
        setLocalArticle(local);
        setTitle(local.title);
        setExcerpt(local.excerpt);
        setContent(local.content);
        setCategory(local.category);
        setStatus(local.status);
        setFeaturedImage(local.featuredImage);
        if (local.scheduledFor) {
          setScheduledFor(
            new Date(local.scheduledFor).toISOString().slice(0, 16)
          );
        }
      } else {
        toast.error(`Article not found: ${slug}`);
        navigate("/blog-manager");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to load article");
    } finally {
      setIsLoading(false);
    }
  }, [slug, isAuthenticated, navigate]);

  useEffect(() => {
    loadArticle();
  }, [loadArticle]);

  const handleSubmit = async (
    e: React.FormEvent,
    overridingStatus?: "draft" | "scheduled" | "published"
  ) => {
    e.preventDefault();
    const finalStatus = overridingStatus || status;

    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const headers = authHeaders();
      headers["Content-Type"] = "application/json";

      const payload = {
        title,
        content,
        summary: excerpt || undefined,
        artifactType: "post",
        targetPlatform: "blog",
        status: finalStatus,
        metadata: {
          slug: slug === "new" ? slugify(title) : (slug || slugify(title)),
          category,
          featuredImage: featuredImage || undefined,
          views: 0,
        },
        scheduledFor:
          finalStatus === "scheduled" && scheduledFor
            ? new Date(scheduledFor).toISOString()
            : undefined,
      };

      if (slug === "new") {
        const res = await fetch("/api/artifacts", {
          method: "POST",
          credentials: "include",
          headers,
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.error || "Failed to create article");
        }
        toast.success("Article created successfully!");
        navigate("/blog-manager");
      } else if (localArticle) {
        const res = await fetch(`/api/artifacts/${localArticle.id}`, {
          method: "PATCH",
          credentials: "include",
          headers,
          body: JSON.stringify({
            title,
            content,
            summary: excerpt || undefined,
            status: finalStatus,
            metadata: {
              ...(localArticle.metadata || {}),
              slug: slug || slugify(title),
              category,
              featuredImage: featuredImage || undefined,
            },
            scheduledFor:
              finalStatus === "scheduled" && scheduledFor
                ? new Date(scheduledFor).toISOString()
                : undefined,
          }),
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.error || "Failed to update article");
        }
        toast.success("Article updated successfully!");
        navigate("/blog-manager");
      }
    } catch (error: any) {
      console.error("Error submitting article:", error);
      toast.error(error?.message || "Failed to save article");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setStatus("draft");
    await handleSubmit({ preventDefault: () => {} } as React.FormEvent, "draft");
  };

  const handleSchedule = async () => {
    if (!scheduledFor) {
      toast.error("Please select a date and time to schedule");
      return;
    }
    setStatus("scheduled");
    await handleSubmit({ preventDefault: () => {} } as React.FormEvent, "scheduled");
  };

  const handlePublish = async () => {
    setStatus("published");
    await handleSubmit({ preventDefault: () => {} } as React.FormEvent, "published");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container max-w-4xl">
          <Card className="p-8 border border-border text-center">
            <p className="text-foreground mb-4">
              Please log in to write articles.
            </p>
            <Button className="bg-primary hover:bg-primary/90">Sign In</Button>
          </Card>
        </div>
      </div>
    );
  }

  if (slug && slug !== "new" && isLoading) {
    return (
      <div className="min-h-screen bg-background py-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/blog-manager")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground">
            {slug === "new" ? "Write New Article" : "Edit Article"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 border border-border">
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter article title"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Excerpt
                </label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief summary of your article (optional)"
                  rows={2}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Content (Markdown)
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your article content here (supports Markdown)"
                  rows={12}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option>General</option>
                  <option>AI Technology</option>
                  <option>Business</option>
                  <option>Tutorial</option>
                  <option>News</option>
                </select>
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Featured Image URL
                </label>
                <input
                  type="url"
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Scheduled Date */}
              {status === "scheduled" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Schedule For
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Draft
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (status === "scheduled" && scheduledFor) {
                  handleSchedule();
                } else {
                  setStatus("scheduled");
                }
              }}
              className="flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              {status === "scheduled" && scheduledFor
                ? "Confirm Schedule"
                : "Schedule"}
            </Button>

            <Button
              type="button"
              onClick={handlePublish}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 flex items-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Publish Now
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
