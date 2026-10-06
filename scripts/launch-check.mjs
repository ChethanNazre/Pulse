#!/usr/bin/env node
/**
 * Pre-launch gate. Run `npm run launch-check` before pointing the production domain at the site.
 * Exits 1 if anything on the launch checklist is missing.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
const check = (ok, message) => { if (!ok) failures.push(message); };

// Environment: process env first, then .env.production.local / .env.local / .env.production
const env = { ...process.env };
for (const f of [".env.production", ".env.local", ".env.production.local"]) {
  const p = join(root, f);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && m[2] && !(m[1] in process.env)) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

// 1. Custom domain
const url = env.NEXT_PUBLIC_SITE_URL ?? "";
check(/^https:\/\//.test(url), "NEXT_PUBLIC_SITE_URL must be set to your https:// production domain.");
check(!/localhost|127\.0\.0\.1|vercel\.app|netlify\.app|pages\.dev/.test(url), "NEXT_PUBLIC_SITE_URL still points at localhost or a host subdomain, not a custom domain.");

// 1b. Live content providers. A public deployment should not silently serve fictional items.
check(!!env.NEWS_API_KEY, "NEWS_API_KEY is not configured for live news content.");
check(!!env.TMDB_API_KEY, "TMDB_API_KEY is not configured for live movie content.");
check(env.USE_SAMPLE_DATA !== "true", "USE_SAMPLE_DATA must be false before launch.");

// 2. Legal details
check(!!env.NEXT_PUBLIC_SITE_OPERATOR, "NEXT_PUBLIC_SITE_OPERATOR (your name or business name) is not set.");
check(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(env.NEXT_PUBLIC_CONTACT_EMAIL ?? ""), "NEXT_PUBLIC_CONTACT_EMAIL is not set to a valid address.");

// 3. Required files
for (const f of ["src/app/icon.svg", "src/app/favicon.ico", "src/app/apple-icon.png", "src/app/privacy/page.tsx", "src/app/terms/page.tsx"]) {
  check(existsSync(join(root, f)), `Missing ${f}.`);
}

// 4. No "made with AI" style tags in shipped source or public files
const tagPattern = /(made|built|generated|created|powered)\s+(with|by)\s+(ai|claude|chatgpt|gpt|copilot|cursor|v0|lovable|bolt)|\bv0\.dev\b|\blovable\.(dev|app)\b/i;
function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|css|html|svg|json|md|txt)$/.test(name)) out.push(p);
  }
  return out;
}
for (const file of [...walk(join(root, "src")), ...walk(join(root, "public"))]) {
  if (tagPattern.test(readFileSync(file, "utf8"))) failures.push(`${file.replace(root + "/", "")} contains a "made with AI" style tag.`);
}

if (failures.length) {
  console.error("Launch check failed:\n" + failures.map((f) => `  - ${f}`).join("\n"));
  console.error("\nNot checked here: connect the custom domain in your host's dashboard and add the DNS records at your registrar.");
  process.exit(1);
}
console.log("Launch check passed. Confirm the custom domain loads over https before announcing.");
