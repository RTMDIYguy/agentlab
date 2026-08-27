import { Stagehand } from "@browserbasehq/stagehand";
import { writeFile } from "node:fs/promises";
import * as path from "node:path";

async function main() {
  const stagehand = new Stagehand({
    env: "LOCAL",
    modelName: "google/gemini-3-flash-preview",
  });
  await stagehand.init();
  
  const page = stagehand.page;
  
  // App store preview
  await page.goto("http://localhost:5173/marketplace", { waitUntil: "networkidle" });
  await page.waitForTimeout(3000); // let animations settle
  await page.screenshot({ path: path.resolve("client/public/app-store-preview.png"), fullPage: true });
  
  // Command center preview
  await page.goto("http://localhost:5173/command-center", { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.resolve("client/public/command-center-preview.png"), fullPage: true });

  await stagehand.close();
  console.log("Screenshots captured!");
}

main().catch(console.error);
