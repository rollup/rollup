module.exports = {
	description: 'direct self import',
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			importer: 'lib.js',
			message: 'Circular dependency: lib.js -> lib.js'
		},
		{
			chunkName: 'main',
			code: 'EMPTY_BUNDLE',
			message: `Generated an empty chunk: "main"`
		}
	]
};
