const assert = require('node:assert');
const path = require('node:path');
const sideEffects = [];

module.exports = defineTest({
	description: 'supports setting module side effects to false for all modules',
	context: {
		require(id) {
			sideEffects.push(id);
			return { value: id };
		},
		sideEffects
	},
	exports() {
		assert.deepStrictEqual(sideEffects, ['pluginsideeffects-true']);
	},
	options: {
		external: ['external'],
		treeshake: {
			moduleSideEffects: false
		},
		plugins: {
			name: 'test-plugin',
			resolveId(id) {
				if (!path.isAbsolute(id)) {
					const moduleSideEffects = JSON.parse(id.split('-')[1]);
					if (moduleSideEffects) {
						return { id, moduleSideEffects };
					}
					return id;
				}
			},
			load(id) {
				if (!path.isAbsolute(id)) {
					return `export const value = '${id}'; sideEffects.push(value);`;
				}
			}
		}
	}
});
