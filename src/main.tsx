import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { addBody, COLORS, DT, MAX_BODIES, PRESET_NAMES, preset, radius, readSnapshot, saveSnapshot, SNAPSHOT_KEY, step, validateBody, validateState } from './physics';
import type { Body, PresetName, Simulation, Snapshot, Vec } from './physics';
import { drawScene, fitCamera, pick, recordTrails, screenToWorld } from './scene';
import type { Camera, TrailMap } from './scene';
import './styles.css';

const format = (n:number,digits=1)=>Number.isFinite(n)?n.toFixed(digits):'—';
// Numeric editing is a deliberately human-readable projection; full precision remains in the solver and saved snapshots.
const inputNumber = (n:number)=>Number(n.toFixed(3));
type ToolGesture = { mode:'launch'|'reposition'|'pan'|'select'; start:Vec; end:Vec; bodyId?:string; baseCamera?:Camera; screenStart?:Vec };
function Numeric({label,value,onChange,min,max,step:increment='any'}:{
 label:string; value:number;onChange:(n:number)=>void;min?:number;max?:number;step?:number|'any'
}) {
  return <label className="field"><span>{label}</span><input type="number" required min={min} max={max} step={increment}
    value={value} onChange={e=>onChange(e.target.value===''?NaN:Number(e.target.value))}/></label>;
}
function BodyEditor({body,onApply}:{
 body:Body;onApply:(values:{mass:number;x:number;y:number;vx:number;vy:number})=>void
}) {
 const [mass,setMass]=useState(body.mass);
 const [x,setX]=useState(inputNumber(body.x)),[y,setY]=useState(inputNumber(body.y));
 const [vx,setVx]=useState(inputNumber(body.vx)),[vy,setVy]=useState(inputNumber(body.vy));
 return <form onSubmit={e=>{e.preventDefault();onApply({mass,x,y,vx,vy});}} className="form-grid">
  <Numeric label="質量 [単位]" value={mass} onChange={setMass} min={0.1} max={10000}/>
  <Numeric label="X [単位]" value={x} onChange={setX} min={-100000} max={100000}/>
  <Numeric label="Y [単位]" value={y} onChange={setY} min={-100000} max={100000}/>
  <Numeric label="速度 X [単位/秒]" value={vx} onChange={setVx} min={-100000} max={100000}/>
  <Numeric label="速度 Y [単位/秒]" value={vy} onChange={setVy} min={-100000} max={100000}/>
  <button className="button primary span-two" type="submit">数値を適用</button>
 </form>;
}
function NewBody({onCreate}:{
 onCreate:(v:{mass:number;x:number;y:number;vx:number;vy:number})=>void
}) {
 const [mass,setMass]=useState(5);
 const [x,setX]=useState(0),[y,setY]=useState(180);
 const [vx,setVx]=useState(30),[vy,setVy]=useState(0);
 return <form onSubmit={e=>{e.preventDefault();onCreate({mass,x,y,vx,vy});}} className="form-grid">
  <Numeric label="質量 [単位]" value={mass} onChange={setMass} min={0.1} max={10000}/>
  <Numeric label="X [単位]" value={x} onChange={setX} min={-100000} max={100000}/>
  <Numeric label="Y [単位]" value={y} onChange={setY} min={-100000} max={100000}/>
  <Numeric label="速度 X [単位/秒]" value={vx} onChange={setVx} min={-100000} max={100000}/>
  <Numeric label="速度 Y [単位/秒]" value={vy} onChange={setVy} min={-100000} max={100000}/>
  <button className="button secondary span-two" type="submit">+ 物体を追加</button>
 </form>;
}

function GravityLab():React.JSX.Element {
 const simRef=useRef<Simulation>(preset('Single Orbit'));
 const [visible,setVisible]=useState<Simulation>(simRef.current);
 const [presetName,setPresetName]=useState<PresetName>('Single Orbit');
 const [playing,setPlaying]=useState(true), playingRef=useRef(true);
 const [speed,setSpeed]=useState<0.5|1|2>(1), speedRef=useRef<0.5|1|2>(1);
 const [selected,setSelected]=useState<string|null>('orbit'),selectedRef=useRef<string|null>('orbit');
 const [trailsOn,setTrailsOn]=useState(true),trailsOnRef=useRef(true);
 const [vectorsOn,setVectorsOn]=useState(false),vectorsOnRef=useRef(false);
 const [error,setError]=useState<string|null>(null);
 const [notice,setNotice]=useState('画面をドラッグして、新しい物体を投げ込めます。');
 const [savedName,setSavedName]=useState('My Experiment');
 const [addOpen,setAddOpen]=useState(false);
 const [aboutOpen,setAboutOpen]=useState(false);
 const dirty=useRef(false);
 const idCounter=useRef(1);
 const trails=useRef<TrailMap>(new Map());
 const camera=useRef<Camera>({x:0,y:0,zoom:1.1});
 const cameraReady=useRef(false);
 const canvasDimensions=useRef<{width:number;height:number}|null>(null);
 const canvas=useRef<HTMLCanvasElement>(null);
 const gesture=useRef<ToolGesture|null>(null);
 const fps=useRef(0);
 const [frameRate,setFrameRate]=useState(0);
 const refresh=()=>setVisible({...simRef.current,bodies:[...simRef.current.bodies]});
 const stop=()=>{playingRef.current=false;setPlaying(false);};
 const fail=(e:unknown)=>{stop();setError(e instanceof Error?e.message:'予期しないエラーが発生しました。');};
 const mutate=(state:Simulation,track=true)=>{
   validateState(state);simRef.current=state;refresh();setError(null);
   if(track)dirty.current=true;
   if(selectedRef.current&&!state.bodies.some(b=>b.id===selectedRef.current)){
     const next=state.bodies[0]?.id??null;selectedRef.current=next;setSelected(next);
   }
 };
 const freshBody=(params:{mass:number;x:number;y:number;vx:number;vy:number}):Body=>{
   let id:string;
   do{id='new-'+idCounter.current++;}while(simRef.current.bodies.some(b=>b.id===id));
   return {id,name:'Body '+id.split('-')[1],...params,color:COLORS[(simRef.current.bodies.length)%COLORS.length]!};
 };
 const create=(values:{mass:number;x:number;y:number;vx:number;vy:number})=>{
   try {
     const b=freshBody(values);validateBody(b);mutate(addBody(simRef.current,b));
     selectedRef.current=b.id;setSelected(b.id);
     setNotice(b.name+' を追加しました。');setAddOpen(false);
   }catch(e){setError(e instanceof Error?e.message:'物体を追加できません。');}
 };
 const reset=(next:PresetName)=>{
   if(dirty.current&&!window.confirm('未保存の変更を破棄してプリセットを読み込みますか？'))return;
   stop();const s=preset(next);mutate(s,false);setPresetName(next);
   selectedRef.current=s.bodies.at(-1)?.id??null;setSelected(selectedRef.current);
   trails.current.clear();recordTrails(trails.current,s.bodies);
   cameraReady.current=false;dirty.current=false;setError(null);setNotice(next+' を初期状態に戻しました。');
   playingRef.current=true;setPlaying(true);
 };
 const fit=()=>{
   const rect=canvas.current?.getBoundingClientRect();
   if(!rect)return;
   camera.current=fitCamera(simRef.current,rect.width,rect.height);
   setNotice('すべての物体が見えるように表示範囲を調整しました。');
 };
 const play=()=>{
   if(playingRef.current){stop();setNotice('一時停止中。物体をドラッグして位置を変更できます。');return;}
   playingRef.current=true;setPlaying(true);setError(null);setNotice('シミュレーションを再開しました。');
 };
 const frameStep=()=>{
   if(playingRef.current)return;
   try{const next=step(simRef.current);mutate(next,false);recordTrails(trails.current,next.bodies);}
   catch(e){fail(e);}
 };
 const applyEdit=(v:{mass:number;x:number;y:number;vx:number;vy:number})=>{
   if(playingRef.current){setError('数値編集するには一時停止してください。');return;}
   try{
     const bodies=simRef.current.bodies.map(b=>b.id===selected?{...b,...v}:b);
     const next={...simRef.current,bodies};mutate(next);trails.current.clear();setNotice('物体の値を適用しました。');
   }catch(e){setError(e instanceof Error?e.message:'変更できません。');}
 };
 const doSave=()=>{
   try{
     const payload:Snapshot={version:1,name:savedName.trim()||'My Experiment',preset:presetName,state:simRef.current,speed:speedRef.current,trails:trailsOnRef.current,vectors:vectorsOnRef.current};
     const encoded=saveSnapshot(payload);window.localStorage.setItem(SNAPSHOT_KEY,encoded);
     dirty.current=false;setNotice('実験「'+payload.name+'」をこのブラウザに保存しました。');setError(null);
   }catch(e){setError(e instanceof Error?e.message:'ブラウザへ保存できませんでした。');}
 };
 const doLoad=()=>{
   if(dirty.current&&!window.confirm('未保存の変更を破棄し、保存済み実験を読み込みますか？'))return;
   try{
     const raw=window.localStorage.getItem(SNAPSHOT_KEY);
     const data=readSnapshot(raw);
     stop();mutate({...data.state,bodies:data.state.bodies.map(b=>({...b}))},false);
     setPresetName(data.preset);setSavedName(data.name);setSpeed(data.speed);speedRef.current=data.speed;
     setTrailsOn(data.trails);trailsOnRef.current=data.trails;
     setVectorsOn(data.vectors);vectorsOnRef.current=data.vectors;
     const newSelection=data.state.bodies[0]?.id??null;selectedRef.current=newSelection;setSelected(newSelection);
     trails.current.clear();recordTrails(trails.current,data.state.bodies);
     cameraReady.current=false;dirty.current=false;setNotice('実験「'+data.name+'」を読み込みました。');setError(null);
   }catch(e){setError(e instanceof Error?e.message:'保存済み実験を読み込めませんでした。');}
 };
 const canvasCoordinates=(event:React.PointerEvent<HTMLCanvasElement>):{world:Vec;screen:Vec;w:number;h:number}=>{
   const rect=event.currentTarget.getBoundingClientRect();
   const x=event.clientX-rect.left,y=event.clientY-rect.top;
   return {world:screenToWorld(x,y,rect.width,rect.height,camera.current),screen:{x,y},w:rect.width,h:rect.height};
 };
 const onPointerDown=(event:React.PointerEvent<HTMLCanvasElement>)=>{
   if(event.button!==0)return;
   event.currentTarget.setPointerCapture(event.pointerId);
   const p=canvasCoordinates(event);
   if(event.shiftKey){gesture.current={mode:'pan',start:p.world,end:p.world,baseCamera:{...camera.current},screenStart:p.screen};return;}
   const id=pick(simRef.current.bodies,p.world,camera.current.zoom);
   if(id){selectedRef.current=id;setSelected(id);
      gesture.current={mode:playingRef.current?'select':'reposition',start:p.world,end:p.world,bodyId:id};
   }else{
     gesture.current={mode:'launch',start:p.world,end:p.world};
   }
 };
 const onPointerMove=(event:React.PointerEvent<HTMLCanvasElement>)=>{
   const g=gesture.current;if(!g)return;
   const p=canvasCoordinates(event);
   if(g.mode==='pan'&&g.baseCamera&&g.screenStart){
     camera.current={...g.baseCamera,x:g.baseCamera.x-(p.screen.x-g.screenStart.x)/g.baseCamera.zoom,
       y:g.baseCamera.y-(p.screen.y-g.screenStart.y)/g.baseCamera.zoom};
   }else if(g.mode==='reposition'&&g.bodyId&&!playingRef.current){
     try{
       const bodies=simRef.current.bodies.map(b=>b.id===g.bodyId?{...b,x:p.world.x,y:p.world.y}:b);
       mutate({...simRef.current,bodies});trails.current.clear();
     }catch(e){setError(e instanceof Error?e.message:'位置を変更できません。');}
   }else if(g.mode==='launch')g.end=p.world;
 };
 const onPointerUp=(event:React.PointerEvent<HTMLCanvasElement>)=>{
   const g=gesture.current;gesture.current=null;
   if(!g)return;
   if(g.mode==='launch'){
     const p=canvasCoordinates(event);
     create({mass:5,x:g.start.x,y:g.start.y,vx:(p.world.x-g.start.x)*.8,vy:(p.world.y-g.start.y)*.8});
   }
 };
 const onWheel=(event:React.WheelEvent<HTMLCanvasElement>)=>{
   const next=camera.current.zoom*(event.deltaY>0?.9:1.1);
   camera.current={...camera.current,zoom:Math.max(.15,Math.min(4,next))};
 };
 useEffect(()=>{
   recordTrails(trails.current,simRef.current.bodies);
   let raf=0,last=performance.now(),accumulator=0,lastUi=0,frameTimes:number[]=[];
   const loop=(now:number)=>{
     const elapsed=Math.min(Math.max(0,(now-last)/1000),.08);last=now;
     const target=canvas.current,ctx=target?.getContext('2d');
     if(document.hidden){accumulator=0;raf=requestAnimationFrame(loop);return;}
     if(playingRef.current){
       accumulator+=elapsed*speedRef.current;
       let iterations=0;
       while(accumulator>=DT&&iterations<8){
         try{
           simRef.current=step(simRef.current);
           if(simRef.current.steps%2===0)recordTrails(trails.current,simRef.current.bodies);
         }catch(e){fail(e);accumulator=0;break;}
         accumulator-=DT;iterations++;
       }
       if(iterations===8)accumulator=0;
     }
     if(target&&ctx){
       const rect=target.getBoundingClientRect();
       if(rect.width>0&&rect.height>0){
         const dpr=Math.min(window.devicePixelRatio||1,2);
         const width=Math.max(1,Math.round(rect.width*dpr)),height=Math.max(1,Math.round(rect.height*dpr));
         if(target.width!==width||target.height!==height){target.width=width;target.height=height;}
         ctx.setTransform(dpr,0,0,dpr,0,0);
         const oldSize=canvasDimensions.current;
         if(!cameraReady.current||!oldSize||Math.abs(oldSize.width-rect.width)>1||Math.abs(oldSize.height-rect.height)>1){
           camera.current=fitCamera(simRef.current,rect.width,rect.height);
           canvasDimensions.current={width:rect.width,height:rect.height};
           cameraReady.current=true;
         }
         drawScene(ctx,rect.width,rect.height,simRef.current,camera.current,trails.current,{
           selectedId:selectedRef.current,trails:trailsOnRef.current,vectors:vectorsOnRef.current,
           pending:gesture.current?.mode==='launch'?{from:gesture.current.start,to:gesture.current.end}:undefined
         });
       }
     }
     frameTimes.push(elapsed);if(frameTimes.length>30)frameTimes.shift();
     if(now-lastUi>160){
       refresh();lastUi=now;
       fps.current=frameTimes.length/Math.max(.001,frameTimes.reduce((a,b)=>a+b,0));
       setFrameRate(Math.round(fps.current));
     }
     raf=requestAnimationFrame(loop);
   };
   raf=requestAnimationFrame(loop);
   const onHide=()=>{last=performance.now();accumulator=0;};
   document.addEventListener('visibilitychange',onHide);
   return()=>{cancelAnimationFrame(raf);document.removeEventListener('visibilitychange',onHide);};
 },[]);
 const selectedBody=visible.bodies.find(b=>b.id===selected)??null;
 return <div className="app-shell">
   <header className="topbar">
     <div className="brand"><span className="symbol" aria-hidden="true">◉</span> PHENOMENA <span className="brand-divider">/</span><span className="lab-name">GRAVITY</span></div>
     <div className="header-right"><span className="live-indicator"><span className={playing?'pulse':'dot'}></span>{playing?'実験中':'一時停止'}</span>
       <label className="preset-select">実験 <select aria-label="実験プリセット" value={presetName} onChange={e=>reset(e.target.value as PresetName)}>
         {PRESET_NAMES.map(name=><option key={name}>{name}</option>)}
       </select></label>
       <button className="text-button" onClick={()=>setAboutOpen(x=>!x)} aria-expanded={aboutOpen}>モデルについて</button>
     </div>
   </header>
   <div className="app-layout">
     <section className="lab-column" aria-label="重力の実験画面">
       <div className="lab-topline"><span className="eyebrow">NEWTONIAN N-BODY FIELD</span><span className="numerals">G 1000 &nbsp; ε 4 &nbsp; Δt 1/120</span></div>
       <div className="canvas-wrap">
         <canvas ref={canvas} className="space-canvas" role="img" aria-label="重力シミュレーション。物体の操作は下の物体一覧と数値フォームからも行えます。"
           onPointerDown={onPointerDown} onPointerMove={onPointerMove}
           onPointerUp={onPointerUp} onPointerCancel={()=>gesture.current=null} onWheel={onWheel}/>
         <div className="canvas-instruction">ドラッグして物体を発射 <span>·</span> 一時停止中は位置を移動 <span>·</span> Shift+ドラッグで移動</div>
         <div className="scene-status"><span><strong>{visible.bodies.length}</strong> BODIES</span><span><strong>{format(visible.time,2)}</strong> s</span></div>
       </div>
       <div className="transport">
         <div className="transport-primary">
           <button className="button primary" onClick={play}>{playing?'❚❚ 一時停止':'▶ 再生'}</button>
           <button className="button secondary" onClick={frameStep} disabled={playing}>1ステップ</button>
           <div className="speed-toggle" role="group" aria-label="再生速度">
             {([0.5,1,2] as const).map(v=><button key={v} className={speed===v?'chosen':''}
               aria-pressed={speed===v} onClick={()=>{setSpeed(v);speedRef.current=v;}}>{v}×</button>)}
           </div>
         </div>
         <div className="transport-secondary">
           <button className="button ghost" onClick={fit}>全体表示</button>
           <button className="button ghost" onClick={()=>reset(presetName)}>初期状態に戻す</button>
         </div>
       </div>
       <div className="lab-foot">
         <label className="toggle"><input type="checkbox" checked={trailsOn} onChange={e=>{setTrailsOn(e.target.checked);trailsOnRef.current=e.target.checked;}}/>軌跡</label>
         <label className="toggle"><input type="checkbox" checked={vectorsOn} onChange={e=>{setVectorsOn(e.target.checked);vectorsOnRef.current=e.target.checked;}}/>速度ベクトル</label>
         <span className="perf">Canvas 2D · {frameRate} fps (参考)</span>
       </div>
       <div className="feedback" aria-live="polite">{notice}</div>
       {error&&<div className="error" role="alert">{error}<button className="text-button" onClick={()=>reset(presetName)}>プリセットへ復帰</button></div>}
       {aboutOpen&&<section className="model-explainer" aria-labelledby="model-heading">
         <h2 id="model-heading">このモデルについて</h2>
         <p>物体同士が引き合う2次元ニュートン重力モデルです。距離・質量・時間は実験室の独自単位で、現実の天体運動を予測するものではありません。</p>
         <p>数値積分はVelocity Verlet法（1/120秒刻み）。接近時は重力を緩和し、物体の円が重なると質量・運動量を保って合体させます。有限の時間刻みによる誤差があり、衝突時にエネルギーは保存されません。</p>
       </section>}
     </section>
     <aside className="inspector" aria-label="物体の編集と実験の保存">
       <div className="inspector-heading"><div><span className="eyebrow">OBJECT INSPECTOR</span><h2>物体を調べる</h2></div><span className="body-count">{visible.bodies.length} / {MAX_BODIES}</span></div>
       <div className="body-list" role="group" aria-label="物体一覧">
         {visible.bodies.map((b,i)=><button type="button" key={b.id} className={'body-row '+(selected===b.id?'active':'')}
           onClick={()=>{selectedRef.current=b.id;setSelected(b.id);}} aria-pressed={selected===b.id}>
           <span className="body-color" style={{backgroundColor:b.color}}/>
           <span className="body-name">{b.name}</span>
           <span className="body-mass">{format(b.mass)} u</span>
           <span className="body-index">{String(i+1).padStart(2,'0')}</span>
         </button>)}
       </div>
       {selectedBody&&<section className="selected-summary" aria-label="選択物体の値">
         <div className="summary-head"><span className="smallcaps">SELECTED</span><strong>{selectedBody.name}</strong></div>
         <div className="summary-grid"><div><span>質量</span><strong>{format(selectedBody.mass,2)}</strong></div>
           <div><span>速度</span><strong>{format(Math.hypot(selectedBody.vx,selectedBody.vy),2)}</strong></div>
           <div><span>X</span><strong>{format(selectedBody.x)}</strong></div>
           <div><span>Y</span><strong>{format(selectedBody.y)}</strong></div>
         </div>
       </section>}
       <section className="inspector-section">
         <div className="section-heading"><h3>物体を編集</h3><span>数値入力</span></div>
         {selectedBody?(playing?<p className="hint">再生を一時停止すると、位置・質量・速度を編集できます。</p>:
           <BodyEditor key={selectedBody.id} body={selectedBody} onApply={applyEdit}/>):<p>物体を選択してください。</p>}
       </section>
       <section className="inspector-section">
         <button className="disclosure" aria-expanded={addOpen} onClick={()=>setAddOpen(x=>!x)}>
           <span>新しい物体を追加</span><span aria-hidden>{addOpen?'−':'+'}</span>
         </button>
         {addOpen&&<NewBody onCreate={create}/>}
       </section>
       <section className="inspector-section persistence">
         <h3>実験を保存</h3>
         <label className="field full"><span>実験名</span><input maxLength={64} value={savedName} onChange={e=>setSavedName(e.target.value)}/></label>
         <div className="save-buttons"><button className="button secondary" onClick={doSave}>保存</button>
           <button className="button ghost" onClick={doLoad}>保存した実験を開く</button></div>
         <p className="fine-print">データはこのブラウザ内だけに保存されます。</p>
       </section>
     </aside>
   </div>
 </div>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><GravityLab/></React.StrictMode>);
