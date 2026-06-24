#!/usr/bin/env node
/**
 * Git Handoff — Genera docs/HANDOFF/GIT_HANDOFF.md después de push.
 * Este es el puente principal para que OpenCode continúe el trabajo.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function run(cmd) {
  try {
    return execSync(cmd, { encoding: "utf-8" }).trim();
  } catch {
    return "";
  }
}

function now() {
  return new Date().toISOString();
}

function extractCommitInfo() {
  const hash = run("git log -1 --pretty=format:%h");
  const subject = run("git log -1 --pretty=format:%s");
  const body = run("git log -1 --pretty=format:%b");
  const author = run("git log -1 --pretty=format:%an");
  const date = run("git log -1 --pretty=format:%ad --date=short");

  const what = (body.match(/\[What\]([\s\S]*?)(?=\[Why\]|\[How\]|\[Next\]|\[Validate\]|\[Files\]|\[Agent\]|$)/) || ["", ""])[1].trim();
  const why = (body.match(/\[Why\]([\s\S]*?)(?=\[What\]|\[How\]|\[Next\]|\[Validate\]|\[Files\]|\[Agent\]|$)/) || ["", ""])[1].trim();
  const next = (body.match(/\[Next\]([\s\S]*?)(?=\[What\]|\[Why\]|\[How\]|\[Validate\]|\[Files\]|\[Agent\]|$)/) || ["", ""])[1].trim();
  const validate = (body.match(/\[Validate\]([\s\S]*?)(?=\[What\]|\[Why\]|\[How\]|\[Next\]|\[Files\]|\[Agent\]|$)/) || ["", ""])[1].trim();
  const files = (body.match(/\[Files\]([\s\S]*?)(?=\[What\]|\[Why\]|\[How\]|\[Next\]|\[Validate\]|\[Agent\]|$)/) || ["", ""])[1].trim();
  const agent = (body.match(/\[Agent\]([\s\S]*?)(?=\[What\]|\[Why\]|\[How\]|\[Next\]|\[Validate\]|\[Files\]|$)/) || ["", ""])[1].trim() || author;

  return { hash, subject, body, author, date, what, why, next, validate, files, agent };
}

function getDiffStats() {
  const stat = run("git diff HEAD~1 --stat");
  return stat;
}

function getTaskState() {
  try {
    const tasks = fs.readFileSync(path.join(process.cwd(), "TASKS.md"), "utf-8");
    const completed = [];
    const pending = [];
    const lines = tasks.split("\n");
    for (const line of lines) {
      const match = line.match(/^(.*)(T-\d+)(.*)$/);
      if (match) {
        if (line.includes("✅")) {
          completed.push(match[2]);
        } else if (line.includes("🔜") || line.includes("Alta") || line.includes("Media")) {
          pending.push(match[2]);
        }
      }
    }
    return { completed: [...new Set(completed)], pending: [...new Set(pending)] };
  } catch {
    return { completed: [], pending: [] };
  }
}

function getNextTask(pending) {
  if (pending.length === 0) return "Ninguna pendiente. Revisar ROADMAP.md para nueva fase.";
  try {
    const tasks = fs.readFileSync(path.join(process.cwd(), "TASKS.md"), "utf-8");
    for (const line of tasks.split("\n")) {
      for (const t of pending) {
        if (line.includes(t) && line.includes("Alta")) {
          const title = line.split("|").map(s => s.trim())[1] || "";
          return `${t} — ${title}`;
        }
      }
    }
    return `${pending[0]} — (ver TASKS.md para detalle)`;
  } catch {
    return pending[0] || "Desconocida";
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
  const info = extractCommitInfo();
  const stats = getDiffStats();
  const taskState = getTaskState();
  const nextTask = getNextTask(taskState.pending);
  const risks = getRisks();

  const lines = [
    `# Git Handoff — ${now().split("T")[0]}`,
    "",
    "## Último commit",
    `- **Hash:** \`${info.hash}\``,
    `- **Asunto:** ${info.subject}`,
    `- **Autor:** ${info.agent} (git: ${info.author})`,
    `- **Fecha:** ${info.date}`,
    "",
    "## Resumen del cambio",
    "### What",
    info.what || "*(No se encontró [What] en el commit)*",
    "",
    "### Why",
    info.why || "*(No se encontró [Why] en el commit)*",
    "",
    "## Validación",
    info.validate || "*(No se encontró [Validate] en el commit)*",
    "",
    "## Diff stats",
    "```",
    stats || "Sin diff disponible",
    "```",
    "",
    "## Tareas actualizadas",
    ...taskState.completed.map(t => `- ✅ ${t}`),
    ...taskState.pending.map(t => `- 🔜 ${t}`),
    "",
    "## Próxima acción prioritaria",
    nextTask,
    "",
    "## Riesgos vigentes",
    ...risks.map(r => `- ${r}`),
    "",
    "## Archivos clave del commit",
    info.files || "*(No se encontró [Files] en el commit)*",
    "",
    "---",
    "*Generado automáticamente por scripts/git-handoff.js*",
    "",
    "## Prompt de entrada para OpenCode",
    "```",
    "Lee AGENTS.md, PROJECT_STATUS.md, ROADMAP.md, TASKS.md,",
    "docs/OPENCODE_HANDOFF.md y docs/HANDOFF/GIT_HANDOFF.md.",
    "Continuá con la tarea indicada como 'Próxima acción prioritaria'.",
    "Validá con npm run build && npm run typecheck antes de commit.",
    "```",
  ];

  const outPath = path.join(process.cwd(), "docs", "HANDOFF", "GIT_HANDOFF.md");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, lines.join("\n"), "utf-8");
  console.log("✅ Git Handoff generado:", outPath);
}

generate();
