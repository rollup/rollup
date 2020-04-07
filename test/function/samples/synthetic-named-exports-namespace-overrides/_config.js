const assert = require('assert');

module.exports = {
	description:
		'supports re-exported synthetic exports in namespace objects with correct export precedence',
	options: {
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
			dep: {
				__proto__: null,
				foo: 'foo',
				bar: 'bar',
				baz: 'synthetic-baz',
				default: 'not-overwritten',
				synthetic: {
					__proto__: null,
					foo: 'foo',
					bar: 'synthetic-bar',
					baz: 'synthetic-baz',
					default: {
						foo: 'synthetic-foo',
						bar: 'synthetic-bar',
						baz: 'synthetic-baz',
						default: 'not-in-namespace'
					}
				}
			}
		});
	}
};
