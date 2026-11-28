import * as dep from './dep.js';

export const value = 'initialized';

assert.deepStrictEqual(Object.keys(dep.main), ['value']);
assert.strictEqual(dep.main.value, 'initialized');
