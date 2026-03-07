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
    { enabled: !!slug }
  );

  // Mutations
  const createMutation = trpc.articles.create.useMutation({
    onSuccess: () => {
      toast.success("Article created successfully!");
      navigate("/blog-manager");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create article");
    },
  });

  const updateMutation = trpc.articles.update.useMutation({
    onSuccess: () => {
      toast.success("Article updated successfully!");
      navigate("/blog-manager");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update article");
    },
  });

  // Load article data when editing
  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setExcerpt(article.excerpt || "");
      setContent(article.content);
      setCategory(article.category);
      setStatus(article.status as any);
      if (article.scheduledFor) {
        setScheduledFor(new Date(article.scheduledFor).toISOString().slice(0, 16));
      }
      setFeaturedImage(article.featuredImage || "");
    }
  }, [article]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please log in to create articles");
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    if (status === "scheduled" && !scheduledFor) {
      toast.error("Please select a date and time for scheduled posts");
      return;
    }

    setIsSubmitting(true);

    try {
      const slugFromTitle = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const scheduledDate = scheduledFor ? new Date(scheduledFor) : undefined;

      if (slug) {
        // Update
        await updateMutation.mutateAsync({
          articleId: article?.id || 0,
          title,
          excerpt,
          content,
          category,
          status,
          scheduledFor: scheduledDate,
          featuredImage: featuredImage || undefined,
        });
      } else {
        // Create
        await createMutation.mutateAsync({
          title,
          excerpt,
          content,
          slug: slugFromTitle,
          category,
          status,
          scheduledFor: scheduledDate,
          featuredImage: featuredImage || undefined,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl">
        <button
          onClick={() => navigate("/blog-manager")}
          className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog Manager
        </button>

        <Card className="p-8 border border-border">
          <h1 className="text-3xl font-bold text-foreground mb-6">
            {slug ? "Edit Article" : "Create New Article"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Article Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter article title..."
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isSubmitting}
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
                placeholder="Brief summary of your article..."
                rows={2}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground mt-1">{excerpt.length}/500 characters</p>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Content * (Markdown supported)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your article content here... Markdown is supported."
                rows={12}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm resize-none"
                disabled={isSubmitting}
              />
            </div>

            {/* Category and Featured Image */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isSubmitting}
                >
                  <option>General</option>
                  <option>Technology</option>
                  <option>Business</option>
                  <option>Case Study</option>
                  <option>Tutorial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Featured Image URL
                </label>
                <input
                  type="url"
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Status and Scheduling */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isSubmitting}
                >
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Publish Now</option>
                </select>
              </div>

              {status === "scheduled" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Publish Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={isSubmitting}
                  />
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/blog-manager")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 flex items-center gap-2 ml-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : status === "scheduled" ? (
                  <>
                    <Clock className="w-4 h-4" />
                    Schedule Post
                  </>
                ) : status === "published" ? (
                  <>
                    <Send className="w-4 h-4" />
                    Publish Now
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Draft
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
