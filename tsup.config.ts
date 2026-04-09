import { defineConfig } from "tsup";

export default defineConfig({
  entry: { cli: "src/cli.ts", postinstall: "src/postinstall.ts" },
  format: ["esm"],
  target: "node18",
  clean: true,
  minify: true,
  banner: { js: "#!/usr/bin/env node" },
});
