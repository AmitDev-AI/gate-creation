/**
 * Post-build step: injects the precache list and a content hash into the
 * service worker, then creates 404.html for static hosts (GitHub Pages).
 *
 * No dependencies, no Workbox. Run automatically by `npm run build`.
 */
import { createHash } from 'node:crypto';
import { copyFileSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const DIST = 'dist';
const TEMPLATE = join('scripts', 'sw-template.js');

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const files = walk(DIST)
  .map((file) => relative(DIST, file).split(sep).join('/'))
  .sort();

if (!files.includes('index.html')) {
  console.error('build-sw: dist/index.html is missing. Run `vite build` first.');
  process.exit(1);
}

const precache = files
  .filter((file) => file !== 'sw.js' && file !== '404.html')
  .map((file) => `/${file}`);
precache.push('/');

const fingerprint = files.map((file) => `${file}:${statSync(join(DIST, file)).size}`).join('|');
const version = createHash('sha1').update(fingerprint).digest('hex').slice(0, 10);

const template = readFileSync(TEMPLATE, 'utf8');
const sw = template
  .replace('__CACHE_VERSION__', version)
  .replace('__PRECACHE_MANIFEST__', JSON.stringify(precache, null, 2));

if (sw.includes('__CACHE_VERSION__') || sw.includes('__PRECACHE_MANIFEST__')) {
  console.error('build-sw: template placeholders were not replaced. Check scripts/sw-template.js.');
  process.exit(1);
}

writeFileSync(join(DIST, 'sw.js'), sw);

// Static hosts serve 404.html for unknown paths; it must boot the same SPA
// so deep links like /settings work when opened directly.
copyFileSync(join(DIST, 'index.html'), join(DIST, '404.html'));

const precachedBytes = precache.reduce((total, url) => {
  const path = url === '/' ? 'index.html' : url.slice(1);
  try {
    return total + statSync(join(DIST, path)).size;
  } catch {
    return total;
  }
}, 0);

console.log(
  `build-sw: version ${version}, ${precache.length} files precached (~${(precachedBytes / 1024).toFixed(1)} KB uncompressed)`,
);
