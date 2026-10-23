import assert from 'node:assert/strict';
import {MotionCommands} from '../dist/gestures.js';
const base={w:1000,h:500,hit:null,dragging:false,pinching:false,open:false,pointing:false,fist:false,thumbUp:false,x:600,y:200};
function replay(points){const m=new MotionCommands();return points.map(p=>m.update({...base,...p})).filter(Boolean)}
function held(pose,duration=1500){return Array.from({length:Math.ceil(duration/50)+1},(_,i)=>({...pose,now:i*50}))}
assert.deepEqual(replay([{now:0,open:true,y:100},{now:300,open:true,y:200}]),['sit']);
assert.deepEqual(replay([{now:0,open:true,y:300},{now:300,open:true,y:190}]),['stand']);
for(const direction of [-1,1]){
 const circle=Array.from({length:65},(_,i)=>({now:i*25,pointing:true,x:650+70*Math.cos(i/64*Math.PI*2*direction),y:220+70*Math.sin(i/64*Math.PI*2*direction)}));
 assert.deepEqual(replay(circle),['spin']);
 assert.deepEqual(replay(circle.map(p=>({...p,dragging:true}))),[]);
}
assert.deepEqual(replay(held({fist:true,hit:'bed'})),['sleep']);
assert.deepEqual(replay(held({fist:true})),[]);
assert.deepEqual(replay(held({thumbUp:true})),['praise']);
assert.deepEqual(replay(held({pointing:true})),['come']);
assert.deepEqual(replay(held({pointing:true,hit:'head'})),[]);
assert.deepEqual(replay(held({open:true,hit:'head'})),[]);
assert.deepEqual(replay(held({thumbUp:true,dragging:true})),[]);
assert.deepEqual(replay(held({fist:true,hit:'bed'},600)),[]);
assert.deepEqual(replay(held({pointing:true},600)),[]);
assert.deepEqual(replay(Array.from({length:60},(_,i)=>({now:i*50,pointing:true,x:600+i*5,y:200}))),[]);
// Release the sleep pose, then an open-hand raise can wake the pet.
const m=new MotionCommands();let commands=[];
for(const p of held({fist:true,hit:'bed'}))commands.push(m.update({...base,...p}));
for(const p of [{now:2000,open:true,y:320},{now:2200,open:true,y:320},{now:3500,open:true,y:320},{now:3800,open:true,y:200}])commands.push(m.update({...base,...p}));
assert.deepEqual(commands.filter(Boolean),['sleep','stand']);
console.log('PASS: 17 gesture replay cases (circle both directions, sit/stand, sleep/wake, praise, come, hold thresholds and conflict suppression)');
