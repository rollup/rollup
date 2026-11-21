const assert = require('node:assert/strict');
const path = require('node:path');

module.exports = defineTest({
	description:
		'creates namespace objects early if a module in a cycle reads them in JSX before their module ran',
	options: {
		jsx: {
			factory: 'h',
			importSource: path.join(__dirname, 'h.js'),
			mode: 'classic'
		},
		output: { exports: 'named' }
	},
	warnings(warnings) {
		assert.deepStrictEqual(
			warnings.map(({ code }) => code),
			['CIRCULAR_DEPENDENCY']
		);
	}
});
