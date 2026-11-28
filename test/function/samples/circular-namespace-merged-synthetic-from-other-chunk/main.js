import { mainNamespace } from './dep.js';
export * from './synth.js';

export const value = 'initialized';

assert.strictEqual(mainNamespace.foo, 1);
assert.strictEqual(mainNamespace.value, 'initialized');
