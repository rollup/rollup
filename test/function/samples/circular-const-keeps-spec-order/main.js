import { order } from './order.js';
import { first } from './first.js';

assert.deepStrictEqual(order, ['second', 'first']);
assert.strictEqual(first, 2);
