const assert = require('node:assert/strict');

const warnings = [];

module.exports = defineTest({
	description: 'reports warnings at generated locations for explicitly unmapped lines',
	options: {
		onLog(level, { code, loc }) {
			if (level === 'warn') warnings.push([code, loc?.line, loc?.column]);
		},
		plugins: [
			{
				name: 'prepend-generated-line',
				transform(code, id) {
					return {
						code: code.repeat(2),
						map: {
							mappings: [[], [[0, 0, 0, 0]]],
							names: [],
							sources: [id],
							sourcesContent: [code],
							version: 3
						}
					};
				}
			}
		]
	},
	bundle() {
		assert.deepEqual(warnings, [
			['THIS_IS_UNDEFINED', 1, 13],
			['THIS_IS_UNDEFINED', 1, 0]
		]);
	}
});
