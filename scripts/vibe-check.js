#!/usr/bin/env node
/**
 * Vibe Check — Estado de entrada para cualquier sesión de trabajo.
 * Genera docs/HANDOFF/VIBE_CHECK.md con contexto vivo del repo.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: "utf-8", cwd: opts.cwd || process.cwd(), ...opts }).trim();
  } catch {
    return "";
  }
}

function now() {
  return new Date().toISOString();
}

function getRecentCommits(n = 5) {
  const log = run(`git log --oneline -${n} --format="%h|%s|%an|%ad" --date=short`);
  return log.split("\n").filter(Boolean).map(line => {
    const [hash, ...rest] = line.split("|");
    const author = rest[rest.length - 2] || "";
    const date = rest[rest.length - 1] || "";
    const subject = rest.slice(0, rest.length - 2).join("|");
    return { hash: hash.trim(), subject: subject.trim(), author: author.trim(), date: date.trim() };
  });
}

function getBranches() {
  const branches = run("git branch -a");
  const current = run("git branch --show-current");
  return { current, list: branches.split("\n").filter(Boolean).map(b => b.replace(/^\*?\s+/, "")) };
}

function getHotFiles(days = 7, limit = 10) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const stats = run(`git log --since=${since} --pretty=format: --name-only | sort | uniq -c | sort -rg | head -${limit}`);
  return stats.split("\n").filter(Boolean).map(line => {
    const parts = line.trim().split(/\s+/);
    const count = parts.shift();
    const file = parts.join(" ");
    return { count: parseInt(count, 10), file };
  }).filter(x => x.file && !x.file.includes("package-lock"));
}

function getPendingTasks() {
  try {
    const tasks = fs.readFileSync(path.join(process.cwd(), "TASKS.md"), "utf-8");
    const lines = tasks.split("\n");
    const pending = [];
    for (const line of lines) {
      const match = line.match(/^\| (T-\d+) \| (.+?) \| (Alta\|Media\|Baja)/);
      if (match && !line.includes("✅")) {
        pending.push({ id: match[1], title: match[2].trim(), priority: match[3] });
      }
    }
    return pending.slice(0, 8);
  } catch {
    return [];
  }
}

function getRisks() {
  try {
    const status = fs.readFileSync(path.join(process.cwd(), "PROJECT_STATUS.md"), "utf-8");
    const section = status.match(/## Riesgos activos([\s\S]*?)(?=##|$)/);
    if (!section) return [];
    return section[1]
      .split("\n")
      .filter(l => l.trim().startsWith("- "))
      .map(l => l.trim().replace(/^- /, ""))
      .slice(0, 5);
  } catch {
    return [];
  }
}

function generate() {
  const branches = getBranches();
  const commits = getRecentCommits(5);
  const hotFiles = getHotFiles(7, 10);
  const pendingTasks = getPendingTasks();
  const risks = getRisks();

  const lines = [
    `# Vibe Check — ${now().split("T")[0]}`,
    "",
    "## Branch actual",
    `- **Activa:** \`${branches.current}\``,
    "- **Disponibles:**",
    ...branches.list.map(b => `  - \`${b}\``),
    "",
    "## Últimos commits",
    ...commits.map(c => `- \`${c.hash}\` (${c.date}) — ${c.subject} — *${c.author}*`),
    "",
    "## Archivos calientes (últimos 7 días)",
    ...hotFiles.map(f => `- \`${f.file}\` — ${f.count} cambios`),
    "",
    "## Tareas pendientes (prioridad)",
    ...pendingTasks.map(t => `- **${t.id}** — ${t.title} (${t.priority})`),
    "",
    "## Riesgos activos",
    ...risks.map(r => `- ${r}`),
    "",
    "---",
    "*Generado automáticamente por scripts/vibe-check.js*",
  ];

  const outPath = path.join(process.cwd(), "docs", "HANDOFF", "VIBE_CHECK.md");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, lines.join("\n"), "utf-8");
  console.log("✅ Vibe Check generado:", outPath);
}

generate();
