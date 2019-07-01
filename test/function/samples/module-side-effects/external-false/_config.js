const assert = require('assert');
const path = require('path');
const sideEffects = [];

module.exports = {
	description: 'supports setting module side effects to false for external modules',
	context: {
		require(id) {
			sideEffects.push(id);
			return { value: id };
		},
		sideEffects
	},
	exports() {
		assert.deepStrictEqual(sideEffects, ['pluginsideeffects-true', 'internal']);
	},
	options: {
		treeshake: {
			moduleSideEffects: 'no-external'
		},
		plugins: {
			name: 'test-plugin',
			resolveId(id) {
				if (!path.isAbsolute(id)) {
					if (id === 'internal') {
						return id;
					}
					if (id === 'implicit-external') {
						return null;
					}
					const moduleSideEffects = JSON.parse(id.split('-')[1]);
					if (moduleSideEffects) {
						return { id, moduleSideEffects, external: true };
					}
					return { id, external: true };
				}
			},
			load(id) {
				if (!path.isAbsolute(id)) {
					return `export const value = '${id}'; sideEffects.push(value);`;
				}
			}
		}
	},
	warnings: [
		{
			code: 'UNRESOLVED_IMPORT',
			importer: 'main.js',
			message:
				"'implicit-external' is imported by main.js, but could not be resolved – treating it as an external dependency",
			source: 'implicit-external',
			url: 'https://rollupjs.org/guide/en/#warning-treating-module-as-external-dependency'
		}
	]
};
