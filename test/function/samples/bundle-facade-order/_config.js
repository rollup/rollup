const assert = require('node:assert');

module.exports = defineTest({
	description: 'respects the order of entry points when there are additional facades for chunks',
	options: {
		input: {
			main: 'main',
			'main-alias': 'main',
			other: 'other'
		},
		plugins: [
			{
				name: 'test-plugin',
				generateBundle(options, bundle) {
					assert.deepStrictEqual(
						Object.keys(bundle).map(id => [id, bundle[id].code]),
						[
							['main.js', "'use strict';\n\nvar main = 'main1';\n\nmodule.exports = main;\n"],
							['other.js', "'use strict';\n\nvar other = 'main2';\n\nmodule.exports = other;\n"],
							[
								'main-alias.js',
								"'use strict';\n\nvar main = require('./main.js');\n\n\n\nmodule.exports = main;\n"
							]
						]
					);
				}
			}
		]
	}
});
