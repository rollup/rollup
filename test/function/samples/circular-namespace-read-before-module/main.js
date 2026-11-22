import { mainNamespace } from './dep.js';

export const value = 'initialized';

assert.strictEqual(mainNamespace.value, 'initialized');
