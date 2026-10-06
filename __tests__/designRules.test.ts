import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Enforces the project's standing design rules so they can't regress silently.
 * Banned characters are built from code points so this file passes its own checks.
 */
const root = join(__dirname, "..");
const EM_DASH = String.fromCharCode(0x2014);

function walk(dir: string, exts: RegExp, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next") continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, exts, out);
    else if (exts.test(name)) out.push(p);
  }
  return out;
}

const sourceFiles = [
  ...walk(join(root, "src"), /\.(tsx?|css|svg)$/),
  ...walk(join(root, "e2e"), /\.ts$/),
  ...walk(join(root, "__tests__"), /\.tsx?$/),
  ...walk(join(root, "scripts"), /\.mjs$/),
  join(root, "README.md"),
  join(root, ".env.example"),
];
const uiFiles = walk(join(root, "src"), /\.(tsx?|css|svg)$/);
const read = (f: string) => readFileSync(f, "utf8");
const offenders = (files: string[], test: (text: string) => boolean) => files.filter((f) => test(read(f))).map((f) => f.replace(root + "/", ""));

describe("design rules", () => {
  it("uses no em dashes anywhere", () => {
    expect(offenders(sourceFiles, (t) => t.includes(EM_DASH))).toEqual([]);
  });

  it("keeps reduced-motion support in the global styles", () => {
    expect(read(join(root, "src/app/globals.css"))).toContain("prefers-reduced-motion: reduce");
  });

  it("uses no emoji or dingbat symbols as icons", () => {
    const hasSymbol = (text: string) =>
      Array.from(text).some((ch) => {
        const c = ch.codePointAt(0)!;
        return (c >= 0x2600 && c <= 0x27bf) || c === 0x25b2 || c === 0x25bc || /\p{Extended_Pictographic}/u.test(ch);
      });
    expect(offenders([...uiFiles, join(root, "README.md")], hasSymbol)).toEqual([]);
  });

  it("has no hover rule that changes a button or card fill", () => {
    expect(offenders(uiFiles, (t) => /hover:bg-|hover:brightness|hover:opacity/.test(t))).toEqual([]);
  });

  it("has no fake reviews, ratings, counters or testimonials", () => {
    const pattern = /testimonial|trusted by|happy customers|\bcustomers\b|\d+\s*(k|m)?\+?\s*(users|downloads|members)|rated \d|stars?\b|reviews?\b/i;
    expect(offenders(uiFiles, (t) => pattern.test(t))).toEqual([]);
  });

  it("has no cursor-follow or scroll-triggered animation", () => {
    expect(offenders(uiFiles, (t) => /useScroll|whileInView|useInView|mousemove|pointermove|onMouseMove/.test(t))).toEqual([]);
  });

  it("has no 'made with AI' style tag", () => {
    const tag = /(made|built|generated|created|powered)\s+(with|by)\s+(ai|claude|chatgpt|gpt|copilot|cursor|v0|lovable|bolt)/i;
    expect(offenders(uiFiles, (t) => tag.test(t))).toEqual([]);
  });
});

describe("launch checklist files", () => {
  it.each([
    "src/app/icon.svg",
    "src/app/favicon.ico",
    "src/app/apple-icon.png",
    "src/app/privacy/page.tsx",
    "src/app/terms/page.tsx",
    "scripts/launch-check.mjs",
  ])("includes %s", (file) => {
    expect(existsSync(join(root, file))).toBe(true);
  });

  it("links to the privacy and terms pages from the footer", () => {
    const footer = read(join(root, "src/components/SiteFooter.tsx"));
    expect(footer).toContain('href="/privacy"');
    expect(footer).toContain('href="/terms"');
  });
});
