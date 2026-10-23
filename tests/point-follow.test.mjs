import assert from 'node:assert/strict';
import {test} from 'node:test';
import {fingerAim,TwoHandRaiseTracker,armAngle} from '../dist/hand-input.js';
import {MotionCommands} from '../dist/gestures.js';
function h(x,y){const a=Array.from({length:21},()=>({x,y,z:0}));a[6]={x,y:y-.1};a[8]={x:x+.05,y:y-.2};return a}
test('Direction is invariant to wrist movement, follows index joint rotation',()=>{const lm=h(.5,.5),a=fingerAim(lm);lm[0]={x:.9,y:.1,z:0};assert.deepEqual(fingerAim(lm),a);lm[6]={x:.6,y:.3};assert.ok(fingerAim(lm).x<lm[8].x);lm[6]={...lm[8]};assert.equal(fingerAim(lm),null)});
test('Mirror reverses horizontal aiming direction',()=>{const lm=h(.5,.5),a=fingerAim(lm),b=fingerAim(lm.map(p=>({...p,x:1-p.x})));assert.ok(Math.abs(a.x+b.x-1)<1e-10);assert.equal(a.y,b.y)});
test('Two hands keep following at lower positions and independently',()=>{const t=new TwoHandRaiseTracker();t.update([h(.25,.35),h(.75,.35)],0);assert.equal(t.update([h(.25,.35),h(.75,.35)],250),true);assert.equal(t.update([h(.75,.75),h(.25,.25)],300),true);assert.ok(t.levels[0]<.15);assert.ok(t.levels[1]>.95);const lower=Math.abs(armAngle(-1,{raised:true,level:t.levels[0]})),upper=Math.abs(armAngle(1,{raised:true,level:t.levels[1]}));assert.ok(upper-lower>1.2);assert.equal(t.update([h(.75,.78),h(.25,.78)],350),true);assert.ok(t.levels.every(n=>n<.1));t.update([],400);assert.equal(t.update([],800),false);assert.deepEqual(t.levels,[0,0])});
test('Come uses aimed floor target even when fingertip overlaps pet',()=>{const m=new MotionCommands(),s={w:1000,h:600,x:500,y:300,pointing:true,hit:'head',aimX:700,aimY:450,aimHit:null};assert.equal(m.update({...s,now:0}),null);assert.equal(m.update({...s,now:1150}),'come')});
test('Moving aim cancels dwell even with stationary fingertip',()=>{const m=new MotionCommands(),s={w:1000,h:600,x:500,y:300,pointing:true,hit:null,aimY:450,aimHit:null};for(let now=0;now<2000;now+=100)assert.equal(m.update({...s,now,aimX:600+now*.2}),null)});
