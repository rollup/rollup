const path = require('node:path');

const ID_UTILS = path.join(__dirname, 'utils.js');

module.exports = defineTest({
	description:
		'renders the namespace object when a module exports its own namespace and preserves modules',
	options: {
		output: {
			preserveModules: true
		}
	},
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_UTILS, ID_UTILS],
			message: 'Circular dependency: utils.js -> utils.js'
		}
	]
});
