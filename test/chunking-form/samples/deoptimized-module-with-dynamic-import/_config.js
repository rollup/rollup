const path = require('node:path');

module.exports = defineTest({
	description: 'deoptimized module with dynamic import',
	options: {
		plugins: [
			{
				resolveId(id) {
					if (id === './lazy-loader.js') {
						return {
							id: path.resolve('./lazy-loader.js'),
							moduleSideEffects: false
						};
					}
				}
			}
		]
	}
});
