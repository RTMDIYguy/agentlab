import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2, Save, Clock, Send, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function ArticleEditor() {
  const { slug } = useParams<{ slug?: string }>();
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [status, setStatus] = useState<"draft" | "scheduled" | "published">("draft");
  const [scheduledFor, setScheduledFor] = useState<string>("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch article if editing
  const { data: article, isLoading } = trpc.articles.getBySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug && slug !== "new" }
  );

  // Mutations
  const createMutation = trpc.articles.create.useMutation({
    onSuccess: () => {
      toast.success("Article created successfully!");
      navigate("/blog-manager");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create article");
      setIsSubmitting(false);
    },
  });

  const updateMutation = trpc.articles.update.useMutation({
    onSuccess: () => {
      toast.success("Article updated successfully!");
      navigate("/blog-manager");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update article");
      setIsSubmitting(false);
    },
  });

  // Load article data when fetched
  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setExcerpt(article.excerpt || "");
      setContent(article.content);
      setCategory(article.category);
      setStatus(article.status as "draft" | "scheduled" | "published");
      setFeaturedImage(article.featuredImage || "");
      if (article.scheduledFor) {
        setScheduledFor(new Date(article.scheduledFor).toISOString().slice(0, 16));
      }
    }
  }, [article]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setIsSubmitting(true);

    try {
      const articleSlug = slug === "new" ? title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "") : (slug || "");

      if (slug === "new") {
        // Create new article
        await createMutation.mutateAsync({
          title,
          excerpt,
          content,
          slug: articleSlug,
          category,
          status,
          scheduledFor: status === "scheduled" && scheduledFor ? new Date(scheduledFor) : undefined,
          featuredImage: featuredImage || undefined,
        });
      } else {
        // Update existing article
        await updateMutation.mutateAsync({
          articleId: article?.id || 0,
          title,
          excerpt,
          content,
          category,
          status,
          scheduledFor: status === "scheduled" && scheduledFor ? new Date(scheduledFor) : undefined,
          featuredImage: featuredImage || undefined,
        });
      }
    } catch (error) {
      console.error("Error submitting article:", error);
    }
  };

  const handleSaveDraft = async () => {
    setStatus("draft");
    await handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  const handleSchedule = async () => {
    if (!scheduledFor) {
      toast.error("Please select a date and time to schedule");
      return;
    }
    setStatus("scheduled");
    await handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  const handlePublish = async () => {
    setStatus("published");
    await handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container max-w-4xl">
          <Card className="p-8 border border-border text-center">
            <p className="text-foreground mb-4">Please log in to write articles.</p>
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
                <label className="block text-sm font-medium text-foreground mb-2">Title</label>
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
                <label className="block text-sm font-medium text-foreground mb-2">Excerpt</label>
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
                <label className="block text-sm font-medium text-foreground mb-2">Content (Markdown)</label>
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
                <label className="block text-sm font-medium text-foreground mb-2">Category</label>
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
                <label className="block text-sm font-medium text-foreground mb-2">Featured Image URL</label>
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
                  <label className="block text-sm font-medium text-foreground mb-2">Schedule For</label>
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
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Draft
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setStatus("scheduled");
              }}
              className="flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Schedule
            </Button>

            <Button
              type="button"
              onClick={handlePublish}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Publish Now
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
