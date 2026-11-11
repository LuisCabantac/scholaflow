import fs from "node:fs";
import path from "node:path";

const check = process.argv.includes("--check");
const roots = process.argv.filter((a) => !a.startsWith("--")).slice(2);
const targets = roots.length
  ? roots
  : ["src", "tests", "scripts", "vite.config.ts", "vitest.config.ts"];
const skip = new Set(["src/routeTree.gen.ts"]);

function walk(entry, out) {
  const stat = fs.statSync(entry);
  if (stat.isDirectory()) {
    for (const name of fs.readdirSync(entry)) walk(path.join(entry, name), out);
  } else if (
    /\.(ts|tsx|mjs)$/.test(entry) &&
    !skip.has(entry.replace(/^\.\//, ""))
  ) {
    out.push(entry);
  }
}

function groupOf(source) {
  if (source.startsWith("@/components/")) return 2;
  if (
    source.startsWith("@/") ||
    source.startsWith("./") ||
    source.startsWith("../") ||
    source.startsWith("#/")
  )
    return 1;
  return 0;
}

function parseImports(text) {
  const lines = text.split("\n");
  const statements = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") {
      i++;
      continue;
    }
    if (!line.startsWith("import ")) break;
    let j = i;
    let stmt = lines[j];
    while (
      !/\bfrom\s+["'][^"']+["'];?\s*$/.test(stmt) &&
      !/^import\s+["'][^"']+["'];?\s*$/.test(stmt) &&
      !/^import\s+type\s+\{[^}]*\}\s+from/.test(stmt.replace(/\n/g, " "))
    ) {
      j++;
      if (j >= lines.length) return null;
      stmt += `\n${lines[j]}`;
      if (/["'];?\s*$/.test(lines[j])) break;
    }
    const m = stmt.match(/["']([^"']+)["'];?\s*$/);
    if (!m) return null;
    statements.push({ text: stmt, source: m[1] });
    i = j + 1;
  }
  return {
    statements,
    rest: lines.slice(i).join("\n"),
    hadImports: statements.length > 0,
  };
}

function render(statements) {
  const groups = [[], [], []];
  for (const s of statements) groups[groupOf(s.source)].push(s);
  for (const g of groups) {
    g.sort((a, b) => {
      const la = a.text.replace(/\s+/g, " ").length;
      const lb = b.text.replace(/\s+/g, " ").length;
      return la - lb || a.text.localeCompare(b.text);
    });
  }
  return groups
    .filter((g) => g.length)
    .map((g) => g.map((s) => s.text).join("\n"))
    .join("\n\n");
}

const files = [];
for (const t of targets) if (fs.existsSync(t)) walk(t, files);

let changed = 0;
for (const file of files) {
  const original = fs.readFileSync(file, "utf8");
  const parsed = parseImports(original);
  if (!parsed || !parsed.hadImports) continue;
  const rest = parsed.rest.replace(/^\n+/, "");
  const next = `${render(parsed.statements)}\n\n${rest}`;
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
console.log(check ? "imports ordered" : `imports fixed in ${changed} file(s)`);
