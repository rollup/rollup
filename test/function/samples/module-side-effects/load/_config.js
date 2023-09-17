const assert = require('node:assert');
const path = require('node:path');
const sideEffects = [];

module.exports = defineTest({
	description: 'handles setting moduleSideEffects in the load hook',
	context: {
		sideEffects
	},
	exports() {
		assert.deepStrictEqual(sideEffects, [
			'sideeffects-null-load-null',
			'sideeffects-true-load-null',
			'sideeffects-false-load-true',
			'sideeffects-null-load-true',
			'sideeffects-true-load-true'
		]);
	},
	options: {
		treeshake: {
			moduleSideEffects(id) {
				if (id.includes('main')) return true;
				return JSON.parse(id.split('-')[1]);
			}
		},
		plugins: [
			{
				name: 'test-plugin',
				resolveId(id) {
					if (!path.isAbsolute(id)) {
						return id;
					}
				},
				load(id) {
					if (!path.isAbsolute(id)) {
						const moduleSideEffects = JSON.parse(id.split('-')[3]);
						return {
							code: `export const value = '${id}'; sideEffects.push(value);`,
							moduleSideEffects
						};
					}
				}
			}
		]
	}
});
