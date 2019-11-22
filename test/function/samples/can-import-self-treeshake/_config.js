module.exports = {
	description: 'direct self import',
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			cycle: ['lib.js', 'lib.js'],
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
