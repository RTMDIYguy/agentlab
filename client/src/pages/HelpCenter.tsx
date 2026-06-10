import { PageLayout } from "@/components/PageLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDown, Search, BookOpen, MessageSquare, Mail, Phone, MapPin } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { LiveChat } from "@/components/LiveChat";

function ContactFormComponent() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitMutation = trpc.contact.submitContact.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitMutation.mutateAsync(formData);
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Name</label>
        <input
          type="text"
          placeholder="Your name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Email</label>
        <input
          type="email"
          placeholder="your@email.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
        <input
          type="text"
          placeholder="How can we help?"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Message</label>
        <textarea
          placeholder="Tell us more..."
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          required
        />
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90">
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}

export default function HelpCenter() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showChatWidget, setShowChatWidget] = useState(false);

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
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle. If you upgrade, you'll be prorated for the difference.",
    },
    {
      category: "features",
      question: "What AI capabilities does AgentLab provide?",
      answer: "AgentLab provides advanced AI capabilities including natural language processing, machine learning, multi-agent coordination, real-time processing, and enterprise security. Our agents can be customized for your specific business needs.",
    },
    {
      category: "features",
      question: "Can I integrate AgentLab with other tools?",
      answer: "Yes, AgentLab offers extensive integration capabilities with popular business tools including Slack, Microsoft Teams, Salesforce, HubSpot, and more. We also provide a comprehensive API for custom integrations.",
    },
    {
      category: "security",
      question: "How secure is AgentLab?",
      answer: "AgentLab is built with enterprise-grade security including end-to-end encryption, SOC 2 compliance, GDPR compliance, and regular security audits. Your data is stored in secure, redundant data centers.",
    },
    {
      category: "security",
      question: "What happens to my data if I cancel?",
      answer: "When you cancel your account, your data is retained for 30 days. You can request a data export at any time. After 30 days, all data is permanently deleted from our servers.",
    },
    {
      category: "support",
      question: "What support options are available?",
      answer: "We offer 24/7 email support for all plans, live chat for Professional and Enterprise plans, and phone support for Enterprise customers. Response times vary based on your plan.",
    },
    {
      category: "support",
      question: "Is there documentation available?",
      answer: "Yes, we have comprehensive documentation including getting started guides, API documentation, code examples, and video tutorials. All documentation is available in our knowledge base.",
    },
    {
      category: "support",
      question: "How do I report a bug?",
      answer: "You can report bugs through our support portal, email, or live chat. Please include as much detail as possible including steps to reproduce, expected behavior, and actual behavior.",
    },
  ];

  const knowledgeBase = [
    {
      id: 1,
      category: "Tutorial",
      title: "Getting Started with Your First Agent",
      excerpt: "Learn how to create, configure, and deploy your first AI agent in AgentLab.",
      readTime: "5 min",
    },
    {
      id: 2,
      category: "Integration",
      title: "Integrating AgentLab with Slack",
      excerpt: "Step-by-step guide to connect your AgentLab agents with Slack for seamless communication.",
      readTime: "8 min",
    },
    {
      id: 3,
      category: "Advanced",
      title: "Building Multi-Agent Systems",
      excerpt: "Advanced techniques for coordinating multiple agents to solve complex business problems.",
      readTime: "12 min",
    },
    {
      id: 4,
      category: "API",
      title: "AgentLab REST API Reference",
      excerpt: "Complete reference for the AgentLab API including endpoints, authentication, and examples.",
      readTime: "15 min",
    },
    {
      id: 5,
      category: "Security",
      title: "Security Best Practices",
      excerpt: "Essential security practices for deploying AI agents in production environments.",
      readTime: "7 min",
    },
    {
      id: 6,
      category: "Troubleshooting",
      title: "Common Issues and Solutions",
      excerpt: "Solutions to frequently encountered problems and how to resolve them quickly.",
      readTime: "6 min",
    },
  ];

  const categories = ["all", "getting-started", "billing", "features", "security", "support"];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-12 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border">
        <div className="container max-w-6xl">
          <h1 className="text-4xl font-bold text-foreground mb-4">Help Center</h1>
          <p className="text-lg text-muted-foreground">Find answers to common questions and get support from our team</p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 border-b border-border">
        <div className="container max-w-6xl">
          <h2 className="text-3xl font-bold text-foreground mb-8">Frequently Asked Questions</h2>

          {/* Search and Filter */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-3 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-primary text-white"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ")}
                </button>
              ))}
            </div>
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

      {/* Live Chat Widget Section */}
      <section className="py-8 bg-primary/5 border-t border-b border-border">
        <div className="container max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Need Instant Help?</h3>
              <p className="text-muted-foreground">Chat with our support team in real-time for immediate assistance</p>
            </div>
            <Button
              onClick={() => setShowChatWidget(!showChatWidget)}
              className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 whitespace-nowrap"
            >
              <MessageSquare className="w-4 h-4" />
              {showChatWidget ? "Close Chat" : "Start Chat"}
            </Button>
          </div>
          {showChatWidget && (
            <div className="mt-6 bg-white rounded-lg border border-border shadow-lg p-6 min-h-96">
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-primary/30" />
                <h4 className="text-lg font-semibold text-foreground mb-2">Live Chat Ready</h4>
                <p className="text-muted-foreground mb-2">Chat widget will appear here once configured with your Crisp Website ID</p>
                <p className="text-sm text-muted-foreground">To enable live chat, update the CRISP_WEBSITE_ID in the LiveChat component with your actual Crisp website ID</p>
                <LiveChat />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12" id="contact">
        <div className="container max-w-6xl">
          <h2 className="text-3xl font-bold text-foreground mb-8">Get in Touch</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card className="p-8 border border-border">
              <h3 className="text-xl font-semibold text-foreground mb-6">Send us a Message</h3>
              <ContactFormComponent />
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card className="p-6 border border-border">
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Email</h4>
                    <p className="text-muted-foreground">info@unclerobertconsulting.com</p>
                    <p className="text-sm text-muted-foreground mt-1">We respond within 24 hours</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border border-border">
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Phone</h4>
                    <p className="text-muted-foreground">+1 (816) 301-1048</p>
                    <p className="text-sm text-muted-foreground mt-1">Mon-Fri, 9am-6pm EST</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border border-border">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Office</h4>
                    <p className="text-muted-foreground">1335 N Liberty St</p>
                    <p className="text-muted-foreground">Independence, MO 64050</p>
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
