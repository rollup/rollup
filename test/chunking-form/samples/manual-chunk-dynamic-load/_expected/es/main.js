const DEP = 'DEP';

import('./generated-m.js').then(m => console.log(m, DEP));

export { DEP as D };
