import * as mod from './mod.js';

assert.strictEqual(typeof Object.getOwnProperty(mod, 'name').get, 'function');
