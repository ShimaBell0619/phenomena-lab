import type { Body, Simulation, Vec } from './physics';
import { radius } from './physics';

export type Camera = { x:number; y:number; zoom:number };
export type SceneOptions = { selectedId:string|null; trails:boolean; vectors:boolean; pending?:{from:Vec;to:Vec}; message?:string };
export type TrailMap = Map<string,Vec[]>;
export function screenToWorld(x:number,y:number,w:number,h:number,c:Camera):Vec {
  return {x:(x-w/2)/c.zoom+c.x,y:(y-h/2)/c.zoom+c.y};
}
export function worldToScreen(x:number,y:number,w:number,h:number,c:Camera):Vec {
  return {x:(x-c.x)*c.zoom+w/2,y:(y-c.y)*c.zoom+h/2};
}
export function fitCamera(state:Simulation,w:number,h:number):Camera {
  const xs=state.bodies.map(b=>b.x),ys=state.bodies.map(b=>b.y);
  const loX=Math.min(...xs),hiX=Math.max(...xs),loY=Math.min(...ys),hiY=Math.max(...ys);
  const width=Math.max(220,hiX-loX+160),height=Math.max(180,hiY-loY+160);
  return {x:(loX+hiX)/2,y:(loY+hiY)/2,zoom:Math.max(0.15,Math.min(4,(w-36)/width,(h-36)/height))};
}
export function pick(bodies:readonly Body[],point:Vec,zoom:number):string|null {
  let best:string|null=null,smallest=Infinity;
  for(const b of bodies){
    const d=Math.hypot(b.x-point.x,b.y-point.y);
    const hit=Math.max(radius(b.mass),10/zoom)+7/zoom;
    if(d<=hit && d<smallest){best=b.id;smallest=d;}
  }
  return best;
}
export function recordTrails(trails:TrailMap,bodies:readonly Body[]):void {
  const live=new Set(bodies.map(b=>b.id));
  for(const id of trails.keys())if(!live.has(id))trails.delete(id);
  for(const b of bodies){
    const v=trails.get(b.id)??[];
    v.push({x:b.x,y:b.y});
    if(v.length>240)v.splice(0,v.length-240);
    trails.set(b.id,v);
  }
}
export function drawScene(ctx:CanvasRenderingContext2D,w:number,h:number,state:Simulation,c:Camera,
  trails:TrailMap,options:SceneOptions):void {
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle='#080D16';ctx.fillRect(0,0,w,h);
  // Sparse axis lines and calibration ticks signal a measuring instrument, not a star-field animation.
  const origin=worldToScreen(0,0,w,h,c);
  ctx.strokeStyle='rgba(142,171,191,.09)';ctx.lineWidth=1;
  const tick=80*c.zoom;
  if(tick>=18){
    const offsetX=((origin.x%tick)+tick)%tick,offsetY=((origin.y%tick)+tick)%tick;
    for(let x=offsetX;x<w;x+=tick){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
    for(let y=offsetY;y<h;y+=tick){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
  }
  ctx.strokeStyle='rgba(142,171,191,.25)';
  if(origin.x>=0&&origin.x<=w){ctx.beginPath();ctx.moveTo(origin.x,0);ctx.lineTo(origin.x,h);ctx.stroke();}
  if(origin.y>=0&&origin.y<=h){ctx.beginPath();ctx.moveTo(0,origin.y);ctx.lineTo(w,origin.y);ctx.stroke();}

  if(options.trails) for(const b of state.bodies){
    const points=trails.get(b.id)??[];
    if(points.length<2)continue;
    for(let i=1;i<points.length;i++){
      const a=worldToScreen(points[i-1]!.x,points[i-1]!.y,w,h,c);
      const z=worldToScreen(points[i]!.x,points[i]!.y,w,h,c);
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(z.x,z.y);
      ctx.strokeStyle=b.color;ctx.globalAlpha=.05+.65*i/points.length;
      ctx.lineWidth=Math.max(1,1.2*c.zoom);
      ctx.stroke();
    }
  }
  ctx.globalAlpha=1;
  for(const b of state.bodies){
    const p=worldToScreen(b.x,b.y,w,h,c);
    const rr=Math.max(2,Math.min(40,radius(b.mass)*c.zoom));
    ctx.beginPath();ctx.arc(p.x,p.y,rr,0,Math.PI*2);
    ctx.fillStyle=b.color;
    ctx.shadowBlur=rr>3?Math.min(28,rr*1.1):0;ctx.shadowColor=b.color;ctx.fill();ctx.shadowBlur=0;
    if(b.id===options.selectedId){
      ctx.beginPath();ctx.arc(p.x,p.y,rr+6,0,2*Math.PI);
      ctx.lineWidth=1.5;ctx.strokeStyle='#fff';ctx.stroke();
    }
    if(options.vectors){
      const ex=p.x+b.vx*c.zoom*.4,ey=p.y+b.vy*c.zoom*.4;
      drawArrow(ctx,p,{x:ex,y:ey},'#B5F5E4',1.5);
    }
    ctx.font='12px ui-monospace, monospace';
    ctx.textAlign='center';ctx.fillStyle='#E6EEF4';
    ctx.fillText(b.name,p.x,p.y+rr+18);
  }
  if(options.pending){
    const a=worldToScreen(options.pending.from.x,options.pending.from.y,w,h,c);
    const b=worldToScreen(options.pending.to.x,options.pending.to.y,w,h,c);
    ctx.beginPath();ctx.arc(a.x,a.y,6,0,Math.PI*2);ctx.strokeStyle='#7BE6D4';ctx.stroke();
    drawArrow(ctx,a,b,'#7BE6D4',2);
    const speed=Math.hypot(options.pending.to.x-options.pending.from.x,options.pending.to.y-options.pending.from.y)*.8;
    ctx.fillStyle='#B4C4CF';ctx.textAlign='left';ctx.fillText('v '+speed.toFixed(1)+' u/s',Math.min(w-112,b.x+12),Math.min(h-12,b.y+12));
  }
}
function drawArrow(ctx:CanvasRenderingContext2D,a:Vec,b:Vec,color:string,width:number){
  const angle=Math.atan2(b.y-a.y,b.x-a.x);
  const dist=Math.hypot(b.x-a.x,b.y-a.y);
  if(dist<2)return;
  ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=width;
  ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
  ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x-9*Math.cos(angle-.5),b.y-9*Math.sin(angle-.5));
  ctx.lineTo(b.x-9*Math.cos(angle+.5),b.y-9*Math.sin(angle+.5));ctx.closePath();ctx.fill();
}