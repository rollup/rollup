module.exports = {
	description: 'Anonymous function declarations are hoisted',
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			importer: 'f.js',
			message: 'Circular dependency: f.js -> g.js -> f.js'
		}
	]
};
