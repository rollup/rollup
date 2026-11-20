const assert = require('node:assert/strict');

module.exports = defineTest({
	description:
		'creates namespace objects early if they are reachable through a chain of namespaces',
	options: { output: { exports: 'named' } },
	warnings(warnings) {
		assert.deepStrictEqual(
			warnings.map(({ code }) => code),
			['CIRCULAR_DEPENDENCY', 'CIRCULAR_DEPENDENCY']
		);
	}
});
