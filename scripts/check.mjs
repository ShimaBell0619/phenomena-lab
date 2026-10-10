import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
const p = JSON.parse(readFileSync('package.json', 'utf8'));
const requiredScripts = ['check','typecheck','test','build'];
for (const name of requiredScripts) {
  assert.ok(typeof p.scripts?.[name] === 'string' && p.scripts[name].trim(), 'Missing real ' + name + ' script');
  assert.doesNotMatch(p.scripts[name], /^\s*(echo\s+|true\s*$|:\s*$)/i, 'No-op ' + name + ' script is forbidden');
}
for (const path of ['AGENTS.md','PRODUCT.md','DESIGN.md','index.html','src/main.tsx','docs/VERIFICATION.md','.github/workflows/ci.yml']) {
  assert.ok(existsSync(path), 'Required adoption file missing: ' + path);
}
const html = readFileSync('index.html', 'utf8');
assert.match(html, /lang="ja"/);
assert.match(html, /src="\/src\/main\.tsx"/);
console.log('PHENOMENA starter file/script contract: PASS');
