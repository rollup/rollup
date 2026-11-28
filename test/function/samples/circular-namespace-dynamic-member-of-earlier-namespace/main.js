import * as dep from './dep.js';

export const value = 'initialized';
const key = 'main';

assert.strictEqual(typeof dep[key], 'object');
assert.strictEqual(dep[key].value, 'initialized');
