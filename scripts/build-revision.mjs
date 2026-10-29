import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

// CI identifies the checkout; local builds use Git. Never query the moving
// remote HEAD from the browser or expose other environment values.
export function buildRevision(env = process.env, readGit = () => execFileSync("git", ["rev-parse", "HEAD"], { cwd: new URL("..", import.meta.url), encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim()) {
  const supplied = env.CF_PAGES_COMMIT_SHA || env.GITHUB_SHA;
  try {
    const sha = (supplied || readGit()).trim();
    return /^[a-f0-9]{40}$/i.test(sha) ? sha.toLowerCase() : null;
  } catch {
    return null;
  }
}

export function siteBuildInfo(env=process.env) {
  try { const cached=JSON.parse(readFileSync(new URL('../output/build/site-build.json',import.meta.url),'utf8'));if(typeof cached.generatedAt==='string'&&Number.isFinite(Date.parse(cached.generatedAt)))return cached; } catch { /* Dev without a preceding metadata step. */ }
  return createSiteBuildInfo(env);
}
export function createSiteBuildInfo(env=process.env) {
  const commitSha=buildRevision(env);
  const generatedAt=new Date().toISOString();
  return {buildId: (commitSha || 'local') + '-' + generatedAt, generatedAt, commitSha};
}
