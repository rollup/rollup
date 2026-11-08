import * as namespace from './reexport.js';

export const value = 'initialized';
export var hoisted = 'ready';
export default 'default';
export class Example {}

const values = { ...namespace };
assert.strictEqual(values.value, 'initialized');
assert.strictEqual(values.hoisted, 'ready');
assert.strictEqual(values.default, 'default');
assert.strictEqual(values.Example, Example);
assert.strictEqual(values.fn(), 'function');
