const {
  diffStat,
  latestCommit,
  nextPriorityTask,
  ensureHandOffDir,
  writeText,
  nowStamp,
  commitBodySection,
  sectionBetween,
  readText,
  currentBranch,
  extractTaskIds,
  taskById,
} = require('./workflow-utils');

ensureHandOffDir();

const commit = latestCommit();
const stat = diffStat('HEAD');
const branchTaskIds = extractTaskIds(currentBranch());
const commitTaskIds = extractTaskIds(commit.subject);
const completedTaskIds = [...new Set([...branchTaskIds, ...commitTaskIds])];
const nextTask = nextPriorityTask(completedTaskIds);
const projectStatus = readText('PROJECT_STATUS.md');
const risks = sectionBetween(projectStatus, '## Riesgos activos', '## Próximos pasos inmediatos') || '- Sin riesgos listados.';
const what = commitBodySection(commit.body, 'What') || '(No se encontró [What] en el commit)';
const why = commitBodySection(commit.body, 'Why') || '(No se encontró [Why] en el commit)';
const validate = commitBodySection(commit.body, 'Validate') || '(No se encontró [Validate] en el commit)';
const files = commitBodySection(commit.body, 'Files') || '(No se encontró [Files] en el commit)';
const next = commitBodySection(commit.body, 'Next') || (nextTask ? `${nextTask.id} — ${nextTask.title}` : 'Sin próxima tarea prioritaria encontrada');

const content = [
  `# Git Handoff — ${nowStamp()}`,
  '',
  '## Último commit',
  `- **Hash:** \`${commit.hash}\``,
  `- **Asunto:** ${commit.subject}`,
  `- **Autor:** ${commit.author}`,
  `- **Fecha:** ${commit.date}`,
  '',
  '## Resumen del cambio',
  '### What',
  what,
  '',
  '### Why',
  why,
  '',
  '## Validación',
  validate,
  '',
  '## Diff stats',
  '```',
  stat || '(no diff stat available)',
  '```',
  '',
  '## Tareas actualizadas',
  ...(completedTaskIds.length
    ? completedTaskIds.map((id) => {
        const task = taskById(id);
        return `- ✅ ${id}${task ? ` — ${task.title}` : ''}`;
      })
    : ['- 🔜 Sin tarea identificable en branch/commit']),
  '',
  '## Próxima acción prioritaria',
  next,
  '',
  '## Riesgos vigentes',
  risks,
  '',
  '## Archivos clave del commit',
  files,
  '',
  '---',
  '*Generado automáticamente por scripts/git-handoff.js*',
  '',
].join('\n');

writeText('docs/HANDOFF/GIT_HANDOFF.md', content);
console.log('Wrote docs/HANDOFF/GIT_HANDOFF.md');
