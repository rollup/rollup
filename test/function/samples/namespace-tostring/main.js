import * as foo from './foo';

assert.equal(Object.prototype.toString.call(foo), "[object Module]");
assert.equal(foo.bar, 42);
