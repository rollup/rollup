import * as mod from './mod.js';

assert.strictEqual(typeof Object.getOwnPropertyDescriptor(mod, 'name').get, 'function');
