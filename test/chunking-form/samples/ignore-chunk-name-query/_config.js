const { loader } = require('../../../testHelpers.js');

module.exports = defineTest({
	description: 'ignores queries and hashes for chunk names when preserving modules',
	options: {
		input: ['a.js?query', 'b.js#hash'],
		output: { preserveModules: true },
		plugins: [
			loader({
				'a.js?query': "console.log('a');",
				'b.js#hash': "console.log('b');"
			})
		]
	}
});
