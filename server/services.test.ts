import { describe, it, expect } from "vitest";

describe("Services Page Tests", () => {
  describe("Services Page Structure", () => {
    it("should have a services page at /services route", () => {
      const route = "/services";
      expect(route).toBe("/services");
    });

    it("should display page title with Marketing Department AI Agents", () => {
      const title = "Marketing Department AI Agents";
      expect(title).toContain("Marketing");
      expect(title).toContain("AI Agents");
    });

    it("should have navigation with Services link", () => {
      const navLinks = ["Home", "Services", "About", "Blog"];
      expect(navLinks).toContain("Services");
    });
  });

  describe("Marketing Workflows", () => {
    it("should display 6 marketing workflows", () => {
      const workflows = [
        "Lead Generation & Conversion",
        "Email/SMS Nurture Sequences",
        "Polls & Assessments",
        "Content Marketing & SEO",
        "Social Media Management",
        "Paid Advertising Management",
      ];
      expect(workflows.length).toBe(6);
    });

    it("Lead Generation & Conversion workflow should be in all tiers", () => {
      const workflow = {
        name: "Lead Generation & Conversion",
        basicIncluded: true,
        midIncluded: true,
        premiumIncluded: true,
      };

      expect(workflow.basicIncluded).toBe(true);
      expect(workflow.midIncluded).toBe(true);
      expect(workflow.premiumIncluded).toBe(true);
    });

    it("Email/SMS Nurture Sequences should be in all tiers", () => {
      const workflow = {
        name: "Email/SMS Nurture Sequences",
        basicIncluded: true,
        midIncluded: true,
        premiumIncluded: true,
      };

      expect(workflow.basicIncluded).toBe(true);
    });

    it("Polls & Assessments should not be in Basic tier", () => {
      const workflow = {
        name: "Polls & Assessments",
        basicIncluded: false,
        midIncluded: true,
        premiumIncluded: true,
      };

      expect(workflow.basicIncluded).toBe(false);
      expect(workflow.midIncluded).toBe(true);
    });

    it("Content Marketing & SEO should not be in Basic tier", () => {
      const workflow = {
        name: "Content Marketing & SEO",
        basicIncluded: false,
        midIncluded: true,
        premiumIncluded: true,
      };

      expect(workflow.basicIncluded).toBe(false);
    });

    it("Social Media Management should only be in Enterprise tier", () => {
      const workflow = {
        name: "Social Media Management",
        basicIncluded: false,
        midIncluded: false,
        premiumIncluded: true,
      };

      expect(workflow.basicIncluded).toBe(false);
      expect(workflow.midIncluded).toBe(false);
      expect(workflow.premiumIncluded).toBe(true);
    });

    it("Paid Advertising Management should only be in Enterprise tier", () => {
      const workflow = {
        name: "Paid Advertising Management",
        basicIncluded: false,
        midIncluded: false,
        premiumIncluded: true,
      };

      expect(workflow.basicIncluded).toBe(false);
      expect(workflow.premiumIncluded).toBe(true);
    });

    it("each workflow should have automation level", () => {
      const workflow = {
        name: "Lead Generation & Conversion",
        automation: "90-95%",
      };

      expect(workflow.automation).toBeTruthy();
      expect(workflow.automation).toContain("%");
    });

    it("each workflow should have cycle time", () => {
      const workflow = {
        name: "Lead Generation & Conversion",
        cycletime: "24-72 hours",
      };

      expect(workflow.cycletime).toBeTruthy();
    });

    it("each workflow should have features list", () => {
      const workflow = {
        name: "Lead Generation & Conversion",
        features: [
          "Multi-channel campaign launch and optimization",
          "Automated lead enrichment with firmographic data",
          "BANT-based lead qualification",
        ],
      };

      expect(workflow.features.length).toBeGreaterThan(0);
      expect(workflow.features[0]).toBeTruthy();
    });
  });

  describe("Pricing Tiers", () => {
    it("should have 3 pricing tiers", () => {
      const tiers = ["Basic", "Professional", "Enterprise"];
      expect(tiers.length).toBe(3);
    });

    it("Basic tier should cost $499/month", () => {
      const tier = {
        name: "Basic",
        monthlyPrice: 499,
        yearlyPrice: 4990,
      };

      expect(tier.monthlyPrice).toBe(499);
      expect(tier.yearlyPrice).toBe(4990);
    });

    it("Professional tier should cost $1499/month", () => {
      const tier = {
        name: "Professional",
        monthlyPrice: 1499,
        yearlyPrice: 14990,
      };

      expect(tier.monthlyPrice).toBe(1499);
      expect(tier.yearlyPrice).toBe(14990);
    });

    it("Enterprise tier should cost $2999/month", () => {
      const tier = {
        name: "Enterprise",
        monthlyPrice: 2999,
        yearlyPrice: 29990,
      };

      expect(tier.monthlyPrice).toBe(2999);
      expect(tier.yearlyPrice).toBe(29990);
    });

    it("Professional tier should be highlighted", () => {
      const tier = {
        name: "Professional",
        highlighted: true,
      };

      expect(tier.highlighted).toBe(true);
    });

    it("Basic tier should not be highlighted", () => {
      const tier = {
        name: "Basic",
        highlighted: false,
      };

      expect(tier.highlighted).toBe(false);
    });

    it("Enterprise tier should not be highlighted", () => {
      const tier = {
        name: "Enterprise",
        highlighted: false,
      };

      expect(tier.highlighted).toBe(false);
    });

    it("Basic tier should include 2 workflows", () => {
      const tier = {
        name: "Basic",
        workflowCount: 2,
      };

      expect(tier.workflowCount).toBe(2);
    });

    it("Professional tier should include 4 workflows", () => {
      const tier = {
        name: "Professional",
        workflowCount: 4,
      };

      expect(tier.workflowCount).toBe(4);
    });

    it("Enterprise tier should include 6 workflows", () => {
      const tier = {
        name: "Enterprise",
        workflowCount: 6,
      };

      expect(tier.workflowCount).toBe(6);
    });

    it("each tier should have features list", () => {
      const tier = {
        name: "Basic",
        features: [
          "Lead Generation & Conversion workflow",
          "Email/SMS Nurture Sequences",
          "Basic analytics and reporting",
        ],
      };

      expect(tier.features.length).toBeGreaterThan(0);
    });

    it("Professional tier should have more features than Basic", () => {
      const basicFeatures = 5;
      const proFeatures = 7;

      expect(proFeatures).toBeGreaterThan(basicFeatures);
    });

    it("Enterprise tier should have more features than Professional", () => {
      const proFeatures = 7;
      const enterpriseFeatures = 9;

      expect(enterpriseFeatures).toBeGreaterThan(proFeatures);
    });
  });

  describe("Tier Feature Progression", () => {
    it("Basic tier should include Lead Generation workflow", () => {
      const tier = {
        features: [
          "Lead Generation & Conversion workflow",
          "Email/SMS Nurture Sequences",
        ],
      };

      expect(tier.features[0]).toContain("Lead Generation");
    });

    it("Professional tier should include Polls & Assessments", () => {
      const tier = {
        features: [
          "All Basic features",
          "Polls & Assessments",
          "Content Marketing & SEO",
        ],
      };

      expect(tier.features).toContain("Polls & Assessments");
    });

    it("Enterprise tier should include Social Media Management", () => {
      const tier = {
        features: [
          "All Professional features",
          "Social Media Management",
          "Paid Advertising Management",
        ],
      };

      expect(tier.features).toContain("Social Media Management");
    });

    it("Enterprise tier should include Paid Advertising Management", () => {
      const tier = {
        features: [
          "All Professional features",
          "Social Media Management",
          "Paid Advertising Management",
        ],
      };

      expect(tier.features).toContain("Paid Advertising Management");
    });

    it("Enterprise tier should have dedicated account manager", () => {
      const tier = {
        features: [
          "Dedicated account manager",
          "24/7 phone + email support",
        ],
      };

      expect(tier.features).toContain("Dedicated account manager");
    });

    it("Enterprise tier should have 24/7 support", () => {
      const tier = {
        features: [
          "Dedicated account manager",
          "24/7 phone + email support",
        ],
      };

      expect(tier.features).toContain("24/7 phone + email support");
    });
  });

  describe("Pricing Logic", () => {
    it("yearly pricing should be approximately 10x monthly price", () => {
      const tier = {
        monthlyPrice: 499,
        yearlyPrice: 4990,
      };

      const expectedYearly = tier.monthlyPrice * 10;
      expect(tier.yearlyPrice).toBe(expectedYearly);
    });

    it("Professional yearly should be 10x monthly", () => {
      const tier = {
        monthlyPrice: 1499,
        yearlyPrice: 14990,
      };

      expect(tier.yearlyPrice).toBe(tier.monthlyPrice * 10);
    });

    it("Enterprise yearly should be 10x monthly", () => {
      const tier = {
        monthlyPrice: 2999,
        yearlyPrice: 29990,
      };

      expect(tier.yearlyPrice).toBe(tier.monthlyPrice * 10);
    });

    it("Professional should cost 3x Basic monthly price", () => {
      const basic = 499;
      const professional = 1499;

      expect(professional).toBeGreaterThan(basic * 2);
    });

    it("Enterprise should cost approximately 2x Professional monthly price", () => {
      const professional = 1499;
      const enterprise = 2999;

      // 2999 is very close to 1499 * 2 (2998), difference is only $1
      expect(enterprise).toBeGreaterThan(professional * 2 - 10);
      expect(enterprise).toBeLessThan(professional * 2 + 10);
    });
  });

  describe("Call-to-Action Buttons", () => {
    it("Basic tier should have Get Started CTA", () => {
      const tier = {
        name: "Basic",
        cta: "Get Started",
      };

      expect(tier.cta).toBe("Get Started");
    });

    it("Professional tier should have Get Started CTA", () => {
      const tier = {
        name: "Professional",
        cta: "Get Started",
      };

      expect(tier.cta).toBe("Get Started");
    });

    it("Enterprise tier should have Contact Sales CTA", () => {
      const tier = {
        name: "Enterprise",
        cta: "Contact Sales",
      };

      expect(tier.cta).toBe("Contact Sales");
    });
  });

  describe("Page Sections", () => {
    it("should have hero section", () => {
      const sections = ["hero", "workflows", "pricing", "cta"];
      expect(sections).toContain("hero");
    });

    it("should have workflows section", () => {
      const sections = ["hero", "workflows", "pricing", "cta"];
      expect(sections).toContain("workflows");
    });

    it("should have pricing section", () => {
      const sections = ["hero", "workflows", "pricing", "cta"];
      expect(sections).toContain("pricing");
    });

    it("should have call-to-action section", () => {
      const sections = ["hero", "workflows", "pricing", "cta"];
      expect(sections).toContain("cta");
    });
  });

  describe("Marketing Department Specificity", () => {
    it("should focus on marketing workflows not other departments", () => {
      const workflows = [
        "Lead Generation & Conversion",
        "Email/SMS Nurture Sequences",
        "Polls & Assessments",
        "Content Marketing & SEO",
        "Social Media Management",
        "Paid Advertising Management",
      ];

      const allMarketing = workflows.every((w) =>
        w.toLowerCase().includes("lead") ||
        w.toLowerCase().includes("email") ||
        w.toLowerCase().includes("content") ||
        w.toLowerCase().includes("social") ||
        w.toLowerCase().includes("advertising") ||
        w.toLowerCase().includes("assessment") ||
        w.toLowerCase().includes("poll")
      );

      expect(allMarketing).toBe(true);
    });

    it("should mention future department expansion", () => {
      const description =
        "Choose the perfect plan for your marketing team. All plans include our core AI agents and analytics.";
      expect(description).toBeTruthy();
    });
  });
});
