You are Antigravity, the Executor.

Your current objective is to implement **Phase 12: Database Unification & Stripe Webhooks** for AgentLab. We need to resolve a database dialect mismatch (MySQL vs Postgres) by fully committing to PostgreSQL, and we need to wire up the Stripe webhook to actually provision the marketplace packages upon payment.

### 1. Database Unification (Switching fully to PostgreSQL)
Our `server/schema.ts` is written for Postgres (`pgTable`), but the rest of the app was originally scaffolded for MySQL. Let's fix this:
1. **Dependencies:** Remove `mysql2` from `package.json` and add `postgres` (the Node.js postgres client). (You can manually edit `package.json` or run `npm uninstall mysql2 && npm install postgres`).
2. **Update `server/db.ts`:**
   Change the connection logic to use `postgres` and `drizzle-orm/postgres-js`. 
   *Example:*
   ```typescript
   import { drizzle } from 'drizzle-orm/postgres-js';
   import postgres from 'postgres';
   import * as schema from './schema';

   const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/agentlab';
   const client = postgres(connectionString);
   export const db = drizzle(client, { schema });
   
   export async function getDb() {
     return db;
   }
   ```
3. **Update `drizzle.config.ts`:** Change `dialect: "mysql"` to `dialect: "postgresql"`. Ensure `schema` points to `./server/schema.ts`.
4. **Cleanup:** Delete `drizzle/schema.ts` and `server/schema.sql` if they exist, as `server/schema.ts` is our single source of truth. Remove any type-casting hacks you added in Phase 11 to bypass the MySQL/Postgres type mismatches.

### 2. Stripe Webhook Integration (`server/stripe/webhook.ts`)
We need to listen for successful payments and provision the Knowledge Packages.
1. In `server/stripe/webhook.ts`, handle the `checkout.session.completed` event.
2. Extract `workspaceId` and `packageId` from the session's `metadata` (we assume the checkout session was created with these).
3. Extract the `subscription` ID from the session.
4. Upsert a record into the `workspacePackages` table:
   - `workspaceId`: from metadata
   - `packageId`: from metadata
   - `status`: 'active'
   - `stripeSubscriptionId`: from the session
   - `unlockedAt`: new Date()

### 3. Stripe Checkout Creation (`server/stripe/checkout.ts` or `server/controllers/marketplace.ts`)
In your `marketplace.ts` (or `checkout.ts`), update the `/subscribe` endpoint. Instead of just blindly inserting into the DB, it should ideally create a Stripe Checkout Session (if `STRIPE_SECRET_KEY` is present) passing the `workspaceId` and `packageId` in the `metadata`, and return the `checkoutUrl`. 
*Note: If `STRIPE_SECRET_KEY` is missing (local dev), you can gracefully fallback to the direct DB insert you built in Phase 11.*

Please execute these changes, run `npm run check`, and summarize your work when complete!