import { order } from './order.js';
import './side.js';
import { start } from './declare.js';

assert.deepStrictEqual(order, ['side', 'declare', 'use']);
assert.strictEqual(start(), 0);
