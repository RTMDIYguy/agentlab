import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowRight, Calendar, User, Search } from "lucide-react";
import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";

export default function Blog() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const articles = [
    {
      id: "future-of-ai-agents",
      category: "Technology",
      title: "The Future of Autonomous AI Systems",
      excerpt: "Explore how AI agents are revolutionizing business automation and decision-making processes. Discover the emerging trends and technologies shaping the next generation of intelligent systems.",
      author: "Alex Johnson",
      role: "AI Research Lead",
      date: "Mar 15, 2025",
      readTime: "8 min read",
      image: "🤖",
    },
    {
      id: "reducing-costs-ai",
      category: "Business",
      title: "Reducing Operational Costs with AI Automation",
      excerpt: "Learn how enterprises are cutting costs by 40% through intelligent automation with AgentLab. Real-world case studies and implementation strategies for maximum ROI.",
      author: "Lisa Wang",
      role: "Business Strategist",
      date: "Mar 10, 2025",
      readTime: "6 min read",
      image: "📊",
    },
    {
      id: "fortune-500-ai-deployment",
      category: "Case Study",
      title: "How Fortune 500 Companies Deploy AI Agents",
      excerpt: "Real-world examples of successful AI agent implementations in enterprise environments. Learn best practices, common challenges, and solutions from industry leaders.",
      author: "David Park",
      role: "Solutions Architect",
      date: "Mar 5, 2025",
      readTime: "10 min read",
      image: "🏢",
    },
    {
      id: "ai-ethics-responsibility",
      category: "Insights",
      title: "AI Ethics and Responsible Automation",
      excerpt: "Understanding the ethical implications of AI agents and how to build systems that are transparent, fair, and aligned with human values.",
      author: "Sarah Chen",
      role: "Founder & CEO",
      date: "Feb 28, 2025",
      readTime: "7 min read",
      image: "⚖️",
    },
    {
      id: "machine-learning-advances",
      category: "Technology",
      title: "Latest Advances in Machine Learning",
      excerpt: "Dive deep into the latest breakthroughs in machine learning that are powering the next generation of AI agents and autonomous systems.",
      author: "Michael Rodriguez",
      role: "CTO & Co-founder",
      date: "Feb 20, 2025",
      readTime: "9 min read",
      image: "🧠",
    },
    {
      id: "getting-started-ai-agents",
      category: "Guide",
      title: "Getting Started with AI Agents: A Beginner's Guide",
      excerpt: "A comprehensive introduction to AI agents for business leaders and technical teams. Learn the fundamentals and how to implement your first automation.",
      author: "Emma Thompson",
      role: "VP of Product",
      date: "Feb 15, 2025",
      readTime: "5 min read",
      image: "🚀",
    },
  ];

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = ["All", ...Array.from(new Set(articles.map((a) => a.category)))];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const displayedArticles = filteredArticles.filter(
    (article) => selectedCategory === "All" || article.category === selectedCategory
  );

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10 border-b border-border">
        <div className="container max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            AgentLab Blog
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Insights, trends, and best practices in AI automation. Stay updated with the latest
            developments in intelligent systems and business transformation.
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 bg-white border-b border-border">
        <div className="container max-w-4xl">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
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
      <section className="py-20 bg-white">
        <div className="container max-w-4xl">
          {displayedArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {displayedArticles.map((article) => (
                <Card
                  key={article.id}
                  className="border border-border hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                  onClick={() => navigate(`/blog/${article.id}`)}
                >
                  <div className="p-6 h-full flex flex-col">
                    {/* Header */}
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-3">
                        {article.category}
                      </span>
                      <div className="text-4xl mb-3">{article.image}</div>
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
                          {article.date}
                        </div>
                        <span className="text-xs font-medium text-primary">
                          {article.readTime}
                        </span>
                      </div>
                          <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {article.author.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {article.author}
                            </p>
                            <p className="text-xs text-muted-foreground">{article.role}</p>
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
                No articles found matching your search.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
        <div className="container max-w-2xl text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">Subscribe to Our Newsletter</h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Get the latest insights on AI automation and business transformation delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button className="bg-primary hover:bg-primary/90">Subscribe</Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
