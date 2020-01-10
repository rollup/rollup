import('./dep-inlined-via-resolveId.js').then(console.log);
import('./dep-inlined-via-load.js').then(console.log);
import('./dep-inlined-via-transform.js').then(console.log);
import('./dep-not-inlined.js').then(console.log);

console.log('main');
