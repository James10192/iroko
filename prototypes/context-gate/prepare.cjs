#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const { projectRoot, snapshot, stateFile } = require("./core.cjs");

try {
  const task = process.argv[2];
  if (!task || !/^[A-Za-z0-9_.:#-]{3,80}$/.test(task)) {
    throw new Error("Usage: node prototypes/context-gate/prepare.cjs ISSUE-123");
  }
  const root = projectRoot();
  const context = snapshot(root);
  // Manual preparation is diagnostic unless invoked with a session ID.
  // The installed UserPromptSubmit hook normally handles session-bound state.
  const sessionId = process.env.IROKO_SESSION_ID;
  if (sessionId) {
    const now = Date.now();
    const record = {
      schemaVersion: 1,
      root,
      sessionId,
      task,
      fingerprint: context.fingerprint,
      preparedAt: now,
      expiresAt: now + 20 * 60 * 1000
    };
    fs.writeFileSync(stateFile(root, sessionId), JSON.stringify(record, null, 2), {
      encoding: "utf8", mode: 0o600
    });
  }

  process.stdout.write("# IROKO context preparation: " + task + "\n\n");
  process.stdout.write("This is source evidence, NOT proof that the agent understood it.\n\n");
  for (const doc of context.documents) {
    process.stdout.write("## SOURCE: " + doc.path + "\n" + doc.content + "\n\n");
  }
  process.stdout.write("Approved write scopes: " +
    context.policy.writeScopes.join(", ") + "\n");
  process.stdout.write("Context fingerprint: " + context.fingerprint + "\n");
  process.stdout.write(sessionId
    ? "Session-bound authorization expires after 20 minutes or source / Git HEAD change.\\n"
    : "Diagnostic only: no session token issued. UserPromptSubmit must prepare the current session.\\n");
} catch (error) {
  console.error("IROKO context preparation failed: " + error.message);
  process.exitCode = 1;
}
