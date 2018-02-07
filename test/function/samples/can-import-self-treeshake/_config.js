module.exports = {
	description: 'direct self import',
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			importer: 'lib.js',
			message: 'Circular dependency: lib.js -> lib.js'
		},
		{
			code: 'EMPTY_BUNDLE',
			message: `Generated an empty bundle`
		}
	]
};
