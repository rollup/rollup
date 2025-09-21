// removed
const a = import('./sub.js');
const b = await import('./sub.js');
const c = import('external');
const d = await import('external');

// retained
const e = import('./sub2.js');
const f = await import('./sub2.js');
const g = import('external2');
const h = await import('external2');
