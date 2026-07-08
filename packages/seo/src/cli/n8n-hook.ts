import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function writeEnvHook(destination: string) {
  const envPath = path.resolve(destination);
  const content = generateEnvDocument();
  fs.mkdirSync(path.dirname(envPath), { recursive: true });
  fs.writeFileSync(envPath, `${content}\n`, 'utf8');
  return envPath;
}

export function loadEnvSchema(envPath: string): Record<string, string> {
  if (!fs.existsSync(envPath)) return {};
  const raw = fs.readFileSync(envPath, 'utf8');
  const schema: Record<string, string> = {};

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    schema[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }

  return schema;
}

export function generateN8nHook(envPath: string) {
  const env = loadEnvSchema(envPath);
  const workingDir =
    env.SEO_WORKDIR ?? process.cwd();

  return `[
  {
    "id": "seo-coverage",
    "name": "SEO schema coverage",
    "type": "hook",
    "enabled": true,
    "hooks": {
      "postRun": "cd '${workingDir}' && node packages/seo/src/cli/coverage.mjs --routes packages/seo/src/cli/coverage.json"
    }
  }
]
`;
}

function generateEnvDocument() {
  return `# landmap seo
SEO_WORKDIR=
SEO_COVERAGE_ROUTES=packages/seo/src/cli/coverage.json
SEO_COVERAGE_OUTPUT=coverage.md
SEO_N8N_HOOK=n8n-hook.json
`;
}
