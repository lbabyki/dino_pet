// Temporal commands consume normalized hand intent, never camera frames.
// Object grabs have priority. A held pose fires once and must be released.
export class MotionCommands {
  constructor(){this.reset();this.lastCommand=-Infinity;this.latched=false;this.neutralAt=null}
  reset(){this.openStart=null;this.lastOpenAt=-Infinity;this.points=[];this.pose=null;this.progress=0;this.pending=null;this.neutralAt=null;this.latched=false}
  update(s){const {now,x,y,w,h,open,pointing,pinching,hit,dragging,fist,thumbUp}=s;const mx=s.motionX??x,my=s.motionY??y;this.progress=0;this.pending=null;
    if(dragging||pinching){this.openStart=null;this.points=[];this.pose=null;return null}
    const released=this.latched&&(this.latchedPose==='open'?!open:this.latchedPose==='point'?!pointing:this.latchedPose==='thumb'?!thumbUp:!fist);
    if(released||(!open&&!pointing&&!fist&&!thumbUp)){this.neutralAt??=now;if(now-this.neutralAt>160)this.latched=false}else this.neutralAt=null;
    if(this.latched||now-this.lastCommand<1800)return null;
    const emit=cmd=>{this.lastCommand=now;this.latched=true;this.latchedPose=cmd==='sleep'?'fist':cmd==='praise'?'thumb':cmd==='spin'||cmd==='come'?'point':'open';this.openStart=null;this.points=[];this.pose=null;this.progress=1;return cmd};
    // Track the palm independently of fingertip cursor and scene hit-testing.
    // Crossing the pet, a bowl or the bed must not cancel a downward command.
    if(open&&!thumbUp){this.lastOpenAt=now;if(!this.openStart)this.openStart={x:mx,y:my,t:now};const dy=my-this.openStart.y,age=now-this.openStart.t;this.pending=dy>=0?'sit':'stand';this.progress=Math.min(.95,Math.abs(dy)/Math.max(38,h*.085));if(age>=100&&age<2400&&Math.abs(dy)>Math.max(38,h*.085)&&Math.abs(mx-this.openStart.x)<w*.35)return emit(dy>0?'sit':'stand');if(age>=2400)this.openStart={x:mx,y:my,t:now}}else if(now-this.lastOpenAt>200)this.openStart=null;
    if(pointing&&!hit){this.points.push({x,y,t:now});this.points=this.points.filter(p=>now-p.t<2400);if(this.points.length>=16){const xs=this.points.map(p=>p.x),ys=this.points.map(p=>p.y),cx=(Math.min(...xs)+Math.max(...xs))/2,cy=(Math.min(...ys)+Math.max(...ys))/2;let angle=0;for(let i=1;i<this.points.length;i++){const a=this.points[i-1],b=this.points[i];let d=Math.atan2(b.y-cy,b.x-cx)-Math.atan2(a.y-cy,a.x-cx);while(d>Math.PI)d-=2*Math.PI;while(d< -Math.PI)d+=2*Math.PI;angle+=d}const first=this.points[0],last=this.points.at(-1),spanX=Math.max(...xs)-Math.min(...xs),spanY=Math.max(...ys)-Math.min(...ys);if(spanX>Math.max(45,w*.045)&&spanY>Math.max(45,h*.08)){this.pending='spin';this.progress=Math.min(.95,Math.abs(angle)/(Math.PI*2));if(Math.abs(angle)>5.25&&Math.hypot(first.x-last.x,first.y-last.y)<Math.max(spanX,spanY)*.55)return emit('spin')}}}else this.points=[];
    const name=thumbUp?'praise':fist&&hit==='bed'?'sleep':pointing&&!(s.aimHit!==undefined?s.aimHit:hit)?'come':null;
    if(!name){if(this.pose?.name==='sleep'&&now-this.pose.lastSeen<180){this.pending='sleep';this.progress=Math.min(.99,(now-this.pose.t)/1200);return null}this.pose=null;return null}
    const px=name==='come'?(s.aimX??x):x,py=name==='come'?(s.aimY??y):y;
    if(!this.pose||this.pose.name!==name||Math.hypot(px-this.pose.x,py-this.pose.y)>(name==='sleep'?Math.max(44,w*.05):name==='praise'?Math.max(38,w*.045):name==='come'?Math.max(28,w*.03):18))this.pose={name,x:px,y:py,t:now};
    this.pose.lastSeen=now;
    const age=now-this.pose.t,duration=name==='praise'?700:name==='sleep'?1200:1100;
    if(this.pending!=='spin'){this.pending=name;this.progress=Math.min(1,age/duration)}
    if(age>=duration)return emit(name);return null;
  }
}
