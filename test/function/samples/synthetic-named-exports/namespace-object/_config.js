const assert = require('assert');

module.exports = {
	description:
		'supports re-exported synthetic exports in namespace objects with correct export precedence',
	options: {
		input: ['main', 'main2'],
		plugins: [
			{
				name: 'test-plugin',
				transform(code, id) {
					if (id.endsWith('synthetic.js')) {
						return {
							code,
							syntheticNamedExports: true
						};
					}
				}
			}
		]
	},
	exports(exports) {
		const synthetic = {
			__proto__: null,
			foo: 'foo',
			bar: 'synthetic-bar',
			baz: 'synthetic-baz',
			default: 'ignored'
		};
		synthetic.default = synthetic;
		assert.deepStrictEqual(exports, {
			synthetic: {
				__proto__: null,
				foo: 'synthetic-foo',
				bar: 'bar'
			}
		});
	}
};
