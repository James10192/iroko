/** IROKO Review: project decisions remain human-approved. The PR diff is untrusted input. */
export interface Decision {
  id: string;
  statement: string;
  scopes: string[];
  status: "draft" | "approved" | "superseded";
  source: string;
  rationale?: string;
  updatedAt?: string;
}
export interface ChangedFile { filename: string; status: string; patch: string | null }
export interface Finding {
  title: string;
  severity: "info" | "warning" | "error";
  path: string;
  explanation: string;
  evidence: string;
  decisionIds: string[];
}
export interface ReviewResult {
  repository: string;
  pullRequest: number;
  baseline: boolean;
  analysedFiles: number;
  decisionsProvided: string[];
  findings: Finding[];
  usage: { inputTokens: number; outputTokens: number } | null;
  warnings: string[];
}
const STOP = new Set(["the", "and", "for", "from", "with", "this", "that", "into", "must", "only", "when", "each", "les", "des", "une", "dans", "pour", "par"]);
function tokens(value: string): Set<string> {
  return new Set((value.toLowerCase().normalize("NFKD").match(/[a-z0-9]{3,}/g) ?? []).filter(x => !STOP.has(x)));
}
function matchesScope(scope: string, path: string): boolean {
  if (scope === "*") return true;
  const prefix = scope.endsWith("*") ? scope.slice(0, -1) : scope;
  return path === prefix || (scope.endsWith("*") && path.startsWith(prefix));
}
export function selectDecisions(records: Decision[], changed: ChangedFile[], limit = 6): Decision[] {
  const paths = changed.map(f => f.filename);
  const taskTokens = tokens(changed.map(f => f.filename + "\n" + (f.patch ?? "").slice(0, 8000)).join("\n"));
  return records
    .filter(r => r.status === "approved" && r.id.trim() && r.statement.trim() && r.source.trim())
    .map(r => {
      const pathScore = r.scopes.some(s => paths.some(p => matchesScope(s, p))) ? 8 : 0;
      const contentScore = [...tokens(r.statement + " " + (r.rationale ?? ""))]
        .filter(t => taskTokens.has(t)).length;
      return { record: r, score: pathScore + Math.min(contentScore, 5) };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score || a.record.id.localeCompare(b.record.id))
    .slice(0, Math.min(Math.max(0, limit), 12))
    .map(x => x.record);
}
export function validateFindings(raw: unknown, changed: ChangedFile[], provided: Decision[]): Finding[] {
  if (!raw || typeof raw !== "object" || !Array.isArray((raw as { findings?: unknown }).findings)) {
    throw new Error("Model did not return an object containing findings[]");
  }
  const paths = new Set(changed.map(f => f.filename));
  const decisionIds = new Set(provided.map(d => d.id));
  return (raw as { findings: unknown[] }).findings.slice(0, 20).flatMap((item): Finding[] => {
    if (!item || typeof item !== "object") return [];
    const f = item as Partial<Finding>;
    if (typeof f.path !== "string" || !paths.has(f.path)) return [];
    if (typeof f.title !== "string" || !f.title.trim()) return [];
    if (typeof f.explanation !== "string" || f.explanation.trim().length < 12) return [];
    if (typeof f.evidence !== "string" || !f.evidence.trim()) return [];
    if (!["info", "warning", "error"].includes(String(f.severity))) return [];
    const suppliedIds = Array.isArray(f.decisionIds) ? f.decisionIds : [];
    if (suppliedIds.some(id => !decisionIds.has(id))) return [];
    return [{
      title: f.title.slice(0, 160),
      severity: f.severity as Finding["severity"],
      path: f.path,
      explanation: f.explanation.slice(0, 1500),
      evidence: f.evidence.slice(0, 1000),
      decisionIds: suppliedIds.slice(0, 8)
    }];
  });
}
