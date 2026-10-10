import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('product contract and design tokens are implemented by live GRAVITY entrypoint',()=>{
  const product=readFileSync('PRODUCT.md','utf8');
  const design=readFileSync('DESIGN.md','utf8');
  const css=readFileSync('src/styles.css','utf8');
  const app=readFileSync('src/main.tsx','utf8');
  assert.match(product,/velocity Verlet/);
  assert.match(product,/G = 1000/);
  assert.match(product,/16 bodies/);
  assert.match(design,/#080D16/);
  assert.match(css,/#080D16/);
  assert.match(app,/function GravityLab/);
  assert.match(app,/drawScene/);
  assert.match(app,/onPointerDown/);
  assert.doesNotMatch(app,/物理演算はまだ実行していません/);
});

test('deployment safety: ordinary branches do not automatically deploy',()=>{
  const config=JSON.parse(readFileSync('vercel.json','utf8'));
  assert.deepEqual(config.git.deploymentEnabled,{
    '**':false,main:true,'preview/**':true,staging:true
  });
});

test('body input readout and responsive camera fit remain explicit UI contracts',()=>{
  const app=readFileSync('src/main.tsx','utf8');
  assert.match(app,/inputNumber\(body\.x\)/);
  assert.match(app,/canvasDimensions\.current/);
  assert.match(app,/fitCamera\(simRef\.current,rect\.width,rect\.height\)/);
});
