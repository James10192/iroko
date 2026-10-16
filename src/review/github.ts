import type { ChangedFile } from "./core.js";

export function parseRepository(value: string): { owner: string; name: string } {
  const match = /^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/.exec(value);
  if (!match || match[1] === "." || match[2] === ".") {
    throw new Error("Expected --repo owner/name");
  }
  return { owner: match[1], name: match[2] };
}
export async function fetchPullRequestFiles(
  repository: string, number: number, token?: string,
  client: typeof fetch = fetch
): Promise<{ files: ChangedFile[]; warnings: string[] }> {
  const { owner, name } = parseRepository(repository);
  if (!Number.isSafeInteger(number) || number < 1) throw new Error("--pr must be a positive integer");
  const files: ChangedFile[] = [];
  const warnings: string[] = [];
  for (let page = 1; page <= 3; page++) {
    const url = "https://api.github.com/repos/" + encodeURIComponent(owner) + "/" +
      encodeURIComponent(name) + "/pulls/" + number + "/files?per_page=100&page=" + page;
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"
    };
    if (token) headers.Authorization = "Bearer " + token;
    const response = await client(url, { headers, signal: AbortSignal.timeout(25000) });
    if (!response.ok) throw new Error("GitHub API returned HTTP " + response.status);
    const pageItems: unknown = await response.json();
    if (!Array.isArray(pageItems)) throw new Error("Unexpected GitHub files response");
    for (const entry of pageItems) {
      const file = entry as { filename?: unknown; status?: unknown; patch?: unknown };
      if (typeof file.filename !== "string") continue;
      const patch = typeof file.patch === "string" ? file.patch : null;
      if (patch === null) warnings.push("Patch unavailable for " + file.filename + " (binary/large file?)");
      files.push({ filename: file.filename, status: String(file.status ?? "modified"), patch });
    }
    if (pageItems.length < 100) break;
    if (page === 3) warnings.push("PR contains over 300 files; remainder not inspected");
  }
  if (!files.length) warnings.push("No changed files found");
  return { files, warnings };
}
