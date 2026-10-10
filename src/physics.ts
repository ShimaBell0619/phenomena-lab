export const G = 1000;
export const EPSILON = 4;
export const DT = 1 / 120;
export const MAX_BODIES = 16;
export const SNAPSHOT_KEY = 'phenomena.gravity.v1';
export const PRESET_NAMES = ['Single Orbit', 'Binary Dance', 'Three-Body'] as const;
export type PresetName = typeof PRESET_NAMES[number];
export type Vec = { x: number; y: number };
export type Body = { id: string; name: string; mass: number; x: number; y: number; vx: number; vy: number; color: string };
export type Simulation = { bodies: Body[]; time: number; steps: number };
export type Snapshot = { version: 1; name: string; preset: PresetName; state: Simulation; speed: 0.5 | 1 | 2; trails: boolean; vectors: boolean };
export const COLORS = ['#F1B775','#7BE6D4','#B2A5F4','#FF9AA2','#79B8ED','#DFD07F','#CF98B9','#9CDAA3'] as const;
const MAX_ABS = 100000;
export const radius = (mass: number): number => Math.min(30, 2 + 0.5 * Math.sqrt(mass));

export function validateBody(body: Body): void {
  if (typeof body.id !== 'string' || !/^[a-zA-Z0-9-]{1,48}$/.test(body.id) ||
      typeof body.name !== 'string' || body.name.trim().length < 1 || body.name.length > 48 ||
      typeof body.color !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(body.color)) throw new Error('物体の識別情報が不正です。');
  for (const key of ['mass','x','y','vx','vy'] as const) {
    const value = body[key];
    if (typeof value !== 'number' || !Number.isFinite(value) || Math.abs(value) > MAX_ABS) throw new Error(key + ' は有限の数値で入力してください。');
  }
  if (body.mass < 0.1 || body.mass > 10000) throw new Error('質量は0.1から10000の範囲で入力してください。');
}
export function validateState(state: Simulation): void {
  if (!state || !Array.isArray(state.bodies) || state.bodies.length < 1 || state.bodies.length > MAX_BODIES)
    throw new Error('物体数は1から16の範囲にしてください。');
  if (!Number.isSafeInteger(state.steps) || state.steps < 0 || !Number.isFinite(state.time) ||
      state.time < 0 || state.time > 1e8 || Math.abs(state.time - state.steps * DT) > 1e-5)
    throw new Error('シミュレーション時間が不正です。');
  const ids = new Set<string>();
  for (const b of state.bodies) {
    validateBody(b);
    if (ids.has(b.id)) throw new Error('物体IDが重複しています。');
    ids.add(b.id);
  }
}
export function addBody(state: Simulation, body: Body): Simulation {
  validateBody(body);
  validateState(state);
  if (state.bodies.length >= MAX_BODIES) throw new Error('物体は最大16個までです。');
  if (state.bodies.some(b => b.id === body.id)) throw new Error('物体IDが重複しています。');
  return { ...state, bodies: [...state.bodies, {...body}] };
}
export function accelerations(bodies: readonly Body[]): Vec[] {
  const result: Vec[] = bodies.map(() => ({x:0,y:0}));
  for (let i=0;i<bodies.length;i++) for(let j=i+1;j<bodies.length;j++) {
    const a=bodies[i]!, b=bodies[j]!;
    const dx=b.x-a.x,dy=b.y-a.y;
    const softened = dx*dx+dy*dy+EPSILON*EPSILON;
    const factor=G/(softened*Math.sqrt(softened));
    result[i]!.x += factor*b.mass*dx;
    result[i]!.y += factor*b.mass*dy;
    result[j]!.x -= factor*a.mass*dx;
    result[j]!.y -= factor*a.mass*dy;
  }
  return result;
}
function combine(a:Body,b:Body):Body {
  const total=a.mass+b.mass;
  const primary=a.mass>=b.mass?a:b;
  return {...primary, mass:total,
    x:(a.x*a.mass+b.x*b.mass)/total,
    y:(a.y*a.mass+b.y*b.mass)/total,
    vx:(a.vx*a.mass+b.vx*b.mass)/total,
    vy:(a.vy*a.mass+b.vy*b.mass)/total
  };
}
export function mergeCollisions(bodies: readonly Body[]):Body[] {
  const remaining=bodies.map(b=>({...b}));
  let collided=true;
  while(collided) {
    collided=false;
    outer:for(let i=0;i<remaining.length;i++) for(let j=i+1;j<remaining.length;j++) {
      const a=remaining[i]!,b=remaining[j]!;
      if(Math.hypot(a.x-b.x,a.y-b.y)<=radius(a.mass)+radius(b.mass)){
        remaining[i]=combine(a,b);remaining.splice(j,1);collided=true;break outer;
      }
    }
  }
  return remaining;
}
export function step(state: Simulation):Simulation {
  validateState(state);
  const a0=accelerations(state.bodies);
  const dt2=DT*DT/2;
  const positions=state.bodies.map((b,i)=>({...b,
    x:b.x+b.vx*DT+a0[i]!.x*dt2,
    y:b.y+b.vy*DT+a0[i]!.y*dt2
  }));
  const a1=accelerations(positions);
  const moved=positions.map((b,i)=>({...b,
    vx:b.vx+(a0[i]!.x+a1[i]!.x)*DT/2,
    vy:b.vy+(a0[i]!.y+a1[i]!.y)*DT/2
  }));
  const result={bodies:mergeCollisions(moved),steps:state.steps+1,time:(state.steps+1)*DT};
  validateState(result);
  return result;
}
export function momentum(bodies:readonly Body[]):Vec {
  return bodies.reduce((p,b)=>({x:p.x+b.mass*b.vx,y:p.y+b.mass*b.vy}),{x:0,y:0});
}
export function totalEnergy(bodies:readonly Body[]):number {
  let k=0,p=0;
  for(const b of bodies)k+=0.5*b.mass*(b.vx*b.vx+b.vy*b.vy);
  for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++){
    const a=bodies[i]!,b=bodies[j]!;
    p-=G*a.mass*b.mass/Math.hypot(a.x-b.x,a.y-b.y,EPSILON);
  }
  return k+p;
}
export function preset(name:PresetName):Simulation {
  let bodies:Body[];
  if(name==='Single Orbit'){
    const m1=800,m2=5,d=160,M=m1+m2;
    const v=Math.sqrt(G*M*d*d/Math.pow(d*d+EPSILON*EPSILON,1.5));
    bodies=[
      {id:'sun',name:'Primary',mass:m1,x:-d*m2/M,y:0,vx:0,vy:-v*m2/M,color:COLORS[0]},
      {id:'orbit',name:'Orbiter',mass:m2,x:d*m1/M,y:0,vx:0,vy:v*m1/M,color:COLORS[1]}
    ];
  }else if(name==='Binary Dance'){
    const m=420,d=220,v=Math.sqrt(G*(2*m)*d*d/Math.pow(d*d+EPSILON*EPSILON,1.5))/2;
    bodies=[
      {id:'binary-a',name:'Aster',mass:m,x:-d/2,y:0,vx:0,vy:-v,color:COLORS[0]},
      {id:'binary-b',name:'Nyx',mass:m,x:d/2,y:0,vx:0,vy:v,color:COLORS[2]}
    ];
  }else if(name==='Three-Body'){
    bodies=[
      {id:'three-a',name:'Helios',mass:580,x:-35,y:6,vx:-2,vy:-6,color:COLORS[0]},
      {id:'three-b',name:'Iona',mass:8,x:162,y:0,vx:3,vy:63,color:COLORS[1]},
      {id:'three-c',name:'Ceres',mass:12,x:-232,y:-42,vx:-3,vy:-48,color:COLORS[2]}
    ];
  }else{throw new Error('未知のプリセットです。');}
  return {bodies,steps:0,time:0};
}
export function readSnapshot(raw:string|null):Snapshot {
  if(!raw)throw new Error('保存された実験がありません。');
  let obj:unknown;
  try{obj=JSON.parse(raw);}catch{throw new Error('保存データが破損しています。');}
  if(!obj||typeof obj!=='object')throw new Error('保存データの形式が不正です。');
  const s=obj as Partial<Snapshot>;
  if(s.version!==1||typeof s.name!=='string'||!s.name.trim()||s.name.length>64||
    !PRESET_NAMES.includes(s.preset as PresetName) ||
    ![0.5,1,2].includes(s.speed as number)||typeof s.trails!=='boolean'||typeof s.vectors!=='boolean')
    throw new Error('保存データのバージョンまたは設定が不正です。');
  validateState(s.state as Simulation);
  return s as Snapshot;
}
export function saveSnapshot(snapshot:Snapshot):string {
  return JSON.stringify(readSnapshot(JSON.stringify(snapshot)));
}