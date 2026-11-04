import { '*' as syntheticStar } from './synthetic.js';

assert.strictEqual(syntheticStar, 'synthetic star');

let count = 0;
export { count as '*count' };
export function increment() {
	count++;
}
