import { defineConfig } from "tsup";

export default defineConfig({
  entry: { cli: "src/cli.ts" },
  format: ["esm"],
  target: "node20",
  clean: true,
  minify: true,
  banner: { js: "#!/usr/bin/env node" },
});
