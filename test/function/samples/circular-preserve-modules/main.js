import { getSecond } from './first';
import { second, getFirst } from './second';

export { first } from './first.js';
export { second };

assert.strictEqual(getFirst(), 'first');
assert.strictEqual(getSecond(), 'second');
