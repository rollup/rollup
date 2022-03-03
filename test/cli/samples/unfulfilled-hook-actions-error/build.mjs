import { rollup } from 'rollup';

let resolveA;
const waitForA = new Promise(resolve => (resolveA = resolve));

// The error must not be swallowed when using top-level-await
await rollup({
	input: './index.js',
	plugins: [
		{
			name: 'test',
			transform(code, id) {
				if (id.endsWith('a.js')) {
					resolveA();
					return new Promise(() => {});
				}
				if (id.endsWith('b.js')) {
					return waitForA.then(() => Promise.reject(new Error('Error must be displayed.')))
				}
			}
		}
	]
});
