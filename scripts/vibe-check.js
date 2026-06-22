const { currentBranch, recentCommits, hotFiles, pendingHighPriorityTasks, ensureHandOffDir, writeText, nowStamp } = require('./workflow-utils');

ensureHandOffDir();

const branch = currentBranch();
const commits = recentCommits(5);
const hot = hotFiles(8, 5);
const tasks = pendingHighPriorityTasks(5);

const content = [
  `# Vibe Check — ${nowStamp()}`,
  '',
  '## Branch',
  `- ${branch}`,
  '',
  '## Recent commits',
  ...(commits.length ? commits.map((commit) => `- ${commit.hash} ${commit.subject}`) : ['- No recent commits found.']),
  '',
  '## Hot files',
  ...(hot.length ? hot.map((item) => `- ${item.file} (${item.count})`) : ['- No hot files detected.']),
  '',
  '## Pending high-priority tasks',
  ...(tasks.length
    ? tasks.map((task) => `- ${task.id} — ${task.title} (${task.priority.replace(/✅/g, '').trim()})`)
    : ['- No pending high-priority tasks found.']),
  '',
].join('\n');

writeText('docs/HANDOFF/VIBE_CHECK.md', content);
console.log('Wrote docs/HANDOFF/VIBE_CHECK.md');
