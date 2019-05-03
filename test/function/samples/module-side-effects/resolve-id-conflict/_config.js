const assert = require('assert');
const sideEffects = [];

// TODO Lukas interaction with pureExternalModules, use as default?
// TODO Lukas resolvers without an opinion should not override pureness
module.exports = {
	solo: true,
	description: 'handles conflicts between different resolveId results',
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
