const assert = require('assert');
const sideEffects = [];

module.exports = {
	description: 'handles setting moduleSideEffects in the transform hook',
	context: {
		sideEffects
	},
	exports() {
		assert.deepStrictEqual(sideEffects, [
			'sideeffects-null-1-null-2-null',
			'sideeffects-true-1-null-2-null',
			'sideeffects-false-1-true-2-null',
			'sideeffects-null-1-true-2-null',
			'sideeffects-true-1-true-2-null',
			'sideeffects-false-1-false-2-true',
			'sideeffects-null-1-false-2-true',
			'sideeffects-true-1-false-2-true',
			'sideeffects-false-1-null-2-true',
			'sideeffects-null-1-null-2-true',
			'sideeffects-true-1-null-2-true',
			'sideeffects-false-1-true-2-true',
			'sideeffects-null-1-true-2-true',
			'sideeffects-true-1-true-2-true'
		]);
	},
	options: {
		treeshake: {
			moduleSideEffects(id) {
				return JSON.parse(id.split('-')[1]);
			}
		},
		plugins: [
			{
				name: 'test-plugin-1',
				resolveId(id) {
					if (id[0] !== '/') {
						return id;
					}
				},
				load(id) {
					if (id[0] !== '/') {
						return `export const value = '${id}'; sideEffects.push(value);`;
					}
				},
				transform(code, id) {
					if (id[0] !== '/') {
						const moduleSideEffects = JSON.parse(id.split('-')[3]);
						return {
							code,
							moduleSideEffects
						};
					}
				}
			},
			{
				name: 'test-plugin-2',
				transform(code, id) {
					if (id[0] !== '/') {
						const moduleSideEffects = JSON.parse(id.split('-')[5]);
						return {
							code,
							moduleSideEffects
						};
					}
				}
			}
		]
	}
};
