const assert = require('node:assert');
const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

const sideEffects = [];

module.exports = defineTest({
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
			exporter: 'implicit-external',
			id: ID_MAIN,
			message:
				'"implicit-external" is imported by "main.js", but could not be resolved – treating it as an external dependency.',
			url: 'https://rollupjs.org/troubleshooting/#warning-treating-module-as-external-dependency'
		}
	]
});
