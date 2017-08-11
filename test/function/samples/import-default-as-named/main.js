import fn1 from './foo';

import { default as fn2 } from './foo';

assert.equal(fn1(), 1);
assert.equal(fn2(), 1);
