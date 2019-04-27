import foo from './foo.js';
assert.equal(true ? (false ? foo : 0) : 1, 0);
