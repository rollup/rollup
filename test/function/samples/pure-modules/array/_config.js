const assert = require('assert');
const sideEffects = [];

module.exports = {
	description: 'supports setting module side effects via an array',
	context: {
		require(id) {
			sideEffects.push(id);
			return { value: id };
		},
		sideEffects
	},
	exports() {
		assert.deepStrictEqual(sideEffects, [
			'pluginsideeffects-null-external-listed',
			'pluginsideeffects-true-external-listed',
			'pluginsideeffects-true',
			'pluginsideeffects-null-listed',
			'pluginsideeffects-true-listed'
		]);
	},
	options: {
		external: [
			'pluginsideeffects-null-external',
			'pluginsideeffects-true-external',
			'pluginsideeffects-null-external-listed',
			'pluginsideeffects-true-external-listed'
		],
		treeshake: {
			moduleSideEffects: [
				'pluginsideeffects-null-listed',
				'pluginsideeffects-true-listed',
				'pluginsideeffects-null-external-listed',
				'pluginsideeffects-true-external-listed'
			]
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
