import source mod1 from './dep1.js';
import mod2 from './dep1.js';
import source mod3 from 'dep2';
import source mod4 from 'dep3'; // mod4 unreferenced -> should be tree-shaken

// TODO: reenable once https://github.com/nicolo-ribaudo/acorn-import-phases/pull/2 is resolved.
// import.source('./dep.js');

console.log(mod1);
console.log(mod2);
console.log(mod3);
