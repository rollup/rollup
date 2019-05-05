const assert = require('assert');
const sideEffects = [];

// TODO Lukas interaction with pureExternalModules, use as default?
// TODO Lukas handle other hooks
module.exports = {
	description:
		'handles conflicts between different resolveId results when all results are unknown or pure',
	context: {
		sideEffects,
		require(id) {
			sideEffects.push(id);
			return { value: id };
		}
	},
	exports() {
		assert.deepStrictEqual(sideEffects, []);
	},
	options: {
		plugins: {
			name: 'test-plugin',
			resolveId(id, importer) {
				const pure = importer && importer.endsWith('pure.js') ? true : null;
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
	},
	warnings: [
		{
			code: 'EMPTY_BUNDLE',
			message: 'Generated an empty bundle'
		}
	]
};
