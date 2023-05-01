const assert = require('node:assert');

module.exports = defineTest({
	description: 'handles external live-bindings',
	options: {
		external: ['named', 'star'],
		output: { compact: true }
	},
	context: {
		require(id) {
			switch (id) {
				case 'named': {
					const exports = {
						named: 0,
						incrementNamed() {
							exports.named++;
						}
					};
					return exports;
				}
				case 'star': {
					const exports = {
						star: 0,
						incrementStar() {
							exports.star++;
						}
					};
					return exports;
				}
				default: {
					throw new Error(`Unexpected id ${id}`);
				}
			}
		}
	},
	exports(exports) {
		assert.equal(exports.named, 0, 'named');
		exports.incrementNamed();
		assert.equal(exports.named, 1, 'named');

		assert.equal(exports.star, 0, 'star');
		exports.incrementStar();
		assert.equal(exports.star, 1, 'star');
	}
});
