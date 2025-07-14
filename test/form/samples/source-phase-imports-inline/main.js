import source mod1 from './dep1.js';
import source mod2 from './dep1.js';
import source mod3 from './dep2.js';
import { mod4 } from './dep2.js';
import source mod5 from 'dep1';

// unused -> treeshaken since sources are pure
import source foo from './dep3.js';

console.log(mod1, mod2, mod3, mod4, mod5);
