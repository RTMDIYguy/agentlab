import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ClassifiedSignal, ScanRunResult } from "./types.js";

export class SignalSink {
  private baseOutDir: string;

  constructor(baseOutDir = "output/social-adept") {
    this.baseOutDir = baseOutDir;
  }

  public generateDigestMarkdown(runResult: ScanRunResult): string {
    const lines: string[] = [
      `# Social Adept Market Signal Digest`,
      ``,
      `- **Run ID**: \`${runResult.runId}\``,
      `- **Executed**: ${runResult.startedAt}`,
      `- **Total Signals Scanned**: ${runResult.totalCollected}`,
      `- **High-Value Signals (Score >= 4)**: ${runResult.highValueCount}`,
      ``,
      `---`,
      ``,
      `## High-Value Market Signals`,
      ``,
    ];

    const highValue = runResult.signals.filter((s) => s.classification.actionableScore >= 4);
    const regular = runResult.signals.filter((s) => s.classification.actionableScore < 4);

    if (highValue.length === 0) {
      lines.push(`_No high-value signals detected in this batch._`, ``);
    } else {
      for (const sig of highValue) {
        lines.push(`### [${sig.classification.category.toUpperCase()}] ${sig.title}`);
        lines.push(`- **Source**: [${sig.source}](${sig.url}) | **Author**: @${sig.author} | **Query**: \`${sig.query}\``);
        lines.push(`- **Score**: ⭐ ${sig.classification.actionableScore}/5 | **Tags**: \`${sig.classification.tags.join("`, `")}\``);
        lines.push(`- **Friction**: ${sig.classification.frictionSummary}`);
        lines.push(`- **Founder Verbatim**: > ${sig.classification.founderVerbatim}`);
        lines.push(`- **LinkedIn Angle**: 💡 ${sig.classification.linkedInHookIdea}`);
        lines.push(`- **Roundtable Question**: 🎙️ ${sig.classification.roundtableAngle}`);
        lines.push(``);
      }
    }

    if (regular.length > 0) {
      lines.push(`---`, ``, `## General Intel & Lower-Priority Mentions`, ``);
      for (const sig of regular) {
        lines.push(`- **[${sig.source}]** [${sig.title}](${sig.url}) (${sig.classification.category}) — _${sig.classification.frictionSummary}_`);
      }
      lines.push(``);
    }

    return lines.join("\n");
  }

  public async saveOutputs(runResult: ScanRunResult): Promise<{ digestFile: string; jsonFile: string }> {
    const today = new Date().toISOString().slice(0, 10);
    const dir = path.join(this.baseOutDir, today);
    await mkdir(dir, { recursive: true });

    const digestFile = path.join(dir, `digest-${runResult.runId}.md`);
    const jsonFile = path.join(dir, `signals-${runResult.runId}.json`);

    const markdown = this.generateDigestMarkdown(runResult);
    await writeFile(digestFile, markdown, "utf8");
    await writeFile(jsonFile, JSON.stringify(runResult, null, 2), "utf8");

    return { digestFile, jsonFile };
  }
}
