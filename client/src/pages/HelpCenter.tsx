import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDown, Search, BookOpen, MessageSquare, Mail, Phone, MapPin } from "lucide-react";

export default function HelpCenter() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const faqs = [
    {
      category: "getting-started",
      question: "How do I get started with AgentLab?",
      answer: "Getting started with AgentLab is simple. Sign up for an account, choose a pricing plan that fits your needs, and follow our onboarding guide. You'll have access to our documentation and can deploy your first AI agent within minutes.",
    },
    {
      category: "getting-started",
      question: "What are the system requirements?",
      answer: "AgentLab is a cloud-based platform, so you only need a modern web browser and an internet connection. We support Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.",
    },
    {
      category: "getting-started",
      question: "Do you offer a free trial?",
      answer: "Yes! We offer a 14-day free trial of our Professional plan with full access to all features. No credit card required to start your trial.",
    },
    {
      category: "billing",
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express) and wire transfers for enterprise customers. Payments are processed securely through Stripe.",
    },
    {
      category: "billing",
      question: "Can I change my plan anytime?",
      answer: "Absolutely! You can upgrade, downgrade, or cancel your plan at any time from your account dashboard. Changes take effect immediately, and we'll prorate any charges or credits.",
    },
    {
      category: "billing",
      question: "Is there a discount for annual billing?",
      answer: "Yes! We offer a 20% discount when you choose annual billing instead of monthly. You can switch between billing cycles from your account settings.",
    },
    {
      category: "features",
      question: "What features are included in each plan?",
      answer: "Our Starter plan includes basic AI automation, up to 5 agents, and community support. Professional adds advanced features, up to 50 agents, and priority support. Enterprise includes unlimited agents, custom integrations, and dedicated support.",
    },
    {
      category: "features",
      question: "Can I integrate AgentLab with other tools?",
      answer: "Yes! AgentLab supports integrations with popular tools like Slack, Microsoft Teams, Zapier, and many others. We also provide a REST API for custom integrations.",
    },
    {
      category: "features",
      question: "How many AI agents can I deploy?",
      answer: "The number of agents depends on your plan. Starter includes 5 agents, Professional includes 50, and Enterprise has unlimited agents. You can always upgrade to deploy more agents.",
    },
    {
      category: "security",
      question: "Is my data secure with AgentLab?",
      answer: "Security is our top priority. We use end-to-end encryption, SOC 2 Type II compliance, GDPR compliance, and regular security audits. Your data is stored on secure, redundant servers.",
    },
    {
      category: "security",
      question: "How do you handle data privacy?",
      answer: "We follow strict data privacy practices. We never sell your data, use it for training, or share it with third parties without your consent. See our Privacy Policy for complete details.",
    },
    {
      category: "security",
      question: "What happens to my data if I cancel?",
      answer: "When you cancel your account, your data remains accessible for 30 days. After that, it's permanently deleted from our servers. You can request a data export before cancellation.",
    },
  ];

  const knowledgeBase = [
    {
      id: 1,
      title: "Getting Started with AI Agents",
      category: "Tutorials",
      excerpt: "Learn the basics of AI agents and how to deploy your first agent in AgentLab.",
      readTime: "5 min",
    },
    {
      id: 2,
      title: "Advanced Agent Configuration",
      category: "Advanced",
      excerpt: "Master advanced configuration options to optimize your AI agents for specific use cases.",
      readTime: "12 min",
    },
    {
      id: 3,
      title: "Integrating with Slack",
      category: "Integrations",
      excerpt: "Step-by-step guide to integrate your AI agents with Slack for seamless communication.",
      readTime: "8 min",
    },
    {
      id: 4,
      title: "API Reference Guide",
      category: "API",
      excerpt: "Complete API documentation for building custom integrations with AgentLab.",
      readTime: "20 min",
    },
    {
      id: 5,
      title: "Troubleshooting Common Issues",
      category: "Support",
      excerpt: "Solutions to common problems and how to resolve them quickly.",
      readTime: "10 min",
    },
    {
      id: 6,
      title: "Best Practices for AI Automation",
      category: "Tutorials",
      excerpt: "Learn industry best practices for implementing AI automation in your organization.",
      readTime: "15 min",
    },
  ];

  const categories = [
    { id: "all", label: "All Categories" },
    { id: "getting-started", label: "Getting Started" },
    { id: "billing", label: "Billing" },
    { id: "features", label: "Features" },
    { id: "security", label: "Security" },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-12">
        <div className="container max-w-6xl">
          <h1 className="text-4xl font-bold text-foreground mb-4">Help Center</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Find answers, explore our knowledge base, and get support when you need it.
          </p>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search FAQs and knowledge base..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 border-b border-border">
        <div className="container max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border border-border hover:shadow-lg transition-shadow cursor-pointer">
              <BookOpen className="w-8 h-8 text-primary mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Knowledge Base</h3>
              <p className="text-muted-foreground">Browse tutorials, guides, and documentation.</p>
            </Card>
            <Card className="p-6 border border-border hover:shadow-lg transition-shadow cursor-pointer">
              <MessageSquare className="w-8 h-8 text-primary mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Contact Support</h3>
              <p className="text-muted-foreground">Reach out to our support team for help.</p>
            </Card>
            <Card className="p-6 border border-border hover:shadow-lg transition-shadow cursor-pointer">
              <Mail className="w-8 h-8 text-primary mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Email Support</h3>
              <p className="text-muted-foreground">Send us an email and we'll respond within 24 hours.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12">
        <div className="container max-w-6xl">
          <h2 className="text-3xl font-bold text-foreground mb-8">Frequently Asked Questions</h2>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === category.id
                    ? "bg-primary text-white"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="space-y-3">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <Card
                  key={index}
                  className="border border-border overflow-hidden hover:border-primary/50 transition-colors"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full p-6 flex items-start justify-between hover:bg-muted/50 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-foreground text-left">{faq.question}</h3>
                    <ChevronDown
                      className={`w-5 h-5 text-primary flex-shrink-0 ml-4 transition-transform ${
                        expandedFaq === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 pb-6 border-t border-border pt-4">
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </div>
                  )}
                </Card>
              ))
            ) : (
              <Card className="p-8 border border-border text-center">
                <p className="text-muted-foreground">No FAQs found matching your search. Try different keywords.</p>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Knowledge Base Section */}
      <section className="py-12 bg-muted/50 border-t border-b border-border">
        <div className="container max-w-6xl">
          <h2 className="text-3xl font-bold text-foreground mb-8">Knowledge Base</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {knowledgeBase.map((article) => (
              <Card key={article.id} className="p-6 border border-border hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {article.category}
                  </span>
                  <span className="text-xs text-muted-foreground">{article.readTime}</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{article.title}</h3>
                <p className="text-muted-foreground text-sm">{article.excerpt}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12">
        <div className="container max-w-6xl">
          <h2 className="text-3xl font-bold text-foreground mb-8">Get in Touch</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card className="p-8 border border-border">
              <h3 className="text-xl font-semibold text-foreground mb-6">Send us a Message</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
                  <input
                    type="text"
                    placeholder="How can we help?"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Message</label>
                  <textarea
                    placeholder="Tell us more..."
                    rows={5}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90">Send Message</Button>
              </form>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card className="p-6 border border-border">
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Email</h4>
                    <p className="text-muted-foreground">support@agentlab.ai</p>
                    <p className="text-sm text-muted-foreground mt-1">We respond within 24 hours</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border border-border">
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Phone</h4>
                    <p className="text-muted-foreground">+1 (555) 123-4567</p>
                    <p className="text-sm text-muted-foreground mt-1">Mon-Fri, 9am-6pm EST</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border border-border">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Office</h4>
                    <p className="text-muted-foreground">123 Tech Street</p>
                    <p className="text-muted-foreground">San Francisco, CA 94105</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border border-border bg-primary/5">
                <h4 className="font-semibold text-foreground mb-2">Response Times</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Email: Within 24 hours</li>
                  <li>• Chat: Within 2 hours</li>
                  <li>• Phone: Within 1 hour</li>
                  <li>• Enterprise: 24/7 support</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
