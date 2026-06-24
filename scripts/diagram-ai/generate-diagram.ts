import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

type DiagramResponse = {
  title: string;
  diagramType: string;
  fileName: string;
  mermaid: string;
  explanation: string;
};

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..', '..');

const ollamaUrl = process.env.OLLAMA_URL ?? 'http://localhost:11434/api/chat';
const model = process.env.DIAGRAM_MODEL ?? 'qwen2.5-coder:7b';

async function main() {
  const prompt = process.argv.slice(2).join(' ').trim();

  if (!prompt) {
    console.error('Usage: pnpm diagram:ai "your prompt"');
    process.exit(1);
  }

  const context = await gatherContext();
  const result = await generateDiagram(prompt, context);

  const safeFileName = sanitizeFileName(result.fileName || slugify(result.title));
  if (!safeFileName) {
    throw new Error('Could not derive a valid file name from the model response.');
  }

  const diagramsDir = path.join(projectRoot, 'diagrams');
  const docsDir = path.join(projectRoot, 'docs', 'diagrams');
  await mkdir(diagramsDir, { recursive: true });
  await mkdir(docsDir, { recursive: true });

  const mmdPath = path.join(diagramsDir, `${safeFileName}.mmd`);
  const mdPath = path.join(docsDir, `${safeFileName}.md`);
  const svgPath = path.join(diagramsDir, `${safeFileName}.svg`);

  await writeFile(mmdPath, `${result.mermaid.trim()}\n`, 'utf8');
  const svgGenerated = await tryGenerateSvg(mmdPath, svgPath);
  await writeFile(mdPath, buildMarkdownDoc(result, mmdPath, svgPath, svgGenerated), 'utf8');

  console.log([
    'Diagram generated successfully.',
    `Title: ${result.title}`,
    `Type: ${result.diagramType}`,
    `Mermaid: ${mmdPath}`,
    `Doc: ${mdPath}`,
    svgGenerated ? `SVG: ${svgPath}` : 'SVG: skipped or unavailable',
  ].join('\n'));
}

async function gatherContext() {
  const files = [
    'README.md',
    'package.json',
    path.join('prisma', 'schema.prisma'),
  ];

  const chunks: string[] = [];

  for (const relative of files) {
    const absolute = path.join(projectRoot, relative);
    if (existsSync(absolute)) {
      chunks.push(`### ${relative}\n${await readFile(absolute, 'utf8')}`);
    }
  }

  const docsDir = path.join(projectRoot, 'docs');
  if (existsSync(docsDir)) {
    const docFiles = await listMarkdownFiles(docsDir, 10);
    for (const absolute of docFiles) {
      const relative = path.relative(projectRoot, absolute);
      const content = await readFile(absolute, 'utf8');
      chunks.push(`### ${relative}\n${content}`);
    }
  }

  return chunks.join('\n\n').slice(0, 40000);
}

async function listMarkdownFiles(dir: string, limit: number): Promise<string[]> {
  const results: string[] = [];
  const queue = [dir];

  while (queue.length > 0 && results.length < limit) {
    const current = queue.shift();
    if (!current) continue;

    const entries = await import('node:fs/promises').then((m) => m.readdir(current, { withFileTypes: true }));
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'diagrams') continue;
        queue.push(full);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
        results.push(full);
        if (results.length >= limit) break;
      }
    }
  }

  return results;
}

async function generateDiagram(prompt: string, context: string): Promise<DiagramResponse> {
  const response = await fetch(ollamaUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: false,
      format: 'json',
      options: {
        temperature: 0.2,
      },
      messages: [
        {
          role: 'system',
          content: [
            'You are a senior technical architect and documentation writer.',
            'Return ONLY valid JSON with exactly these keys:',
            'title, diagramType, fileName, mermaid, explanation.',
            'The mermaid field must contain a complete Mermaid diagram.',
            'Prefer diagrams that are grounded in the provided project context.',
            'If the request references planned work, label it as planned in the explanation or labels.',
            'Use concise, professional English.',
          ].join(' '),
        },
        {
          role: 'user',
          content: [
            `User request:\n${prompt}`,
            'Project context:',
            context || '(no additional context found)',
            'Remember: output JSON only, no markdown fences.',
          ].join('\n\n'),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed: ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as { message?: { content?: string } };
  const raw = payload.message?.content?.trim();
  if (!raw) {
    throw new Error('Ollama returned an empty response.');
  }

  const parsed = safeJsonParse(raw);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`Could not parse Ollama JSON response. Raw response: ${raw}`);
  }

  const result = parsed as Partial<DiagramResponse>;
  if (!result.mermaid || typeof result.mermaid !== 'string' || !result.mermaid.trim()) {
    throw new Error('Model response is missing a valid mermaid field.');
  }

  return {
    title: String(result.title ?? 'Untitled diagram'),
    diagramType: String(result.diagramType ?? 'diagram'),
    fileName: String(result.fileName ?? slugify(String(result.title ?? 'diagram'))),
    mermaid: result.mermaid,
    explanation: String(result.explanation ?? ''),
  };
}

function safeJsonParse(raw: string): unknown {
  try {
    return JSON.parse(stripCodeFences(raw));
  } catch {
    const first = raw.indexOf('{');
    const last = raw.lastIndexOf('}');
    if (first >= 0 && last > first) {
      return JSON.parse(raw.slice(first, last + 1));
    }
    throw new Error('Invalid JSON response from Ollama.');
  }
}

function stripCodeFences(raw: string) {
  return raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
}

function sanitizeFileName(value: string) {
  const cleaned = slugify(value)
    .replace(/-(mmd|mermaid|diagram|graph)$/, '')
    .replace(/^-+|-+$/g, '');
  return cleaned.slice(0, 80);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildMarkdownDoc(result: DiagramResponse, mmdPath: string, svgPath: string, svgGenerated: boolean) {
  return [
    `# ${result.title}`,
    '',
    `- Diagram type: ${result.diagramType}`,
    `- Mermaid file: \`${path.relative(projectRoot, mmdPath)}\``,
    `- SVG: ${svgGenerated ? `\`${path.relative(projectRoot, svgPath)}\`` : 'not generated'}`,
    '',
    '## Explanation',
    '',
    result.explanation || '_No explanation provided by the model._',
    '',
    '## Mermaid',
    '',
    '```mermaid',
    result.mermaid.trim(),
    '```',
    '',
  ].join('\n');
}

async function tryGenerateSvg(mmdPath: string, svgPath: string) {
  const localBin = process.platform === 'win32'
    ? path.join(projectRoot, 'node_modules', '.bin', 'mmdc.cmd')
    : path.join(projectRoot, 'node_modules', '.bin', 'mmdc');

  if (!existsSync(localBin)) {
    console.warn('SVG skipped: mermaid-cli binary not found.');
    return false;
  }

  const command = process.platform === 'win32' ? 'cmd.exe' : localBin;
  const args = process.platform === 'win32'
    ? ['/d', '/s', '/c', localBin, '-i', mmdPath, '-o', svgPath]
    : ['-i', mmdPath, '-o', svgPath];

  const result = spawnSync(command, args, {
    cwd: projectRoot,
    encoding: 'utf8',
    shell: false,
  });

  if (result.status !== 0 || result.error) {
    const reason = result.error?.message || result.stderr || `exit code ${result.status ?? 'unknown'}`;
    console.warn(`SVG skipped: mermaid-cli failed (${reason}).`);
    return false;
  }

  return existsSync(svgPath);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
