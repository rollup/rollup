// STATIC NAMESPACES
// ES6 modules let you import all of another module's
// exports as a namespace...
import * as assert from './assert';

// ...but we can statically resolve this to the
// original function definition
assert.equal(1 + 1, 2);
