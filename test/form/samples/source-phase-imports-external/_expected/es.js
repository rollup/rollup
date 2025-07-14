import source mod2__source from './dep1.js';
import mod2$1 from './dep1.js';
import source dep2__source from 'dep2';

// TODO: reenable once https://github.com/nicolo-ribaudo/acorn-import-phases/pull/2 is resolved.
// import.source('./dep.js');

console.log(mod2__source);
console.log(mod2$1);
console.log(dep2__source);
