import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('product contract and CSS design tokens remain in sync', () => {
  const product = readFileSync('PRODUCT.md','utf8');
  const design = readFileSync('DESIGN.md','utf8');
  const css = readFileSync('src/styles.css','utf8');
  assert.match(product,/velocity Verlet/);
  assert.match(product,/G = 1000/);
  assert.match(product,/16 bodies/);
  assert.match(design,/#080D16/);
  assert.match(css,/#080D16/);
});

test('initial screen does not falsely claim working physics', () => {
  const source=readFileSync('src/main.tsx','utf8');
  assert.match(source,/物理演算はまだ実行していません/);
  assert.doesNotMatch(source,/setInterval\(/);
});
