import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, ArrowRight } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";

type Department = "marketing" | "sales" | "operations" | "finance";
type Tier = "basic" | "professional" | "enterprise";

interface Workflow {
  name: string;
  description: string;
}

interface DepartmentData {
  name: string;
  description: string;
  color: string;
  workflows: Workflow[];
  tiers: {
    basic: { workflows: string[]; price: number };
    professional: { workflows: string[]; price: number };
    enterprise: { workflows: string[]; price: number };
  };
}

const departments: Record<Department, DepartmentData> = {
  marketing: {
    name: "Marketing",
    description: "Automate your marketing operations with AI-powered workflows",
    color: "from-blue-500 to-blue-600",
    workflows: [
      { name: "Lead Generation", description: "Automatically identify and qualify leads from multiple sources" },
      { name: "Email & SMS Nurture", description: "Intelligent email and SMS campaigns that adapt to customer behavior" },
      { name: "Polls & Assessments", description: "Create and analyze customer surveys and assessments" },
      { name: "Content Marketing", description: "AI-assisted content creation and distribution" },
      { name: "Social Media", description: "Automated social media posting and engagement" },
      { name: "Paid Advertising", description: "Optimize ad spend across platforms with AI" },
    ],
    tiers: {
      basic: {
        workflows: ["Lead Generation", "Email & SMS Nurture"],
        price: 499,
      },
      professional: {
        workflows: ["Lead Generation", "Email & SMS Nurture", "Polls & Assessments", "Content Marketing"],
        price: 1499,
      },
      enterprise: {
        workflows: [
          "Lead Generation",
          "Email & SMS Nurture",
          "Polls & Assessments",
          "Content Marketing",
          "Social Media",
          "Paid Advertising",
        ],
        price: 2999,
      },
    },
  },
  sales: {
    name: "Sales",
    description: "Accelerate your sales pipeline with intelligent automation",
    color: "from-cyan-500 to-cyan-600",
    workflows: [
      { name: "Pipeline Management", description: "Automated deal tracking and pipeline optimization" },
      { name: "Lead Scoring", description: "AI-powered lead qualification and scoring" },
      { name: "Sales Forecasting", description: "Predictive analytics for accurate sales forecasts" },
      { name: "Proposal Generation", description: "Automated proposal creation and personalization" },
      { name: "Contract Management", description: "Streamlined contract creation and e-signature" },
      { name: "Commission Tracking", description: "Automated commission calculation and reporting" },
    ],
    tiers: {
      basic: {
        workflows: ["Pipeline Management", "Lead Scoring"],
        price: 499,
      },
      professional: {
        workflows: ["Pipeline Management", "Lead Scoring", "Sales Forecasting", "Proposal Generation"],
        price: 1499,
      },
      enterprise: {
        workflows: [
          "Pipeline Management",
          "Lead Scoring",
          "Sales Forecasting",
          "Proposal Generation",
          "Contract Management",
          "Commission Tracking",
        ],
        price: 2999,
      },
    },
  },
  operations: {
    name: "Operations",
    description: "Streamline operations with intelligent process automation",
    color: "from-purple-500 to-purple-600",
    workflows: [
      { name: "Workflow Automation", description: "Automate repetitive business processes" },
      { name: "Inventory Management", description: "Real-time inventory tracking and optimization" },
      { name: "Vendor Management", description: "Automated vendor communication and performance tracking" },
      { name: "Quality Assurance", description: "Continuous quality monitoring and reporting" },
      { name: "Resource Planning", description: "Intelligent resource allocation and scheduling" },
      { name: "Compliance Monitoring", description: "Automated compliance tracking and reporting" },
    ],
    tiers: {
      basic: {
        workflows: ["Workflow Automation", "Inventory Management"],
        price: 499,
      },
      professional: {
        workflows: ["Workflow Automation", "Inventory Management", "Vendor Management", "Quality Assurance"],
        price: 1499,
      },
      enterprise: {
        workflows: [
          "Workflow Automation",
          "Inventory Management",
          "Vendor Management",
          "Quality Assurance",
          "Resource Planning",
          "Compliance Monitoring",
        ],
        price: 2999,
      },
    },
  },
  finance: {
    name: "Finance",
    description: "Automate financial operations and improve accuracy",
    color: "from-pink-500 to-pink-600",
    workflows: [
      { name: "Accounts Payable", description: "Automated invoice processing and payment" },
      { name: "Accounts Receivable", description: "Intelligent invoicing and payment collection" },
      { name: "Expense Management", description: "Automated expense tracking and reimbursement" },
      { name: "Financial Reporting", description: "Real-time financial reporting and analytics" },
      { name: "Tax Compliance", description: "Automated tax calculation and compliance" },
      { name: "Audit Trail", description: "Complete audit trail and compliance documentation" },
    ],
    tiers: {
      basic: {
        workflows: ["Accounts Payable", "Accounts Receivable"],
        price: 499,
      },
      professional: {
        workflows: ["Accounts Payable", "Accounts Receivable", "Expense Management", "Financial Reporting"],
        price: 1499,
      },
      enterprise: {
        workflows: [
          "Accounts Payable",
          "Accounts Receivable",
          "Expense Management",
          "Financial Reporting",
          "Tax Compliance",
          "Audit Trail",
        ],
        price: 2999,
      },
    },
  },
};

export default function Features() {
  const { isAuthenticated } = useAuth();
  const [selectedDept, setSelectedDept] = useState<Department>("marketing");
  const [selectedTier, setSelectedTier] = useState<Tier>("professional");

  const dept = departments[selectedDept];
  const tier = dept.tiers[selectedTier];

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    // TODO: Add to cart functionality
    alert(`Added ${dept.name} - ${selectedTier} tier to cart`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Intelligent Automation for Every Department
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Choose your department and select the workflows that match your business needs. Mix and match to build your perfect solution.
            </p>
          </div>
        </div>
      </section>

      {/* Department Selector */}
      <section className="py-12 bg-white border-b border-border">
        <div className="container">
          <div className="flex flex-wrap gap-4 justify-center">
            {(Object.keys(departments) as Department[]).map((dept_key) => (
              <button
                key={dept_key}
                onClick={() => setSelectedDept(dept_key)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  selectedDept === dept_key
                    ? `bg-gradient-to-r ${departments[dept_key].color} text-white shadow-lg`
                    : "bg-slate-100 text-foreground hover:bg-slate-200"
                }`}
              >
                {departments[dept_key].name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Department Overview */}
      <section className="py-16 bg-gradient-to-br from-white via-blue-50/30 to-white">
        <div className="container">
          <div className="max-w-4xl mx-auto mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">{dept.name} Department</h2>
            <p className="text-lg text-muted-foreground">{dept.description}</p>
          </div>

          {/* Workflows Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {dept.workflows.map((workflow, idx) => (
              <Card key={idx} className="p-6 hover:shadow-lg transition-shadow">
                <h3 className="font-semibold text-lg text-foreground mb-2">{workflow.name}</h3>
                <p className="text-muted-foreground text-sm">{workflow.description}</p>
              </Card>
            ))}
          </div>

          {/* Pricing Tiers */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {(["basic", "professional", "enterprise"] as Tier[]).map((tier_key) => {
              const tier_data = dept.tiers[tier_key];
              const isSelected = selectedTier === tier_key;

              return (
                <Card
                  key={tier_key}
                  className={`p-8 transition-all cursor-pointer ${
                    isSelected
                      ? "ring-2 ring-primary shadow-xl scale-105"
                      : "hover:shadow-lg"
                  }`}
                  onClick={() => setSelectedTier(tier_key)}
                >
                  <h3 className="text-2xl font-bold text-foreground mb-2 capitalize">
                    {tier_key}
                  </h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-primary">
                      ${tier_data.price}
                    </span>
                    <span className="text-muted-foreground ml-2">/month</span>
                  </div>

                  <div className="space-y-3 mb-8">
                    {tier_data.workflows.map((workflow, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{workflow}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className={`w-full ${
                      isSelected
                        ? "bg-primary hover:bg-primary/90"
                        : "bg-slate-200 hover:bg-slate-300 text-foreground"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart();
                    }}
                  >
                    {isSelected ? "Add to Cart" : "Select"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Card>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <p className="text-muted-foreground mb-6">
              Want to combine multiple departments? Go to our pricing page to build a custom quote.
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Build Custom Quote
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
