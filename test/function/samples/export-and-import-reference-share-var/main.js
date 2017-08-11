import { a } from './foo';

// This variable declaration is going to be altered because `b` needs to be
// re-written. We need to make sure that the `a` re-writing and the unaffected
// `c` declarator are not being clobbered by that alteration.
var a_ = a, b = 9, c = 'c';

assert.equal(a, 1);
assert.equal(a_, 1);
assert.equal(b, 9);
assert.equal(c, 'c');

export { b };
