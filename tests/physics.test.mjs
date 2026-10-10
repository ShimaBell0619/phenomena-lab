import test from 'node:test';
import assert from 'node:assert/strict';
import { G, EPSILON, DT, MAX_BODIES, SNAPSHOT_KEY, preset, step, accelerations, momentum,
  totalEnergy, mergeCollisions, radius, addBody, readSnapshot, saveSnapshot } from '../src/physics.ts';
const near=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<=tol, 'expected '+a+' ≈ '+b+' (tolerance '+tol+')');

test('documented simulation contract and initial single orbit are deterministic',()=>{
  assert.equal(G,1000);assert.equal(EPSILON,4);near(DT,1/120);
  assert.equal(MAX_BODIES,16);assert.equal(SNAPSHOT_KEY,'phenomena.gravity.v1');
  const a=preset('Single Orbit'),b=preset('Single Orbit');
  assert.deepEqual(a,b);
  assert.equal(a.bodies[0].mass,800);assert.equal(a.bodies[1].mass,5);
  near(a.bodies[1].x-a.bodies[0].x,160);
  near(momentum(a.bodies).y,0,1e-10);
  assert.equal(a.time,0);assert.equal(a.steps,0);
});
test('Newtonian softened pairwise acceleration is equal and opposite in momentum terms',()=>{
  const s=preset('Single Orbit');const a=accelerations(s.bodies);
  near(a[0].x*s.bodies[0].mass+a[1].x*s.bodies[1].mass,0,1e-8);
  near(a[0].y*s.bodies[0].mass+a[1].y*s.bodies[1].mass,0,1e-8);
  assert.ok(a[0].x>0&&a[1].x<0);
  assert.ok(radius(10000)<=30);
});
test('velocity Verlet completes an orbit segment without significant drift',()=>{
  const initial=preset('Single Orbit');
  const energy0=totalEnergy(initial.bodies);
  let s=initial;
  for(let i=0;i<1200;i++)s=step(s);
  const d=Math.hypot(s.bodies[0].x-s.bodies[1].x,s.bodies[0].y-s.bodies[1].y);
  assert.ok(Math.abs(d-160)<3,'orbital radius drift: '+d);
  near(s.time,1200*DT);
  assert.equal(s.steps,1200);
  const diff=Math.abs((totalEnergy(s.bodies)-energy0)/energy0);
  assert.ok(diff<0.002,'energy drift: '+diff);
});
test('fixed-step evolution is reproducible and state is immutable',()=>{
  const init=preset('Three-Body'),start=JSON.stringify(init);
  let a=init,b=init;
  for(let i=0;i<480;i++){a=step(a);b=step(b);}
  assert.deepEqual(a,b);assert.equal(JSON.stringify(init),start);
  assert.ok(a.bodies.every(b=>Number.isFinite(b.x)&&Number.isFinite(b.vx)));
});
test('collision merging preserves mass and linear momentum',()=>{
  const p=preset('Single Orbit').bodies[0];
  const a={...p,id:'a',name:'A',mass:10,x:0,y:0,vx:5,vy:-3};
  const b={...p,id:'b',name:'B',mass:15,x:1,y:0,vx:-4,vy:2};
  const incoming=momentum([a,b]);
  const merged=mergeCollisions([a,b]);
  assert.equal(merged.length,1);
  near(merged[0].mass,25);
  near(merged[0].x,.6);near(merged[0].y,0);
  const outgoing=momentum(merged);
  near(outgoing.x,incoming.x);near(outgoing.y,incoming.y);
  const integration=step({bodies:[a,b],time:0,steps:0});
  assert.equal(integration.bodies.length,1);
  near(integration.bodies[0].mass,25);
});
test('new bodies validate bounds, finite values and unique IDs',()=>{
  const original=preset('Single Orbit');
  let s=original;
  for(let i=0;i<14;i++){
    s=addBody(s,{id:'extra-'+i,name:'Extra',mass:1,x:1000+i*100,y:1000,vx:0,vy:0,color:'#FFFFFF'});
  }
  assert.equal(s.bodies.length,16);
  assert.throws(()=>addBody(s,{...s.bodies[0],id:'extra-100'}),/最大16個/);
  assert.throws(()=>addBody(original,{...original.bodies[0]}),/IDが重複/);
  assert.throws(()=>addBody(original,{...original.bodies[0],id:'nan',x:NaN}),/有限/);
  assert.throws(()=>addBody(original,{...original.bodies[0],id:'mass',mass:-1}),/質量/);
  assert.equal(original.bodies.length,2);
});
test('near-zero separation remains numerically finite with softening and merges safely',()=>{
  const s=preset('Single Orbit');
  const a={...s.bodies[0],x:0,y:0,vx:0,vy:0};
  const b={...s.bodies[1],x:0,y:0,vx:0,vy:0};
  const acc=accelerations([a,b]);
  assert.deepEqual(acc,[{x:0,y:0},{x:0,y:0}]);
  const after=step({bodies:[a,b],steps:0,time:0});
  assert.equal(after.bodies.length,1);
});
test('snapshot storage validates schema, physics invariants and errors',()=>{
  const snapshot={version:1,name:'Test Lab',preset:'Binary Dance',state:preset('Binary Dance'),speed:1,trails:true,vectors:false};
  const roundtrip=readSnapshot(saveSnapshot(snapshot));
  assert.deepEqual(roundtrip,snapshot);
  assert.throws(()=>readSnapshot(null),/保存された実験/);
  assert.throws(()=>readSnapshot('{broken'),/破損/);
  assert.throws(()=>readSnapshot(JSON.stringify({...snapshot,version:2})),/バージョン/);
  assert.throws(()=>readSnapshot(JSON.stringify({...snapshot,state:{...snapshot.state,steps:1}})),/時間/);
  assert.throws(()=>readSnapshot(JSON.stringify({...snapshot,state:{...snapshot.state,bodies:[{...snapshot.state.bodies[0],vx:Infinity}]}})),/有限/);
});
