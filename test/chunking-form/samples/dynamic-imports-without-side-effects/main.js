// removed
const a = import('./sub.js');
const b = import('external');
// replace with await 0
const c = await import('./sub.js');
const d = await import('external');

// retained
const e = import('./sub2.js');
const f = import('external2');
const g = await import('./sub2.js');
const h = await import('external2');
