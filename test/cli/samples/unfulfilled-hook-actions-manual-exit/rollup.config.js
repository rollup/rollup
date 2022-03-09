const path = require('path');

let resolveA;
const waitForA = new Promise(resolve => (resolveA = resolve));

module.exports = {
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
					return waitForA.then(() => {
						console.error('Manual exit');
						process.exit(1);
						return new Promise(() => {});
					});
				}
			}
		}
	],
	output: {
		format: 'es'
	}
};
