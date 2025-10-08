import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve('src');

const VALID_EXTENSIONS = new Set(['.js', '.ts', '.svelte']);

/**
 * Recursively collects files with valid extensions within a directory.
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function collectFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return collectFiles(entryPath);
      }
      if (VALID_EXTENSIONS.has(path.extname(entry.name))) {
        return entryPath;
      }
      return [];
    })
  );
  return files.flat();
}

/**
 * Extracts imported specifiers from the file contents.
 * @param {string} contents
 * @returns {string[]}
 */
function extractImports(contents) {
  const matches = new Set();
  const staticImportRegex = /(?:^|\n)\s*import\s+(?:[^'";]+?\s+from\s+)?["']([^"']+)["']/g;
  const typeImportRegex = /(?:^|\n)\s*import\s+type\s+[^'";]+?from\s+["']([^"']+)["']/g;
  const dynamicImportRegex = /import\(\s*["']([^"']+)["']\s*\)/g;

  let match;
  while ((match = staticImportRegex.exec(contents)) !== null) {
    matches.add(match[1]);
  }
  while ((match = typeImportRegex.exec(contents)) !== null) {
    matches.add(match[1]);
  }
  while ((match = dynamicImportRegex.exec(contents)) !== null) {
    matches.add(match[1]);
  }

  return [...matches];
}

const relativePath = (filePath) => path.relative(process.cwd(), filePath);

const graph = {};

const files = await collectFiles(ROOT);
for (const file of files) {
  const contents = await readFile(file, 'utf8');
  const imports = extractImports(contents);
  graph[relativePath(file)] = imports;
}

const sortedKeys = Object.keys(graph).sort();
const output = sortedKeys.map((key) => ({ file: key, imports: graph[key].sort() }));
console.log(JSON.stringify(output, null, 2));
