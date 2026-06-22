const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const repoRoot = path.resolve(__dirname, '..');

function git(args) {
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function ensureDir(relPath) {
  fs.mkdirSync(path.join(repoRoot, relPath), { recursive: true });
}

function readText(relPath) {
  return fs.readFileSync(path.join(repoRoot, relPath), 'utf8');
}

function writeText(relPath, content) {
  const filePath = path.join(repoRoot, relPath);
  ensureDir(path.dirname(relPath));
  fs.writeFileSync(filePath, `${content.replace(/\r\n/g, '\n').trimEnd()}\n`, 'utf8');
}

function nowStamp() {
  return new Date().toISOString().slice(0, 10);
}

function currentBranch() {
  try {
    return git(['branch', '--show-current']) || 'detached-head';
  } catch {
    return 'unknown';
  }
}

function recentCommits(limit = 5) {
  const output = git(['log', `-n${limit}`, '--no-merges', '--pretty=format:%h%x09%s']);
  if (!output) return [];
  return output.split(/\r?\n/).filter(Boolean).map((line) => {
    const [hash, subject] = line.split('\t');
    return { hash, subject };
  });
}

function hotFiles(limit = 8, commitWindow = 5) {
  const output = git(['log', `-n${commitWindow}`, '--no-merges', '--name-only', '--pretty=format:']);
  const counts = new Map();

  for (const rawLine of output.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    counts.set(line, (counts.get(line) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([file, count]) => ({ file, count }));
}

function parseTaskRows() {
  const lines = readText('TASKS.md').split(/\r?\n/);
  const tasks = [];

  for (const line of lines) {
    if (!line.startsWith('| T-')) continue;
    const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
    if (cells.length < 4) continue;

    const [id, title, priority, tool, files, acceptance, validation] = cells;
    tasks.push({
      id,
      title,
      priority,
      tool,
      files,
      acceptance,
      validation,
      completed: /✅/.test(priority) || /✅/.test(title),
    });
  }

  return tasks;
}

function taskById(id) {
  return parseTaskRows().find((task) => task.id === id) ?? null;
}

function pendingHighPriorityTasks(limit = 5) {
  return parseTaskRows()
    .filter((task) => /Alta/i.test(task.priority) && !task.completed)
    .slice(0, limit);
}

function extractTaskIds(text) {
  return [...new Set((text.match(/T-\d+/g) ?? []))];
}

function nextPriorityTask(excludeIds = []) {
  const excluded = new Set(excludeIds);
  return parseTaskRows().find((task) => /Alta/i.test(task.priority) && !task.completed && !excluded.has(task.id)) ?? null;
}

function latestCommit() {
  const hash = git(['log', '-1', '--pretty=format:%H']);
  const subject = git(['log', '-1', '--pretty=format:%s']);
  const body = git(['log', '-1', '--pretty=format:%B']);
  const author = git(['log', '-1', '--pretty=format:%an']);
  const date = git(['log', '-1', '--pretty=format:%ad', '--date=short']);
  return { hash, subject, body, author, date };
}

function diffStat(ref = 'HEAD') {
  try {
    return git(['show', '--stat', '--oneline', '--no-renames', ref]);
  } catch {
    return '';
  }
}

function sectionBetween(text, startMarker, endMarker) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === startMarker);
  if (start === -1) return '';
  let end = lines.length;
  if (endMarker) {
    const found = lines.slice(start + 1).findIndex((line) => line.trim() === endMarker);
    if (found !== -1) end = start + 1 + found;
  }
  return lines.slice(start + 1, end).join('\n').trim();
}

function commitBodySection(body, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`^\\[${escaped}\\]\\s*$`, 'm');
  const match = body.match(regex);
  if (!match) return '';

  const start = body.slice(0, match.index).split(/\r?\n/).length - 1;
  const lines = body.split(/\r?\n/);
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^\[(What|Why|How|Next|Validate|Files|Agent)\]/.test(lines[i])) {
      end = i;
      break;
    }
  }
  return lines.slice(start + 1, end).join('\n').trim();
}

function ensureHandOffDir() {
  ensureDir(path.join('docs', 'HANDOFF'));
}

module.exports = {
  repoRoot,
  git,
  ensureDir,
  ensureHandOffDir,
  readText,
  writeText,
  nowStamp,
  currentBranch,
  recentCommits,
  hotFiles,
  parseTaskRows,
  taskById,
  pendingHighPriorityTasks,
  extractTaskIds,
  nextPriorityTask,
  latestCommit,
  diffStat,
  sectionBetween,
  commitBodySection,
};
