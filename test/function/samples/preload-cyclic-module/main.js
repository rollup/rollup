/* main *//* use proxy */
import { foo as bar, extra } from './main.js';
export const foo = 'foo';
assert.strictEqual(bar, 'foo');
assert.strictEqual(extra, 'extra');

