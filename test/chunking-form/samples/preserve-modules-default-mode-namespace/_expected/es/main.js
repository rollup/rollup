import * as lib from './lib.js';
export { lib };

console.log(lib);
import('./lib.js').then(console.log);
