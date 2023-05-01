const assert = require('node:assert');

let named;
let star;
let defaulted;

module.exports = defineTest({
	description: 'handles external live-bindings',
	options: {
		external: ['named', 'star', 'defaulted'],
		output: { interop: 'compat' }
	},
	context: {
		require(id) {
			switch (id) {
				case 'named': {
					named = {
						named: 1
					};
					return named;
				}
				case 'star': {
					star = {
						star: 1,
						// "export * from" does not forward default exports
						default: 'star-ignored'
					};
					Object.defineProperty(star, '__esModule', { value: true });
					return star;
				}
				case 'defaulted': {
					defaulted = {
						default: 1
					};
					Object.defineProperty(defaulted, '__esModule', { value: true });
					return defaulted;
				}
				default: {
					throw new Error(`Unexpected id ${id}.`);
				}
			}
		}
	},
	exports(exports) {
		assert.equal(exports.named, 1, 'named');
		named.named++;
		assert.equal(exports.named, 2, 'named');

		assert.equal(exports.star, 1, 'star');
		star.star++;
		assert.equal(exports.star, 2, 'star');

		assert.equal(exports.defaulted, 1, 'default');
		defaulted.default++;
		assert.equal(exports.defaulted, 2, 'default');

		// make sure the default is not reexported
		assert.equal(exports.default, undefined);
	}
});
