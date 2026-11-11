import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const defaultTargets = [
  "src",
  "tests",
  "scripts",
  "vite.config.ts",
  "vitest.config.ts",
];
const skipExact = new Set(["src/routeTree.gen.ts"]);
const skipDirs = ["src/components/ui/"];
const keepInSkippedDirs = new Set(["src/components/ui/color-picker.tsx"]);

function isSkipped(file) {
  const rel = file.replace(/^\.\//, "");
  if (skipExact.has(rel)) return true;
  if (keepInSkippedDirs.has(rel)) return false;
  return skipDirs.some((dir) => rel.startsWith(dir));
}

function walk(entry, out) {
  const stat = fs.statSync(entry);
  if (stat.isDirectory()) {
    for (const name of fs.readdirSync(entry)) walk(path.join(entry, name), out);
  } else if (/\.(ts|tsx|mjs)$/.test(entry) && !isSkipped(entry)) {
    out.push(entry);
  }
}

function groupOf(source) {
  if (source.startsWith("@/components/")) return 2;
  if (/^(@\/|\.\.?\/|#\/)/.test(source)) return 1;
  return 0;
}

const prefixLine = /^(["']use [a-z-]+["'];?|\/\/\/.*|\/\/.*|\/\*.*\*\/)\s*$/;
const statementEnd = /["'][^"']*["'];?\s*$/;

function parse(text) {
  const lines = text.split("\n");
  let i = 0;
  const prefix = [];
  while (
    i < lines.length &&
    (lines[i].trim() === "" || prefixLine.test(lines[i]))
  ) {
    prefix.push(lines[i]);
    i++;
  }
  const statements = [];
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") {
      i++;
      continue;
    }
    if (!line.startsWith("import ")) break;
    let j = i;
    let stmt = lines[j];
    while (!statementEnd.test(stmt)) {
      j++;
      if (j >= lines.length) return null;
      stmt += `\n${lines[j]}`;
    }
    const match = stmt.match(/["']([^"']+)["'];?\s*$/);
    if (!match) return null;
    statements.push({
      text: stmt,
      source: match[1],
      sideEffect: /^import\s+["']/.test(stmt),
      order: statements.length,
    });
    i = j + 1;
  }
  return { prefix, statements, rest: lines.slice(i).join("\n") };
}

function render(statements) {
  const groups = [[], [], []];
  for (const statement of statements)
    groups[groupOf(statement.source)].push(statement);
  const rendered = [];
  for (const group of groups) {
    if (!group.length) continue;
    const regular = group
      .filter((s) => !s.sideEffect)
      .sort((a, b) => {
        const la = a.text.replace(/\s+/g, " ").length;
        const lb = b.text.replace(/\s+/g, " ").length;
        return la - lb || a.text.localeCompare(b.text);
      });
    const sideEffects = group
      .filter((s) => s.sideEffect)
      .sort((a, b) => a.order - b.order);
    rendered.push([...regular, ...sideEffects].map((s) => s.text).join("\n"));
  }
  return rendered.join("\n\n");
}

export function sortImportBlock(text) {
  const parsed = parse(text);
  if (!parsed || !parsed.statements.length) return text;
  const prefix = parsed.prefix
    .filter((line, index, all) => line.trim() !== "" || index < all.length)
    .join("\n");
  const prefixText = parsed.prefix.length
    ? `${prefix.replace(/\n+$/, "")}\n`
    : "";
  const imports = render(parsed.statements);
  const rest = parsed.rest.replace(/^\n+/, "");
  if (rest.trim() === "") return `${prefixText}${imports}\n`;
  return `${prefixText}${imports}\n\n${rest}`;
}

function main() {
  const check = process.argv.includes("--check");
  const roots = process.argv.filter((a) => !a.startsWith("--")).slice(2);
  const files = [];
  for (const target of roots.length ? roots : defaultTargets) {
    if (fs.existsSync(target)) walk(target, files);
  }

  let changed = 0;
  for (const file of files) {
    const original = fs.readFileSync(file, "utf8");
    const next = sortImportBlock(original);
    if (next !== original) {
      changed++;
      if (check) console.log(`imports out of order: ${file}`);
      else fs.writeFileSync(file, next);
    }
  }

  if (check && changed) {
    console.error(`${changed} file(s) need \`pnpm imports:fix\``);
    process.exit(1);
  }
  console.log(
    check ? "imports ordered" : `imports fixed in ${changed} file(s)`,
  );
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main();
}
