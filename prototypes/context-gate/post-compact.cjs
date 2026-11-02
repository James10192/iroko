#!/usr/bin/env node
"use strict";

// A compacted transcript may omit the documents previously injected.
// Invalidate the write permit, forcing a new prompt preflight before editing.
const fs = require("node:fs");
const { projectRoot, stateFile } = require("./core.cjs");

let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (part) => {
  input += part;
  if (input.length > 128000) process.exit(1);
});
process.stdin.on("end", () => {
  try {
    const event = JSON.parse(input);
    if (event.hook_event_name !== "PostCompact" ||
        typeof event.session_id !== "string" || !event.session_id) {
      throw new Error("Invalid compact event");
    }
    fs.rmSync(stateFile(projectRoot(), event.session_id), {force:true});
  } catch (error) {
    console.error("IROKO context invalidation error: " + error.message);
    process.exitCode = 1;
  }
});
