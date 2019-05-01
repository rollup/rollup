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
			importer: 'main.js',
			message:
				"'mod' is imported by main.js, but could not be resolved – treating it as an external dependency",
			source: 'mod',
			url: 'https://rollupjs.org/guide/en#warning-treating-module-as-external-dependency'
		}
	]
};
