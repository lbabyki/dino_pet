const distance=(a,b,aspect=1)=>Math.hypot((a.x-b.x)*aspect,a.y-b.y);
const distance3=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,(a.z??0)-(b.z??0));
const angle=(a,b,c)=>{const u=[a.x-b.x,a.y-b.y,(a.z??0)-(b.z??0)],v=[c.x-b.x,c.y-b.y,(c.z??0)-(b.z??0)];const n=Math.hypot(...u)*Math.hypot(...v);return n?Math.acos(Math.max(-1,Math.min(1,u.reduce((s,x,i)=>s+x*v[i],0)/n)))*180/Math.PI:0};
// Projected tip contact is accepted in any hand pose; other fingers never veto it.
// World-space distance additionally supports foreshortened/rotated palms.
export function handFeatures(lm,world=null,aspect=4/3){
 const scale=Math.max(distance(lm[0],lm[9],aspect),distance(lm[5],lm[17],aspect)*1.15,distance(lm[0],lm[5],aspect),distance(lm[0],lm[17],aspect),.035);
 const projected=distance(lm[4],lm[8],aspect)/scale;
 const spatial=world?.length===21?distance3(world[4],world[8])/Math.max(distance3(world[0],world[9]),distance3(world[5],world[17])*1.15,.012):null;
 const source=world?.length===21?world:lm;
 const extended=[8,12,16,20].map(tip=>{const i=tip-3;return (angle(source[i],source[i+1],source[i+2])>145&&angle(source[i+1],source[i+2],source[tip])>135)||distance(lm[tip],lm[0],aspect)>distance(lm[tip-2],lm[0],aspect)*1.13});
 const count=extended.filter(Boolean).length;
 const thumbUp=extended.filter(Boolean).length<=1&&lm[4].y<lm[3].y-.02&&lm[4].y<lm[5].y-.035&&distance(lm[4],lm[8],aspect)>scale*.4;
 const palm=[0,5,9,13,17].reduce((s,i)=>({x:s.x+lm[i].x/5,y:s.y+lm[i].y/5}),{x:0,y:0});
 return {projected,spatial,extended,palm,open:count>=3,pointing:extended[0]&&count===1,fist:count===0,thumbUp};
}
export class PinchTracker{
 constructor(){this.reset()}
 reset(){this.active=false;this.candidateAt=null;this.openAt=null;this.lastReleased=-Infinity}
 update(f,now){const {projected:p,spatial:q}=f;
  const close=p<.25||(p<.43&&(q===null||q<.65))||(q!==null&&q<.34&&p<.72);
  const separated=p>.68&&(q===null||q>.57);
  if(!this.active){this.openAt=null;if(close){this.candidateAt??=now;if(now-this.candidateAt>=45){this.active=true;this.candidateAt=null}}else this.candidateAt=null}
  else{this.candidateAt=null;if(separated){this.openAt??=now;if(now-this.openAt>=140){this.active=false;this.openAt=null;this.lastReleased=now}}else this.openAt=null}
  return this.active;
 }
}
export class TwoHandRaiseTracker{
 constructor(){this.reset()}
 reset(){this.active=false;this.raisedAt=null;this.loweredAt=null;this.strength=0;this.levels=[0,0]}
 update(hands,now){const palms=hands.slice(0,2).map(h=>[0,5,9,13,17].reduce((s,i)=>({x:s.x+h[i].x/5,y:s.y+h[i].y/5}),{x:0,y:0})).sort((a,b)=>b.x-a.x);
  const raised=palms.length===2&&palms.every(p=>p.y<(this.active?.9:.53));
  if(raised){this.loweredAt=null;this.raisedAt??=now;if(now-this.raisedAt>=200)this.active=true;this.levels=palms.map(p=>Math.max(0,Math.min(1,(.8-p.y)/.56)));this.strength=(this.levels[0]+this.levels[1])/2}
  else{this.raisedAt=null;if(this.active){this.loweredAt??=now;if(now-this.loweredAt>350)this.active=false}if(!this.active){this.strength=0;this.levels=[0,0]}}
  return this.active;
 }

}

// A fist can naturally bring thumb/index together. Only the bed's contextual
// sleep interaction overrides pinch; an existing drag always keeps priority.
export function isSleepIntent(f,overBed,dragging){return overBed&&!dragging&&!f.thumbUp&&!f.pointing&&f.extended.filter(Boolean).length<=1}
export class TwoHandWaveTracker{
 constructor(){this.reset()}
 reset(){this.channels=[];this.offsets=[0,0];this.waving=false;this.lastTime=null}
 update(hands,now){
  const dt=Math.min(.15,Math.max(.008,(now-(this.lastTime??now-33))/1000));this.lastTime=now;
  if(hands.length!==2){this.reset();return this.offsets}
  // Mirror camera coordinates, then maintain one channel per screen-side hand.
  const signals=hands.map(lm=>{const f=handFeatures(lm);const tips=[8,12,16,20].reduce((s,i)=>s+lm[i].x/4,0);return {x:1-f.palm.x,signal:1-f.palm.x-(tips-lm[0].x)*.6,open:f.open}}).sort((a,b)=>a.x-b.x);
  this.offsets=signals.map((v,i)=>{let c=this.channels[i];if(!c)c=this.channels[i]={center:v.signal,filtered:v.signal,movedAt:-Infinity};const prior=c.filtered;c.filtered+=(v.signal-c.filtered)*(1-Math.exp(-dt*16));c.center+=(c.filtered-c.center)*(1-Math.exp(-dt*1.8));const delta=c.filtered-c.center;if(v.open&&Math.abs(delta)>.014&&Math.abs(c.filtered-prior)/dt>.035)c.movedAt=now;return v.open?(Math.max(-.16,Math.min(.16,-delta*5))||0):0});
  this.waving=this.channels.every(c=>now-c.movedAt<500);return this.offsets;
 }
}
export function armAngle(side,{raised=false,celebrating=false,happy=false,held=false,wave=0,level=.7}={}){
 const base=raised?.4+1.55*Math.max(0,Math.min(1,level)):celebrating?1.55:happy?.9:held?1.1:.5;
 return side*base+(raised?Math.max(-.16,Math.min(.16,wave)):0);
}

// Point direction starts at the index PIP joint (6), never the wrist (0).
// Extend the visible index segment to obtain an explicit destination marker.
export function fingerAim(lm){const joint=lm[6],tip=lm[8],dx=tip.x-joint.x,dy=tip.y-joint.y;const length=Math.hypot(dx,dy);if(length<.012)return null;const gain=Math.min(2.4,.23/length);return {x:tip.x+dx*gain,y:tip.y+dy*gain,joint:{x:joint.x,y:joint.y}}}
