import { buildSchemaFromFactories } from "@autonoma-ai/sdk";
import { z } from "zod";
import { defineFactory } from "@autonoma-ai/sdk";

// Recreate exactly what factories.ts exports to test buildSchemaFromFactories

const User = defineFactory({
  inputSchema: z.object({
    openId: z.string(),
    name: z.string().optional(),
    email: z.string().optional(),
    loginMethod: z.string().optional(),
    role: z.enum(["user", "admin"]).optional(),
  }),
  create: async () => ({}),
});

const Quote = defineFactory({
  inputSchema: z.object({
    userId: z.number().optional().nullable(),
    email: z.string(),
    name: z.string(),
    company: z.string().optional(),
    status: z
      .enum(["draft", "sent", "viewed", "accepted", "rejected"])
      .optional(),
    subtotal: z.number(),
    tax: z.number().optional(),
    total: z.number(),
    items: z.string(),
    notes: z.string().optional(),
    expiresAt: z.string().optional(),
    viewedAt: z.string().optional(),
    acceptedAt: z.string().optional(),
  }),
  create: async () => ({}),
});

const Payment = defineFactory({
  inputSchema: z.object({
    userId: z.number(),
    stripePaymentIntentId: z.string(),
    stripeInvoiceId: z.string().optional(),
    amount: z.union([z.string(), z.number()]).transform(String),
    currency: z.string().optional(),
    status: z.string(),
    description: z.string().optional(),
  }),
  create: async () => ({}),
});

const factories = {
  users: User,
  quotes: Quote,
  payments: Payment,
};

try {
  const schema = buildSchemaFromFactories(factories as any, "testRunId");
  console.log("Success! Models count:", schema.models.length);
} catch (e) {
  console.error("ERROR:", e.message);
}
