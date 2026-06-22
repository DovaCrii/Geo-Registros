const { diffStat, latestCommit, ensureHandOffDir, writeText, nowStamp } = require('./workflow-utils');

ensureHandOffDir();

const commit = latestCommit();
const stat = diffStat('HEAD');
const subject = commit.subject || '(unknown)';

const content = [
  `# Vibe Review — ${nowStamp()}`,
  '',
  '## Latest commit',
  `- ${commit.hash} ${subject}`,
  '',
  '## Diff stat',
  '```',
  stat || '(no diff stat available)',
  '```',
  '',
  '## Checklist',
  '- [ ] Build and typecheck pass',
  '- [ ] UI remains coherent with current system tokens',
  '- [ ] No debug artifacts or stray logs',
  '- [ ] The change is small enough to review quickly',
  '',
  '## Open questions',
  '- Is the change aligned with the next prioritized task?',
  '- Does the change introduce any extra maintenance surface?',
  '- Is any follow-up documentation needed?',
  '',
].join('\n');

writeText('docs/HANDOFF/VIBE_REVIEW.md', content);
console.log('Wrote docs/HANDOFF/VIBE_REVIEW.md');
