const assert = require('assert');
const sideEffects = [];

module.exports = {
	description: 'handles conflicts between different resolveId results when one result is impure',
	context: {
		sideEffects,
		require(id) {
			sideEffects.push(id);
			return { value: id };
		}
	},
	exports() {
		assert.deepStrictEqual(sideEffects, ['external', 'internal']);
	},
	options: {
		plugins: {
			name: 'test-plugin',
			resolveId(id, importer) {
				const pure = importer && importer.endsWith('pure.js');
				switch (id) {
					case 'internal':
						return {
							external: false,
							id,
							pure
						};
					case 'external':
						return {
							external: true,
							id,
							pure
						};
				}
			},
			load(id) {
				if (id === 'internal') {
					return `export const value = '${id}'; sideEffects.push(value);`;
				}
			}
		}
	}
};
