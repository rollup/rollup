import { count, incr } from './foo';

assert.equal(count, 0);
incr();
assert.equal(count, 1);
