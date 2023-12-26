import * as module from './module.js';

assert.equal(module.__proto__, 1);
assert.equal(Object.freeze(module).__proto__, 1);
assert.equal({ ...module }.__proto__, 1);
