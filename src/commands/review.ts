import { resolve } from "node:path";
import { runReview } from "../review/run.js";

export async function reviewCommand(opts: {
  repo: string; pr: string; decisions: string; model: string;
  baseline?: boolean; offline?: boolean; json?: boolean
}): Promise<void> {
  try {
    const number = Number(opts.pr);
    const report = await runReview({
      repository: opts.repo,
      pullRequest: number,
      decisionsPath: resolve(opts.decisions),
      baseline: Boolean(opts.baseline),
      offline: Boolean(opts.offline),
      model: opts.model
    });
    if (opts.json) {
      console.log(JSON.stringify(report, null, 2));
      return;
    }
    console.log("IROKO Review | " + report.repository + "#" + report.pullRequest);
    console.log("Mode: " + (report.baseline ? "baseline" : "context-aware") +
      (opts.offline ? " (offline discovery)" : " (AI)"));
    console.log("Changed files: " + report.analysedFiles);
    console.log("Approved decisions selected: " + (report.decisionsProvided.join(", ") || "none"));
    for (const warning of report.warnings) console.log("Note: " + warning);
    for (const finding of report.findings) {
      console.log("\n[" + finding.severity.toUpperCase() + "] " + finding.title);
      console.log(finding.path + " | decisions: " + (finding.decisionIds.join(", ") || "none"));
      console.log(finding.explanation);
      console.log("Evidence: " + finding.evidence);
    }
    if (!opts.offline) console.log("\nFindings: " + report.findings.length);
    console.log("Read-only: nothing posted to GitHub and no PR code was executed.");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("IROKO review failed: " + message);
    process.exitCode = 1;
  }
}
