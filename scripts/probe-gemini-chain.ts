/**
 * Live probe for the shared Gemini model chain (CC-2026-09-30-012).
 *
 * Runs one real one-token generation per model in GOOGLE_MODEL_CHAIN with the
 * app's own credential factory, so a chain re-order can be verified BEFORE
 * deploy and the current GA model confirmed AFTER it. Prints statuses only —
 * no secret material. Usage:
 *
 *   npx tsx scripts/probe-gemini-chain.ts
 */
import {
  GOOGLE_MODEL_CHAIN,
  createGoogleProvider,
  isGoogleAiConfigured,
} from "../server/_core/google-ai";
import { generateText } from "ai";

async function main() {
  console.log("credential configured:", isGoogleAiConfigured());
  const google = createGoogleProvider();

  for (const model of GOOGLE_MODEL_CHAIN) {
    try {
      const started = Date.now();
      const result = await generateText({
        model: google(model) as any,
        prompt: "Reply with the single word: pong",
        maxOutputTokens: 512,
      });
      console.log(
        `${model}: OK (${Date.now() - started}ms, ${result.usage?.totalTokens ?? "?"} tokens) -> ${JSON.stringify(result.text).slice(0, 60)}`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(`${model}: FAIL -> ${message.slice(0, 140)}`);
    }
  }
}

main().catch(err => {
  console.error("probe crashed:", err);
  process.exit(1);
});
