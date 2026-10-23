// Apply recovery only while actually sleeping, in seconds, independent of FPS.
export function recoverEnergy(current,asleep,seconds){return Math.max(0,Math.min(100,current+(asleep?Math.max(0,seconds):0)))}
