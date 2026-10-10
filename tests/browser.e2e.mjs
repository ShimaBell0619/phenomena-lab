import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const URL='http://127.0.0.1:4173';
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4173','--strictPort'],{stdio:'inherit'});
let browser;
async function ready(){
  for(let i=0;i<80;i++){
    if(server.exitCode!==null)throw new Error('Vite preview server exited');
    try{const r=await fetch(URL);if(r.ok)return;}catch{}
    await new Promise(r=>setTimeout(r,250));
  }
  throw new Error('Vite preview server did not respond');
}
async function main(){
  await ready();
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(URL,{waitUntil:'networkidle'});
  await page.getByRole('heading',{name:'物体を調べる'}).waitFor();
  await page.locator('canvas').waitFor();
  assert.equal(await page.locator('.body-row').count(),2,'initial Single Orbit has two bodies');
  const time=async()=>Number(await page.locator('.scene-status strong').nth(1).textContent());
  await page.waitForTimeout(600);
  assert.ok(await time()>0,'the simulation advances on first load');

  await page.getByRole('button',{name:/一時停止/}).click();
  // Clock text is refreshed on a 160ms UI interval; allow it to settle after pausing.
  await page.waitForTimeout(240);
  const paused=await time();
  await page.waitForTimeout(240);
  assert.equal(await time(),paused,'pause must freeze simulation time');
  await page.getByRole('button',{name:'1ステップ'}).click();
  await page.waitForTimeout(220);
  assert.ok((await time())>paused,'one step advances the clock');
  await page.getByRole('button',{name:'全体表示'}).click();
  await page.getByLabel('実験プリセット').selectOption('Binary Dance');
  assert.equal(await page.locator('.body-row').count(),2,'Binary Dance preset has two bodies');
  await page.getByLabel('実験プリセット').selectOption('Three-Body');
  assert.equal(await page.locator('.body-row').count(),3,'Three-Body has three bodies');
  await page.getByLabel('実験プリセット').selectOption('Single Orbit');
  assert.equal(await page.locator('.body-row').count(),2);

  if(await page.getByRole('button',{name:/一時停止/}).count()) await page.getByRole('button',{name:/一時停止/}).click();
  assert.equal(await page.getByRole('button',{name:'1ステップ'}).isEnabled(),true);
  const rect=await page.locator('canvas').boundingBox();
  assert.ok(rect?.width>100&&rect?.height>100);
  const sx=rect.x+rect.width*.76,sy=rect.y+rect.height*.74;
  await page.mouse.move(sx,sy);await page.mouse.down();await page.mouse.move(sx+38,sy-35,{steps:8});await page.mouse.up();
  assert.equal(await page.locator('.body-row').count(),3,'pointer launch adds an actual body');
  await page.getByRole('button',{name:/新しい物体を追加/}).click();
  await page.locator('.disclosure + form').getByRole('button',{name:/物体を追加/}).click();
  assert.equal(await page.locator('.body-row').count(),4,'numeric keyboard form adds body');
  const editor=page.locator('section.inspector-section form.form-grid').first();
  await editor.getByLabel('質量 [単位]').fill('12');
  await editor.getByRole('button',{name:'数値を適用'}).click();
  assert.ok((await page.locator('.selected-summary').textContent()).includes('12.00'),'numeric editing modifies model');
  await page.getByRole('button',{name:'保存',exact:true}).click();
  assert.ok((await page.locator('.feedback').textContent()).includes('保存'));
  await page.reload({waitUntil:'networkidle'});
  await page.getByRole('button',{name:'保存した実験を開く'}).click();
  assert.equal(await page.locator('.body-row').count(),4,'localStorage snapshot restores body count');

  const commit=(process.env.GITHUB_SHA||'local').slice(0,12);
  mkdirSync('test-results',{recursive:true});
  for(const width of [1440,390,320]){
    await page.setViewportSize({width,height:width===1440?900:844});
    await page.waitForTimeout(130);
    const overflow=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:window.innerWidth}));
    assert.ok(overflow.scroll<=overflow.viewport+1,'horizontal overflow '+width+'px: '+JSON.stringify(overflow));
    assert.equal(await page.getByRole('button',{name:'全体表示'}).isVisible(),true);
    assert.equal(await page.getByRole('button',{name:'保存',exact:true}).isVisible(),true);
    await page.screenshot({path:'test-results/'+commit+'-'+width+'.png',fullPage:true});
  }
  await page.getByRole('button',{name:'初期状態に戻す'}).click();
  await page.waitForTimeout(120);
  assert.equal(await page.locator('.body-row').count(),2,'reset restores exactly the preset');
  await page.keyboard.press('Tab');
  const focus=await page.evaluate(()=>document.activeElement instanceof HTMLElement&&document.activeElement!==document.body);
  assert.ok(focus,'keyboard can reach interactive controls');
  assert.deepEqual(errors,[],'there must be no uncaught browser exceptions');
  console.log('Chromium browser smoke PASS: first load, physics, pause/step, presets, pointer/form, editing, persistence, 3 responsive layouts, keyboard');
}
try{await main();}
finally{if(browser)await browser.close();server.kill('SIGTERM');}
