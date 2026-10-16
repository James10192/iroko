import test from "node:test";
import assert from "node:assert/strict";
import { selectDecisions, validateFindings } from "./core.js";
import { parseRepository } from "./github.js";
import type { ChangedFile, Decision } from "./core.js";
const changed: ChangedFile[] = [{
  filename: "src/payments/receipts.ts",
  status: "modified",
  patch: "@@ -1,2 +1,2 @@\n-const cashier = settings.cashierName;\n+const cashier = user.name;\n"
}];
const rules: Decision[] = [
  { id: "PD-001", status: "approved", scopes: ["src/payments/*"],
    statement: "Receipt cashier name follows organisation settings", source: "ADR-12" },
  { id: "PD-002", status: "draft", scopes: ["src/payments/*"],
    statement: "Use short names on every receipt", source: "idea" },
  { id: "PD-003", status: "approved", scopes: ["src/dashboard/*"],
    statement: "Dashboard cards use icons", source: "design-1" }
];
test("approved path-matched decisions are selected before unrelated records", () => {
  assert.deepEqual(selectDecisions(rules, changed).map(d => d.id), ["PD-001"]);
});
test("baseline empty context returns no selected decisions", () => {
  assert.deepEqual(selectDecisions([], changed), []);
});
test("model findings reject fabricated rule identifiers and paths", () => {
  const raw = { findings: [
    { title: "Cashier setting bypass", severity: "warning", path: changed[0].filename,
      explanation: "The changed line bypasses the approved setting.", evidence: "+const cashier = user.name;",
      decisionIds: ["PD-001"] },
    { title: "Invented rule", severity: "warning", path: changed[0].filename,
      explanation: "A model invented an unprovided rule.", evidence: "x", decisionIds: ["FAKE"] },
    { title: "Invented path", severity: "warning", path: "src/secrets.ts",
      explanation: "This file was not changed in the PR.", evidence: "x", decisionIds: [] }
  ] };
  const out = validateFindings(raw, changed, [rules[0]]);
  assert.equal(out.length, 1);
  assert.deepEqual(out[0].decisionIds, ["PD-001"]);
});
test("repository input cannot be arbitrary URL or shell text", () => {
  assert.deepEqual(parseRepository("James10192/iroko"), { owner: "James10192", name: "iroko" });
  assert.throws(() => parseRepository("https://github.com/a/b"));
  assert.throws(() => parseRepository("a/b; echo secret"));
});
test("invalid model response fails rather than fabricating review results", () => {
  assert.throws(() => validateFindings({ message: "looks fine" }, changed, [rules[0]]));
});
