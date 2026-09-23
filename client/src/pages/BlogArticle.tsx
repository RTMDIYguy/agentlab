import { Button } from "@/components/ui/button";
import { useLocation, useRoute } from "wouter";
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Share2,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import BlogCommentSection from "@/components/BlogCommentSection";
import { trpc } from "@/lib/trpc";

export default function BlogArticle() {
  const [match, params] = useRoute("/blog/:id");
  const [, navigate] = useLocation();
  const slug = params?.id ?? "";
  const [copied, setCopied] = useState(false);

  // Real published article from the backend, by slug.
  const articleQuery = trpc.articles.getPublishedBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );
  const relatedQuery = trpc.articles.getRelated.useQuery(
    { slug, limit: 3 },
    { enabled: !!slug && articleQuery.isSuccess }
  );

  // Count a view once per mount.
  const incrementViews = trpc.articles.incrementViews.useMutation();
  useEffect(() => {
    if (slug && articleQuery.isSuccess) {
      incrementViews.mutate({ slug });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, articleQuery.isSuccess]);

  const isLoading = articleQuery.isLoading;
  const isError = articleQuery.isError;
  const article = articleQuery.data;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — non-fatal
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading article...</p>
        </div>
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Article not found
          </h1>
          <p className="text-muted-foreground mb-8">
            This article may have been unpublished or the link is incorrect.
          </p>
          <Button
            onClick={() => navigate("/blog")}
            className="bg-primary hover:bg-primary/90"
          >
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  // Rough read-time estimate from content length (~200 wpm).
  const wordCount = article.content.trim().split(/\s+/).length;
  const readTime = `${Math.max(1, Math.round(wordCount / 200))} min read`;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between py-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AL</span>
            </div>
            <span className="font-bold text-lg text-foreground">AgentLab</span>
          </button>
          <Button
            variant="outline"
            onClick={() => navigate("/blog")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Button>
        </div>
      </nav>

      {/* Article Header */}
      <section className="py-12 bg-gradient-to-br from-primary/10 to-accent/10 border-b border-border">
        <div className="container max-w-3xl">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
              {article.category}
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            {article.title}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {article.excerpt}
          </p>

          {/* Article Metadata */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold">
                {article.authorName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {article.authorName}
                </p>
                <p className="text-xs">Uncle Robert Consulting</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(article.publishedAt)}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {readTime}
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors ml-auto"
            >
              <Share2 className="w-4 h-4" />
              {copied ? "Link copied!" : "Share"}
            </button>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-20 bg-background">
        <div className="container max-w-3xl">
          <div className="prose prose-lg max-w-none">
            <article className="text-foreground space-y-6">
              {article.content
                .split("\n\n")
                .map((paragraph: string, index: number) => {
                  if (paragraph.startsWith("#")) {
                    const level = paragraph.match(/^#+/)?.[0].length || 1;
                    const text = paragraph.replace(/^#+\s/, "");
                    const headingClass =
                      {
                        1: "text-4xl font-bold mt-12 mb-6",
                        2: "text-2xl font-bold mt-8 mb-4",
                        3: "text-xl font-bold mt-6 mb-3",
                      }[level] || "text-lg font-bold mt-4 mb-2";
                    return (
                      <h2
                        key={index}
                        className={`text-foreground ${headingClass}`}
                      >
                        {text}
                      </h2>
                    );
                  }
                  if (paragraph.startsWith("- ")) {
                    const items = paragraph
                      .split("\n")
                      .filter(item => item.startsWith("- "));
                    return (
                      <ul
                        key={index}
                        className="list-disc list-inside space-y-2 text-muted-foreground"
                      >
                        {items.map((item, i) => (
                          <li key={i} className="ml-4">
                            {item.replace(/^- /, "")}
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <p
                      key={index}
                      className="text-muted-foreground leading-relaxed"
                    >
                      {paragraph}
                    </p>
                  );
                })}
            </article>
          </div>

          {/* Author Bio */}
          <div className="mt-16 p-8 bg-card rounded-lg border border-border">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {article.authorName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {article.authorName}
                </h3>
                <p className="text-sm text-primary font-semibold mb-3">
                  Uncle Robert Consulting
                </p>
                <p className="text-muted-foreground">
                  Practical operator writing about agentic business systems,
                  servant leadership, and building ownable operating platforms.
                </p>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <BlogCommentSection articleId={article.id} />

          {/* Related Articles */}
          {relatedQuery.data && relatedQuery.data.length > 0 && (
            <div className="mt-16 pt-16 border-t border-border">
              <h2 className="text-2xl font-bold text-foreground mb-8">
                Related Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedQuery.data.map(related => (
                  <div
                    key={related.id}
                    onClick={() => navigate(`/blog/${related.slug}`)}
                    className="p-6 bg-card rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-all"
                  >
                    <p className="text-sm text-primary font-semibold mb-2">
                      {related.category}
                    </p>
                    <h3 className="font-bold text-foreground mb-3 line-clamp-2">
                      {related.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {related.excerpt}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} AgentLab. All rights reserved.
            </p>
            <Button
              onClick={() => navigate("/blog")}
              variant="outline"
              className="mt-4 md:mt-0"
            >
              Back to All Articles
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
