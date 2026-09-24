import { order } from './order.js';
import { read } from './value.js';

assert.deepStrictEqual(order, ['class', 'value']);
assert.strictEqual(read(), 1);
