const assert = require('assert');
const sideEffects = [];

module.exports = {
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
				if (id[0] !== '/') {
					const moduleSideEffects = JSON.parse(id.split('-')[1]);
					if (moduleSideEffects) {
						return { id, moduleSideEffects };
					}
					return id;
				}
			},
			load(id) {
				if (id[0] !== '/') {
					return `export const value = '${id}'; sideEffects.push(value);`;
				}
			}
		}
	}
};
