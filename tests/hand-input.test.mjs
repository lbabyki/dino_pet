import assert from 'node:assert/strict';
import {test} from 'node:test';
import {handFeatures,PinchTracker,TwoHandRaiseTracker} from '../dist/hand-input.js';
import {MotionCommands} from '../dist/gestures.js';
function hand(){const a=Array.from({length:21},()=>({x:.5,y:.7,z:0}));a[0]={x:.5,y:.86,z:0};
 for(const [base,x] of [[5,.39],[9,.47],[13,.55],[17,.63]])for(let j=0;j<4;j++)a[base+j]={x,y:.66-j*.105,z:0};
 for(let i=1;i<=4;i++)a[i]={x:.43-i*.04,y:.79-i*.037,z:0};return a;}
function transform(a,roll,yaw,mirror=1){return a.map(p=>{const x=(p.x-.5)*mirror,y=p.y-.7,z=p.z??0;const rx=x*Math.cos(yaw)+z*Math.sin(yaw),rz=-x*Math.sin(yaw)+z*Math.cos(yaw);return{x:.5+rx*Math.cos(roll)-y*Math.sin(roll),y:.7+rx*Math.sin(roll)+y*Math.cos(roll),z:rz}})}
for(const mirror of [-1,1])for(const yaw of [0,.8,1.3])for(const roll of [0,Math.PI/2,Math.PI]){
 test(`Open and pinch: mirror ${mirror}, yaw ${yaw}, roll ${roll}`,()=>{
 const a=transform(hand(),roll,yaw,mirror);assert.equal(handFeatures(a,a,1).open,true);
 const pinched=hand();pinched[4]={...pinched[8]};const b=transform(pinched,roll,yaw,mirror),f=handFeatures(b,b,1),p=new PinchTracker();p.update(f,0);assert.equal(p.update(f,60),true);
 });
}
test('Pinch: ignore other fingers, survive jitter and release deliberately',()=>{const p=new PinchTracker();assert.equal(p.update({projected:.2,spatial:.9},0),false);assert.equal(p.update({projected:.2,spatial:.9},50),true);for(let n=100;n<400;n+=50)assert.equal(p.update({projected:.53,spatial:.46},n),true);assert.equal(p.update({projected:.9,spatial:.9},400),true);assert.equal(p.update({projected:.9,spatial:.9},550),false)});
test('Brief contact does not grab; world space catches a rotated pinch',()=>{const p=new PinchTracker();p.update({projected:.2,spatial:null},0);assert.equal(p.update({projected:1,spatial:null},30),false);p.update({projected:.6,spatial:.2},100);assert.equal(p.update({projected:.6,spatial:.2},160),true)});
test('Two raised hands debounce, survive short dropout, lower after grace',()=>{const p=new TwoHandRaiseTracker(),a=hand().map(p=>({...p,y:p.y-.4}));assert.equal(p.update([a],0),false);assert.equal(p.update([a,a],100),false);assert.equal(p.update([a,a],320),true);assert.equal(p.update([a],400),true);assert.equal(p.update([a,a],500),true);assert.equal(p.update([],600),true);assert.equal(p.update([],1000),false);assert.equal(p.update([hand(),hand()],1100),false)});
const base={w:1000,h:600,open:true,pointing:false,pinching:false,fist:false,thumbUp:false,dragging:false,x:500,y:180,motionX:500};
test('Palm movement triggers sit across targets despite stationary tip',()=>{for(const hit of [null,'head','food','body','bed']){const p=new MotionCommands();assert.equal(p.update({...base,hit,now:0,motionY:100}),null);assert.equal(p.update({...base,hit,now:300,motionY:200}),'sit')}});
test('Open hand briefly occluded during descent still sits once',()=>{const p=new MotionCommands();p.update({...base,now:0,motionY:100});p.update({...base,now:100,motionY:120,open:false});assert.equal(p.update({...base,now:180,motionY:190}),'sit');assert.equal(p.update({...base,now:2200,motionY:300}),null)});
