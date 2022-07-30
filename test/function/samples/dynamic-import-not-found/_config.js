const path = require('path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = {
	description: 'warns if a dynamic import is not found',
	context: {
		require(id) {
			if (id === 'mod') {
				return {};
			}
		}
	},
	warnings: [
		{
			code: 'UNRESOLVED_IMPORT',
			exporter: 'mod',
			id: ID_MAIN,
			message:
				'"mod" is imported by "main.js", but could not be resolved – treating it as an external dependency.',
			url: 'https://rollupjs.org/guide/en/#warning-treating-module-as-external-dependency'
		}
	]
};
