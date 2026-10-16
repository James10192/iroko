import { readFile } from "node:fs/promises";
import type { Decision, ReviewResult } from "./core.js";
import { selectDecisions } from "./core.js";
import { fetchPullRequestFiles } from "./github.js";
import { reviewWithOpenAI } from "./model.js";

export interface RunOptions {
  repository: string;
  pullRequest: number;
  decisionsPath: string;
  baseline: boolean;
  offline: boolean;
  model: string;
}
export async function runReview(options: RunOptions): Promise<ReviewResult> {
  const { files, warnings } = await fetchPullRequestFiles(
    options.repository, options.pullRequest, process.env.GITHUB_TOKEN
  );
  let records: Decision[] = [];
  if (!options.baseline) {
    const source = JSON.parse(await readFile(options.decisionsPath, "utf8")) as unknown;
    if (!Array.isArray(source)) throw new Error("Decisions file must contain a JSON array");
    records = source as Decision[];
  }
  const chosen = options.baseline ? [] : selectDecisions(records, files);
  const report: ReviewResult = {
    repository: options.repository, pullRequest: options.pullRequest,
    baseline: options.baseline, analysedFiles: files.length,
    decisionsProvided: chosen.map(d => d.id), findings: [], usage: null, warnings
  };
  if (!files.some(f => f.patch)) return report;
  if (options.offline) {
    report.warnings.push("Offline mode: no AI analysis performed. Findings must not be inferred from matching decisions.");
    return report;
  }
  const ai = await reviewWithOpenAI(files, chosen, process.env.OPENAI_API_KEY ?? "", options.model);
  report.findings = ai.findings;
  report.usage = ai.usage;
  return report;
}
