#!/usr/bin/env node
/**
 * Vibe Review — Auto-revisión antes de push.
 * Genera docs/HANDOFF/VIBE_REVIEW.md con checklist de calidad.
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

function lastCommitHasGCP() {
  const body = run("git log -1 --pretty=format:%B");
  return body.includes("[What]") && body.includes("[Why]") && body.includes("[Validate]");
}

function getLastCommitDiff() {
  const stat = run("git diff HEAD~1 --stat");
  return stat || "(primer commit o sin diff disponible)";
}

function checkAccessibility() {
  const diff = run("git diff HEAD~1 --name-only");
  const files = diff.split("\n").filter(f => f.endsWith(".tsx") || f.endsWith(".ts"));
  const issues = [];
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, "utf-8");
      if (content.includes("<img") && !content.includes("alt=")) {
        issues.push(`- \`${file}\`: <img> sin alt`);
      }
      if (content.includes("onClick") && !content.includes("role=") && !content.includes("button")) {
        issues.push(`- \`${file}\`: onClick sin role (accesibilidad)`);
      }
      if (content.includes("className") && content.includes("text-") && !content.includes("dark:text-")) {
        // Solo advertencia, no obligatorio
      }
    } catch {}
  }
  return issues;
}

function checkBuildPassing() {
  try {
    execSync("npm run build", { stdio: "pipe", encoding: "utf-8" });
    return "✅ Build pasa";
  } catch (e) {
    return "❌ Build falla: " + (e.stderr || e.message).slice(0, 200);
  }
}

function checkTypecheck() {
  try {
    execSync("npm run typecheck", { stdio: "pipe", encoding: "utf-8" });
    return "✅ Typecheck pasa";
  } catch (e) {
    return "❌ Typecheck falla: " + (e.stderr || e.message).slice(0, 200);
  }
}

function generate() {
  const gcpOk = lastCommitHasGCP();
  const diffStat = getLastCommitDiff();
  const a11yIssues = checkAccessibility();
  const buildStatus = checkBuildPassing();
  const typeStatus = checkTypecheck();

  const lines = [
    `# Vibe Review — ${now().split("T")[0]}`,
    "",
    "## Commit GCP",
    gcpOk ? "✅ Commit tiene [What], [Why], [Validate]" : "❌ Commit NO sigue Git Context Protocol. Agregalo antes de push.",
    "",
    "## Diff resumen",
    "```",
    diffStat,
    "```",
    "",
    "## Validación técnica",
    `- ${buildStatus}`,
    `- ${typeStatus}`,
    "",
    "## Checklist de calidad",
    `- [${gcpOk ? "x" : " "}] Commit sigue GCP`,
    `- [${a11yIssues.length === 0 ? "x" : " "}] Accesibilidad básica (img alt, roles)`,
    `- [ ] Consistencia visual con Design System`,
    `- [ ] No se duplicó memoria de Engram`,
    `- [ ] TASKS.md sincronizado`,
    "",
    "## Hallazgos de accesibilidad",
    ...(a11yIssues.length > 0 ? a11yIssues : ["Ninguno detectado."]),
    "",
    "## Preguntas abiertas",
    "- ¿Este cambio necesita actualizar ROADMAP.md o PROJECT_STATUS.md?",
    "- ¿Hay algún archivo nuevo que no esté registrado en el commit?",
    "- ¿El cambio afecta la experiencia del usuario final y requiere smoke test?",
    "",
    "---",
    "*Generado automáticamente por scripts/vibe-review.js*",
  ];

  const outPath = path.join(process.cwd(), "docs", "HANDOFF", "VIBE_REVIEW.md");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, lines.join("\n"), "utf-8");
  console.log("✅ Vibe Review generado:", outPath);
}

generate();
