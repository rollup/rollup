import { DEP } from './dep.js';

import('./m.js').then(m => console.log(m, DEP));
