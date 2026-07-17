import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageLayout } from "@/components/PageLayout";
import { Check, Plus, Minus, ShoppingCart, ArrowRight, Zap } from "lucide-react";

interface QuoteItem {
  id: string;
  department: string;
  tier: string;
  monthlyPrice: number;
}

const DEPARTMENTS = [
  {
    id: "marketing",
    name: "Marketing",
    color: "from-blue-500 to-blue-600",
    description: "Lead generation, nurturing, content, and paid advertising",
  },
  {
    id: "sales",
    name: "Sales",
    color: "from-green-500 to-green-600",
    description: "Pipeline management, forecasting, and deal acceleration",
  },
  {
    id: "operations",
    name: "Operations",
    color: "from-purple-500 to-purple-600",
    description: "Process automation, workflow optimization, and compliance",
  },
  {
    id: "finance",
    name: "Finance",
    color: "from-amber-500 to-amber-600",
    description: "Expense management, forecasting, and reporting",
  },
];

const PRICING_TIERS = {
  marketing: [
    {
      tier: "basic",
      name: "Basic",
      monthlyPrice: 499,
      workflows: 2,
      description: "Essential marketing automation",
    },
    {
      tier: "professional",
      name: "Professional",
      monthlyPrice: 1499,
      workflows: 4,
      description: "Advanced features and analytics",
    },
    {
      tier: "enterprise",
      name: "Enterprise",
      monthlyPrice: 2999,
      workflows: 6,
      description: "Full suite with dedicated support",
    },
  ],
  sales: [
    {
      tier: "basic",
      name: "Basic",
      monthlyPrice: 599,
      workflows: 2,
      description: "Pipeline basics",
    },
    {
      tier: "professional",
      name: "Professional",
      monthlyPrice: 1699,
      workflows: 4,
      description: "Advanced pipeline management",
    },
    {
      tier: "enterprise",
      name: "Enterprise",
      monthlyPrice: 3299,
      workflows: 6,
      description: "Full sales suite",
    },
  ],
  operations: [
    {
      tier: "basic",
      name: "Basic",
      monthlyPrice: 449,
      workflows: 2,
      description: "Basic automation",
    },
    {
      tier: "professional",
      name: "Professional",
      monthlyPrice: 1399,
      workflows: 4,
      description: "Advanced workflows",
    },
    {
      tier: "enterprise",
      name: "Enterprise",
      monthlyPrice: 2799,
      workflows: 6,
      description: "Enterprise operations",
    },
  ],
  finance: [
    {
      tier: "basic",
      name: "Basic",
      monthlyPrice: 549,
      workflows: 2,
      description: "Basic finance automation",
    },
    {
      tier: "professional",
      name: "Professional",
      monthlyPrice: 1549,
      workflows: 4,
      description: "Advanced finance tools",
    },
    {
      tier: "enterprise",
      name: "Enterprise",
      monthlyPrice: 2999,
      workflows: 6,
      description: "Enterprise finance suite",
    },
  ],
};

export default function Pricing() {
  const [selectedDepartment, setSelectedDepartment] = useState("marketing");
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const currentDept = DEPARTMENTS.find((d) => d.id === selectedDepartment);
  const tiers = PRICING_TIERS[selectedDepartment as keyof typeof PRICING_TIERS] || [];

  const addToQuote = (tier: (typeof tiers)[0]) => {
    const newItem: QuoteItem = {
      id: `${selectedDepartment}-${tier.tier}-${Date.now()}`,
      department: selectedDepartment,
      tier: tier.tier,
      monthlyPrice: tier.monthlyPrice,
    };
    setQuoteItems([...quoteItems, newItem]);
  };

  const removeFromQuote = (id: string) => {
    setQuoteItems(quoteItems.filter((item) => item.id !== id));
  };

  const calculateTotal = () => {
    const monthlyTotal = quoteItems.reduce((sum, item) => sum + item.monthlyPrice, 0);
    if (billingCycle === "yearly") {
      return Math.round(monthlyTotal * 12 * 0.9); // 10% discount for yearly
    }
    return monthlyTotal;
  };

  const total = calculateTotal();
  const monthlyTotal = quoteItems.reduce((sum, item) => sum + item.monthlyPrice, 0);
  const yearlyDiscount = billingCycle === "yearly" ? Math.round(monthlyTotal * 12 * 0.1) : 0;

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground">
              Build Your Custom <span className="text-primary">AI Agent Quote</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Select the departments and service tiers you need. Mix and match to create the perfect solution for your business.
            </p>
          </div>
        </div>
      </section>

      {/* Main Quote Builder */}
      <section className="py-20">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Department Selector & Pricing */}
            <div className="lg:col-span-2 space-y-8">
              {/* Department Tabs */}
              <div className="flex flex-wrap gap-3">
                {DEPARTMENTS.map((dept) => (
                  <button
                    key={dept.id}
                    onClick={() => setSelectedDepartment(dept.id)}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      selectedDepartment === dept.id
                        ? `bg-gradient-to-r ${dept.color} text-white shadow-lg`
                        : "bg-card border-2 border-border hover:border-primary text-foreground"
                    }`}
                  >
                    {dept.name}
                  </button>
                ))}
              </div>

              {/* Department Description */}
              {currentDept && (
                <Card className="p-6 bg-primary/5 border-primary/20">
                  <p className="text-lg text-foreground font-semibold">{currentDept.name} Department</p>
                  <p className="text-muted-foreground mt-2">{currentDept.description}</p>
                </Card>
              )}

              {/* Pricing Tiers */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-foreground">Select Service Tier</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {tiers.map((tier) => (
                    <Card
                      key={tier.tier}
                      className={`p-6 border-2 transition-all hover:shadow-lg ${
                        quoteItems.some((item) => item.department === selectedDepartment && item.tier === tier.tier)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <h4 className="text-xl font-bold text-foreground mb-2">{tier.name}</h4>
                      <p className="text-sm text-muted-foreground mb-4">{tier.description}</p>

                      <div className="mb-4">
                        <div className="text-3xl font-bold text-primary">${tier.monthlyPrice}</div>
                        <p className="text-sm text-muted-foreground">/month</p>
                      </div>

                      <div className="mb-6 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary" />
                          <span className="text-foreground">{tier.workflows} workflows included</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary" />
                          <span className="text-foreground">24/7 support</span>
                        </div>
                      </div>

                      <Button
                        onClick={() => addToQuote(tier)}
                        className="w-full bg-primary hover:bg-primary/90"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Quote
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Quote Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24 border-2 border-primary bg-primary/5">
                <h3 className="text-2xl font-bold text-foreground mb-6">Quote Summary</h3>

                {/* Billing Cycle Toggle */}
                <div className="mb-6 p-3 bg-white rounded-lg border border-border">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBillingCycle("monthly")}
                      className={`flex-1 py-2 rounded font-semibold transition-all ${
                        billingCycle === "monthly"
                          ? "bg-primary text-white"
                          : "bg-background text-foreground hover:bg-slate-100"
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setBillingCycle("yearly")}
                      className={`flex-1 py-2 rounded font-semibold transition-all ${
                        billingCycle === "yearly"
                          ? "bg-primary text-white"
                          : "bg-background text-foreground hover:bg-slate-100"
                      }`}
                    >
                      Yearly
                      <span className="text-xs ml-1">-10%</span>
                    </button>
                  </div>
                </div>

                {/* Quote Items */}
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {quoteItems.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Add departments to your quote
                    </p>
                  ) : (
                    quoteItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded border border-border">
                        <div className="flex-1">
                          <p className="font-semibold text-foreground capitalize">
                            {item.department} - {item.tier}
                          </p>
                          <p className="text-sm text-muted-foreground">${item.monthlyPrice}/mo</p>
                        </div>
                        <button
                          onClick={() => removeFromQuote(item.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Pricing Breakdown */}
                {quoteItems.length > 0 && (
                  <div className="space-y-3 mb-6 p-4 bg-white rounded border border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Monthly Subtotal:</span>
                      <span className="font-semibold text-foreground">${monthlyTotal}</span>
                    </div>
                    {billingCycle === "yearly" && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Annual Subtotal:</span>
                          <span className="font-semibold text-foreground">${monthlyTotal * 12}</span>
                        </div>
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Annual Discount (10%):</span>
                          <span className="font-semibold">-${yearlyDiscount}</span>
                        </div>
                      </>
                    )}
                    <div className="border-t border-border pt-3 flex justify-between">
                      <span className="font-bold text-foreground">
                        {billingCycle === "yearly" ? "Annual Total:" : "Monthly Total:"}
                      </span>
                      <span className="text-2xl font-bold text-primary">${total}</span>
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                <Button
                  disabled={quoteItems.length === 0}
                  className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Secure checkout powered by Stripe & PayPal
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-slate-50">
        <div className="container max-w-3xl">
          <h2 className="text-4xl font-bold text-foreground mb-12 text-center">Frequently Asked Questions</h2>

          <div className="space-y-6">
            {[
              {
                q: "Can I change my quote after submitting?",
                a: "Yes! You can modify your quote at any time before checkout. Simply adjust the departments and tiers in the quote builder.",
              },
              {
                q: "Is there a setup fee?",
                a: "No setup fees. You only pay for the service tiers you select. Billing starts immediately upon purchase.",
              },
              {
                q: "Can I mix departments with different billing cycles?",
                a: "All departments in a single quote must use the same billing cycle (monthly or yearly). You can create separate quotes for different cycles.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards via Stripe and PayPal for maximum flexibility.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes, you can cancel your subscription at any time. No long-term contracts required.",
              },
            ].map((faq, idx) => (
              <Card key={idx} className="p-6">
                <h4 className="text-lg font-semibold text-foreground mb-3">{faq.q}</h4>
                <p className="text-muted-foreground">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="container text-center space-y-6">
          <h2 className="text-4xl font-bold">Ready to Transform Your Business?</h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Start with a free trial and see how our AI agents can automate your operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Zap className="w-5 h-5 mr-2" />
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Schedule Demo
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
