const path = require('node:path');
const commonjs = require('@rollup/plugin-commonjs');

module.exports = defineTest({
	description: 'the content of c.js is complete',
	options: {
		plugins: [
			commonjs(),
			{
				resolveId(id) {
					if (id === './c.js') {
						return {
							id: path.resolve('./c.js'),
							moduleSideEffects: false
						};
					}
				}
			}
		]
	}
});
