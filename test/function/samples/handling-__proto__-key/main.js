import * as module from './module.js';

assert.equal(module.__proto__, 0);
assert.equal({ ...module }.__proto__, 0);
