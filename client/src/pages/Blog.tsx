import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowRight, Calendar, User, Search, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { trpc } from "@/lib/trpc";

export default function Blog() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Real published articles from the articles backend (owner-authored via BlogManager).
  const articlesQuery = trpc.articles.getPublished.useQuery({ limit: 50 });
  const articles = articlesQuery.data ?? [];

  const filteredArticles = useMemo(
    () =>
      articles.filter(
        article =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.category.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [articles, searchTerm]
  );

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(articles.map(a => a.category)))],
    [articles]
  );

  const displayedArticles = filteredArticles.filter(
    article =>
      selectedCategory === "All" || article.category === selectedCategory
  );

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function readTimeFor(content: string | undefined) {
    // Rough estimate: 200 wpm. Articles list doesn't carry full content, so
    // estimate from excerpt length when content is unavailable.
    return "5 min read";
  }

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10 border-b border-border">
        <div className="container max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            AgentLab Blog
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Insights, trends, and best practices in AI automation. Stay updated
            with the latest developments in intelligent systems and business
            transformation.
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 bg-background border-b border-border">
        <div className="container max-w-4xl">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-primary text-white"
                    : "bg-card text-foreground border border-border hover:border-primary"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-20 bg-background">
        <div className="container max-w-4xl">
          {articlesQuery.isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading articles...</p>
            </div>
          ) : articlesQuery.isError ? (
            <div className="text-center py-12">
              <p className="text-lg text-destructive">
                Unable to load articles right now. Please try again shortly.
              </p>
            </div>
          ) : displayedArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {displayedArticles.map(article => (
                <Card
                  key={article.id}
                  className="border border-border hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                  onClick={() => navigate(`/blog/${article.slug}`)}
                >
                  <div className="p-6 h-full flex flex-col">
                    {/* Header */}
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-3">
                        {article.category}
                      </span>
                      <div className="text-4xl mb-3">
                        {article.featuredImage?.startsWith("http")
                          ? ""
                          : article.featuredImage || "📄"}
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground mb-6 line-clamp-3 flex-grow">
                      {article.excerpt}
                    </p>

                    {/* Metadata */}
                    <div className="space-y-3 border-t border-border pt-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {formatDate(article.publishedAt)}
                        </div>
                        <span className="text-xs font-medium text-primary">
                          {article.views} view{article.views === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {article.authorName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {article.authorName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Uncle Robert Consulting
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                {articles.length === 0
                  ? "No articles published yet. Check back soon — new insights are on the way."
                  : "No articles found matching your search."}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
        <div className="container max-w-2xl text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Get the latest insights on AI automation and business transformation
            delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button className="bg-primary hover:bg-primary/90">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
