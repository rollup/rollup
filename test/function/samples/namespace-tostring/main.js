import * as foo from './foo';

assert.equal("" + foo, "[object Module]");
assert.equal(foo.bar, 42);
