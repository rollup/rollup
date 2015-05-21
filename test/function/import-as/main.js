import { a as b, b as a, default as def } from './foo';

assert.equal(b, 'a');
assert.equal(a, 'b');
assert.equal(def, 'DEF');
