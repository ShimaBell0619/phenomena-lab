import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const url='https://phenomena-lab.vercel.app';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
  const page=await browser.newPage({viewport:{width:1280,height:850},reducedMotion:'reduce'});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  let response=null;
  for(let attempt=0;attempt<8;attempt++){
    try{
      response=await page.goto(url,{waitUntil:'networkidle',timeout:20000});
      if(response?.status()===200)break;
    }catch{}
    await new Promise(r=>setTimeout(r,5000));
  }
  assert.equal(response?.status(),200,'public Production must return HTTP 200 without Vercel authentication');
  await page.getByRole('heading',{name:'物体を調べる'}).waitFor({timeout:15000});
  assert.equal(await page.locator('.body-row').count(),2,'public Production renders the live orbital sandbox');
  const time=async()=>Number(await page.locator('.scene-status strong').nth(1).textContent());
  await page.waitForTimeout(600);
  assert.ok(await time()>0,'public browser actively simulates gravity');
  await page.getByRole('button',{name:/一時停止/}).click();
  await page.waitForTimeout(240);
  const before=await time();
  await page.getByRole('button',{name:'1ステップ'}).click();
  await page.waitForTimeout(220);
  assert.ok(await time()>before,'public Production supports real step controls');
  assert.equal(await page.getByRole('button',{name:'保存',exact:true}).isVisible(),true);
  assert.deepEqual(errors,[],'no uncaught JavaScript errors in public Production');
  mkdirSync('test-results',{recursive:true});
  await page.screenshot({path:'test-results/prod-'+(process.env.GITHUB_SHA||'local').slice(0,12)+'.png',fullPage:true});
  console.log('PRODUCTION REAL-BROWSER PASS: '+url+', HTTP 200, interactive GRAVITY, no auth, screenshot');
}finally{await browser.close();}
